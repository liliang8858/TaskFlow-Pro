import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useTodos, Todo } from '../context/TodoContext';

/**
 * 简单的向上汇报逻辑：
 * 
 * C → B → A
 * 
 * 1. 下级把任务发给上级
 * 2. 上级收到后，如果自己也有上级，就把所有任务（自己的+下级的）继续向上发
 * 3. 上级不会把任务发给下级（单向向上）
 */

export function usePeerSync() {
  const { todos, setTodos } = useTodos();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inboundCount, setInboundCount] = useState(0);
  const peerRef = useRef<Peer | null>(null);

  // 入站连接：下级连我
  const inboundConnections = useRef<DataConnection[]>([]);
  // 出站连接：我连上级
  const outboundConnection = useRef<DataConnection | null>(null);

  const todosRef = useRef(todos);
  const peerIdRef = useRef(peerId);

  useEffect(() => { todosRef.current = todos; }, [todos]);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);

  /**
   * 获取我的任务（本地创建的）
   */
  const getMyTodos = useCallback((): Todo[] => {
    const myId = peerIdRef.current;
    return todosRef.current.filter(t => !t.sourceId || t.sourceId === myId);
  }, []);

  /**
   * 向上级汇报所有任务（我的 + 下级的）
   */
  const reportToHost = useCallback(() => {
    const conn = outboundConnection.current;
    if (!conn || !conn.open) return;

    const allTodos = todosRef.current;
    const myId = peerIdRef.current;

    console.log(`[Report] Sending ${allTodos.length} todos to host`);

    conn.send({
      type: 'SYNC_TODOS',
      sourceId: myId,
      payload: allTodos
    });
  }, []);

  /**
   * 处理下级发来的数据
   */
  const handleInboundData = useCallback((conn: DataConnection, data: any) => {
    if (data?.type !== 'SYNC_TODOS' || !Array.isArray(data.payload)) {
      return;
    }

    const sourceId = data.sourceId || conn.peer;
    const myId = peerIdRef.current;

    if (sourceId === myId) return;

    console.log(`[Receive] Got ${data.payload.length} todos from: ${sourceId}`);

    setTodos(prev => {
      // 保留：我的任务 + 其他下级的任务
      const kept = prev.filter(t => {
        if (!t.sourceId || t.sourceId === myId) return true;
        return t.sourceId !== sourceId;
      });

      // 添加这个下级的任务
      const incoming: Todo[] = data.payload.map((t: any) => ({
        ...t,
        sourceId: sourceId
      }));

      return [...kept, ...incoming];
    });

    // 如果我有上级，继续向上汇报
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
        });

        // 下级连我
        newPeer.on('connection', (conn) => {
          console.log('[Peer] Subordinate connected:', conn.peer);

          conn.on('open', () => {
            inboundConnections.current = [...inboundConnections.current, conn];
            setInboundCount(inboundConnections.current.length);
          });

          conn.on('data', (data: any) => handleInboundData(conn, data));

          conn.on('close', () => {
            inboundConnections.current = inboundConnections.current.filter(c => c !== conn);
            setInboundCount(inboundConnections.current.length);
          });

          conn.on('error', () => {
            inboundConnections.current = inboundConnections.current.filter(c => c !== conn);
            setInboundCount(inboundConnections.current.length);
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

      setupPeer(savedId || undefined);
    };

    initPeer();

    return () => {
      mounted = false;
      peerRef.current?.destroy();
    };
  }, [handleInboundData]);

  /**
   * 连接上级
   */
  const connectToHost = useCallback((hostId: string) => {
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

        // 立即汇报所有任务
        const allTodos = todosRef.current;
        conn.send({
          type: 'SYNC_TODOS',
          sourceId: peerIdRef.current,
          payload: allTodos
        });
      });

      // 忽略上级发来的数据（单向向上）
      conn.on('data', () => {});

      conn.on('close', () => {
        clearTimeout(timeout);
        setIsConnected(false);
        outboundConnection.current = null;
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
    connectionsCount: inboundCount + (outboundConnection.current ? 1 : 0),
    connectToHost,
    isConnected,
    isReady: !!peerId
  };
}
