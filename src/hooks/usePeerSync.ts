import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useTodos, Todo } from '../context/TodoContext';

/**
 * 汇报人信息
 */
export interface Reporter {
  id: string;
  name: string;
  isOnline: boolean;
}

/**
 * P2P 单向向上汇报
 * 
 * 核心原则：
 * 1. 每个任务有唯一的 id (UUID) 和 ownerId (创建者)
 * 2. 任务无论如何流转，ownerId 永不改变
 * 3. 同步时按 ownerId 合并，相同 ownerId 的任务完全替换
 */
export function usePeerSync() {
  const { todos, setTodos } = useTodos();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [hostInfo, setHostInfo] = useState<Reporter | null>(null);
  const peerRef = useRef<Peer | null>(null);

  const inboundConnections = useRef<Map<string, DataConnection>>(new Map());
  const outboundConnection = useRef<DataConnection | null>(null);

  const todosRef = useRef(todos);
  const peerIdRef = useRef(peerId);

  useEffect(() => { todosRef.current = todos; }, [todos]);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);

  const getUserName = useCallback((): string => {
    return localStorage.getItem('taskflow_user_name') || '未命名';
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem('taskflow_user_name', name);
  }, []);

  /**
   * 向上级汇报所有任务
   * 任务保持原始的 ownerId，不做任何修改
   */
  const reportToHost = useCallback(() => {
    const conn = outboundConnection.current;
    if (!conn || !conn.open) return;

    const myId = peerIdRef.current;
    const myName = getUserName();

    console.log(`[Report] Sending ${todosRef.current.length} todos to host`);

    conn.send({
      type: 'SYNC_TODOS',
      senderId: myId,
      senderName: myName,
      payload: todosRef.current
    });
  }, [getUserName]);

  /**
   * 处理下级发来的数据
   * 按 ownerId 合并任务，保持任务归属不变
   */
  const handleInboundData = useCallback((conn: DataConnection, data: any) => {
    if (data?.type !== 'SYNC_TODOS' || !Array.isArray(data.payload)) {
      return;
    }

    const senderId = data.senderId || conn.peer;
    const senderName = data.senderName || '未命名';
    const myId = peerIdRef.current;

    if (senderId === myId) return;

    console.log(`[Receive] Got ${data.payload.length} todos from: ${senderName} (${senderId})`);

    // 更新汇报人名称
    setReporters(prev => {
      const existing = prev.find(r => r.id === senderId);
      if (existing && existing.name !== senderName) {
        return prev.map(r => r.id === senderId ? { ...r, name: senderName } : r);
      }
      return prev;
    });

    setTodos(prev => {
      // 收集所有收到的任务的 ownerId
      const incomingOwnerIds = new Set(data.payload.map((t: Todo) => t.ownerId));
      
      // 保留：我的任务 + 不在本次同步范围内的其他任务
      const kept = prev.filter(t => {
        // 保留我的任务
        if (t.ownerId === myId) return true;
        // 保留不在本次同步范围内的任务
        return !incomingOwnerIds.has(t.ownerId);
      });

      // 添加收到的任务（保持原始 ownerId 和 ownerName）
      const incoming: Todo[] = data.payload.map((t: any) => ({
        ...t,
        // 确保字段完整
        ownerId: t.ownerId || senderId,
        ownerName: t.ownerName || senderName
      }));

      // 按 id 去重（以收到的为准）
      const incomingIds = new Set(incoming.map(t => t.id));
      const finalKept = kept.filter(t => !incomingIds.has(t.id));

      console.log(`[Merge] Kept ${finalKept.length}, added ${incoming.length}`);
      return [...finalKept, ...incoming];
    });

    // 继续向上汇报
    setTimeout(() => {
      if (outboundConnection.current?.open) {
        reportToHost();
      }
    }, 50);
  }, [setTodos, reportToHost]);

  /**
   * 监听任务变化，向上汇报
   */
  useEffect(() => {
    if (outboundConnection.current?.open) {
      reportToHost();
    }
  }, [todos, reportToHost]);

  /**
   * 初始化 Peer
   */
  useEffect(() => {
    let mounted = true;

    const initPeer = async () => {
      const PeerClass = (await import('peerjs')).default;
      const savedId = localStorage.getItem('taskflow_peer_id');

      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ];

      const peerConfig = {
        debug: 1,
        config: { iceServers, iceCandidatePoolSize: 10 }
      };

      const setupPeer = (idToUse?: string, retryCount = 0) => {
        if (!mounted) return;

        const maxRetries = 3;
        const newPeer = idToUse 
          ? new PeerClass(idToUse, peerConfig) 
          : new PeerClass(peerConfig);

        newPeer.on('open', (id) => {
          if (!mounted) return;
          console.log('[Peer] My ID:', id);
          setPeerId(id);
          localStorage.setItem('taskflow_peer_id', id);

          // 自动连接上级
          const savedHostId = localStorage.getItem('taskflow_target_id');
          if (savedHostId && savedHostId !== id) {
            console.log('[Peer] Auto-connecting to saved host:', savedHostId);
            setTimeout(() => connectToHostInternal(savedHostId), 500);
          }
        });

        newPeer.on('connection', (conn) => {
          console.log('[Peer] Subordinate connected:', conn.peer);

          conn.on('open', () => {
            inboundConnections.current.set(conn.peer, conn);
            setReporters(prev => {
              if (prev.find(r => r.id === conn.peer)) {
                return prev.map(r => r.id === conn.peer ? { ...r, isOnline: true } : r);
              }
              return [...prev, { id: conn.peer, name: '未命名', isOnline: true }];
            });
          });

          conn.on('data', (data: any) => handleInboundData(conn, data));

          conn.on('close', () => {
            inboundConnections.current.delete(conn.peer);
            setReporters(prev => prev.map(r => 
              r.id === conn.peer ? { ...r, isOnline: false } : r
            ));
          });

          conn.on('error', () => {
            inboundConnections.current.delete(conn.peer);
            setReporters(prev => prev.map(r => 
              r.id === conn.peer ? { ...r, isOnline: false } : r
            ));
          });
        });

        newPeer.on('error', (err) => {
          console.error('[Peer] Error:', err);

          if (err.type === 'unavailable-id' && idToUse) {
            localStorage.removeItem('taskflow_peer_id');
            newPeer.destroy();
            setupPeer(undefined, 0);
            return;
          }

          if (['network', 'server-error', 'socket-error'].includes(err.type) && retryCount < maxRetries) {
            newPeer.destroy();
            setTimeout(() => setupPeer(idToUse, retryCount + 1), 2000 * (retryCount + 1));
            return;
          }

          if (err.type === 'disconnected' && peerRef.current) {
            setTimeout(() => peerRef.current?.reconnect(), 1000);
          }
        });

        newPeer.on('disconnected', () => {
          if (mounted && peerRef.current && !peerRef.current.destroyed) {
            setTimeout(() => peerRef.current?.reconnect(), 1000);
          }
        });

        peerRef.current = newPeer;
      };

      // 内部连接函数
      const connectToHostInternal = (hostId: string) => {
        const maxRetries = 5;
        const retryDelay = 1500;
        let retryCount = 0;

        const attemptConnect = () => {
          if (!peerRef.current?.id) {
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptConnect, retryDelay);
            }
            return;
          }

          if (peerRef.current.disconnected || peerRef.current.destroyed) {
            peerRef.current.reconnect();
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptConnect, retryDelay);
            }
            return;
          }

          console.log(`[Connect] Attempt ${retryCount + 1} to host: ${hostId}`);

          let conn: DataConnection;
          try {
            conn = peerRef.current.connect(hostId, {
              reliable: true,
              serialization: 'json'
            });
          } catch (err) {
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptConnect, retryDelay);
            }
            return;
          }

          const timeout = setTimeout(() => {
            if (!conn.open) {
              conn.close();
              if (retryCount < maxRetries) {
                retryCount++;
                attemptConnect();
              }
            }
          }, 8000);

          conn.on('open', () => {
            clearTimeout(timeout);
            console.log('[Connect] Connected to host!');
            setIsConnected(true);
            outboundConnection.current = conn;
            localStorage.setItem('taskflow_target_id', hostId);
            setHostInfo({ id: hostId, name: '上级', isOnline: true });

            // 立即汇报
            const myId = peerIdRef.current;
            const myName = localStorage.getItem('taskflow_user_name') || '未命名';
            conn.send({
              type: 'SYNC_TODOS',
              senderId: myId,
              senderName: myName,
              payload: todosRef.current
            });
          });

          conn.on('data', () => {});

          conn.on('close', () => {
            clearTimeout(timeout);
            setIsConnected(false);
            outboundConnection.current = null;
            setHostInfo(prev => prev ? { ...prev, isOnline: false } : null);
            setTimeout(() => attemptConnect(), 3000);
          });

          conn.on('error', () => {
            clearTimeout(timeout);
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptConnect, retryDelay);
            } else {
              setIsConnected(false);
              outboundConnection.current = null;
            }
          });
        };

        attemptConnect();
      };

      setupPeer(savedId || undefined);
    };

    initPeer();

    return () => {
      mounted = false;
      peerRef.current?.destroy();
    };
  }, [handleInboundData]);

  /**
   * 连接上级（外部调用）
   */
  const connectToHost = useCallback((hostId: string) => {
    localStorage.setItem('taskflow_target_id', hostId);
    
    const maxRetries = 5;
    const retryDelay = 1500;
    let retryCount = 0;

    const attemptConnect = () => {
      if (!peerRef.current?.id) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      if (peerRef.current.disconnected || peerRef.current.destroyed) {
        peerRef.current.reconnect();
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      console.log(`[Connect] Attempt ${retryCount + 1} to host: ${hostId}`);

      let conn: DataConnection;
      try {
        conn = peerRef.current.connect(hostId, {
          reliable: true,
          serialization: 'json'
        });
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      const timeout = setTimeout(() => {
        if (!conn.open) {
          conn.close();
          if (retryCount < maxRetries) {
            retryCount++;
            attemptConnect();
          }
        }
      }, 8000);

      conn.on('open', () => {
        clearTimeout(timeout);
        console.log('[Connect] Connected to host!');
        setIsConnected(true);
        outboundConnection.current = conn;
        setHostInfo({ id: hostId, name: '上级', isOnline: true });

        // 立即汇报
        const myId = peerIdRef.current;
        const myName = localStorage.getItem('taskflow_user_name') || '未命名';
        conn.send({
          type: 'SYNC_TODOS',
          senderId: myId,
          senderName: myName,
          payload: todosRef.current
        });
      });

      conn.on('data', () => {});

      conn.on('close', () => {
        clearTimeout(timeout);
        setIsConnected(false);
        outboundConnection.current = null;
        setHostInfo(prev => prev ? { ...prev, isOnline: false } : null);
        setTimeout(() => attemptConnect(), 3000);
      });

      conn.on('error', () => {
        clearTimeout(timeout);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        } else {
          setIsConnected(false);
          outboundConnection.current = null;
        }
      });
    };

    attemptConnect();
  }, []);

  return {
    peerId,
    connectionsCount: inboundConnections.current.size + (outboundConnection.current ? 1 : 0),
    connectToHost,
    isConnected,
    isReady: !!peerId,
    reporters,
    hostInfo,
    getUserName,
    setUserName
  };
}
