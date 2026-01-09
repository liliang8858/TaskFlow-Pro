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
 */
export function usePeerSync() {
  const { todos, setTodos } = useTodos();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reporters, setReporters] = useState<Reporter[]>([]); // 下级列表
  const [hostInfo, setHostInfo] = useState<Reporter | null>(null); // 上级信息
  const peerRef = useRef<Peer | null>(null);

  // 入站连接：下级连我
  const inboundConnections = useRef<Map<string, DataConnection>>(new Map());
  // 出站连接：我连上级
  const outboundConnection = useRef<DataConnection | null>(null);

  const todosRef = useRef(todos);
  const peerIdRef = useRef(peerId);

  useEffect(() => { todosRef.current = todos; }, [todos]);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);

  // 获取用户名
  const getUserName = useCallback((): string => {
    return localStorage.getItem('taskflow_user_name') || '未命名';
  }, []);

  // 设置用户名
  const setUserName = useCallback((name: string) => {
    localStorage.setItem('taskflow_user_name', name);
  }, []);

  /**
   * 向上级汇报所有任务（我的 + 下级的）
   * 保持每个任务的原始 sourceId
   */
  const reportToHost = useCallback(() => {
    const conn = outboundConnection.current;
    if (!conn || !conn.open) return;

    const allTodos = todosRef.current;
    const myId = peerIdRef.current;
    const myName = getUserName();

    // 确保我的任务有正确的 sourceId
    const todosToSend = allTodos.map(t => ({
      ...t,
      sourceId: t.sourceId || myId,
      sourceName: t.sourceName || ((!t.sourceId || t.sourceId === myId) ? myName : t.sourceName)
    }));

    console.log(`[Report] Sending ${todosToSend.length} todos to host`);

    conn.send({
      type: 'SYNC_TODOS',
      sourceId: myId,
      sourceName: myName,
      payload: todosToSend
    });
  }, [getUserName]);

  /**
   * 处理下级发来的数据
   */
  const handleInboundData = useCallback((conn: DataConnection, data: any) => {
    if (data?.type !== 'SYNC_TODOS' || !Array.isArray(data.payload)) {
      return;
    }

    const sourceId = data.sourceId || conn.peer;
    const sourceName = data.sourceName || '未命名';
    const myId = peerIdRef.current;

    if (sourceId === myId) return;

    console.log(`[Receive] Got ${data.payload.length} todos from: ${sourceName} (${sourceId})`);

    // 更新汇报人名称
    setReporters(prev => {
      const existing = prev.find(r => r.id === sourceId);
      if (existing) {
        if (existing.name !== sourceName) {
          return prev.map(r => r.id === sourceId ? { ...r, name: sourceName } : r);
        }
        return prev;
      }
      return prev;
    });

    setTodos(prev => {
      const kept = prev.filter(t => {
        if (!t.sourceId || t.sourceId === myId) return true;
        return t.sourceId !== sourceId;
      });

      const incoming: Todo[] = data.payload.map((t: any) => ({
        ...t,
        sourceId: sourceId,
        sourceName: sourceName
      }));

      return [...kept, ...incoming];
    });

    // 继续向上汇报（转发下级的任务给我的上级）
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
      // 使用固定的 ID
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
          // 固定保存 ID
          localStorage.setItem('taskflow_peer_id', id);

          // 自动连接上级
          const savedHostId = localStorage.getItem('taskflow_target_id');
          if (savedHostId && savedHostId !== id) {
            console.log('[Peer] Auto-connecting to saved host:', savedHostId);
            setTimeout(() => connectToHostInternal(savedHostId), 500);
          }
        });

        // 下级连我
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
            // ID 被占用，生成新的
            console.warn('[Peer] ID unavailable, generating new one');
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

      setupPeer(savedId || undefined);
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

          // 立即汇报所有任务，保持原始 sourceId
          const myId = peerIdRef.current;
          const myName = localStorage.getItem('taskflow_user_name') || '未命名';
          const todosToSend = todosRef.current.map(t => ({
            ...t,
            sourceId: t.sourceId || myId,
            sourceName: t.sourceName || ((!t.sourceId || t.sourceId === myId) ? myName : t.sourceName)
          }));
          conn.send({
            type: 'SYNC_TODOS',
            sourceId: myId,
            sourceName: myName,
            payload: todosToSend
          });
        });

        conn.on('data', () => {});

        conn.on('close', () => {
          clearTimeout(timeout);
          setIsConnected(false);
          outboundConnection.current = null;
          setHostInfo(prev => prev ? { ...prev, isOnline: false } : null);
          // 尝试重连
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

        // 立即汇报所有任务，保持原始 sourceId
        const myId = peerIdRef.current;
        const myName = localStorage.getItem('taskflow_user_name') || '未命名';
        const todosToSend = todosRef.current.map(t => ({
          ...t,
          sourceId: t.sourceId || myId,
          sourceName: t.sourceName || ((!t.sourceId || t.sourceId === myId) ? myName : t.sourceName)
        }));
        conn.send({
          type: 'SYNC_TODOS',
          sourceId: myId,
          sourceName: myName,
          payload: todosToSend
        });
      });

      conn.on('data', () => {});

      conn.on('close', () => {
        clearTimeout(timeout);
        setIsConnected(false);
        outboundConnection.current = null;
        setHostInfo(prev => prev ? { ...prev, isOnline: false } : null);
        // 尝试重连
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
