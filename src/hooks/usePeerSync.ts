import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useTodos } from '../context/TodoContext';

export function usePeerSync(isHost: boolean = false) {
  const { todos, setTodos } = useTodos();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);

  // Use refs to avoid closure traps - these always have the latest values
  const todosRef = useRef(todos);
  const peerIdRef = useRef(peerId);

  // Keep refs in sync with state
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);

  // Track which connection sent the update to avoid echoing back
  const skipConnectionRef = useRef<string | null>(null);
  // Track the original source of the update to prevent cycles
  const lastOriginRef = useRef<string | null>(null);
  // Flag to indicate if we are processing a remote update
  const isProcessingRemoteUpdate = useRef(false);

  // Common handler for incoming data
  const handleIncomingData = useCallback((conn: DataConnection, data: any) => {
    if (data?.type === 'SYNC_TODOS' && Array.isArray(data.payload)) {
      // Cycle detection: If the update originated from us, ignore it
      // Use ref to get latest peerId to avoid closure issues
      const currentPeerId = peerIdRef.current;
      if (data.origin === currentPeerId && currentPeerId !== null) {
        console.log('Ignored update originating from self via', conn.peer);
        return;
      }

      console.log('Received remote update from', conn.peer, 'origin:', data.origin);
      skipConnectionRef.current = conn.peer;
      lastOriginRef.current = data.origin || conn.peer;
      isProcessingRemoteUpdate.current = true;

      const incomingTodos = data.payload.map((t: any) => ({
        ...t,
        sourceId: t.sourceId || data.origin || conn.peer // Ensure sourceId is set
      }));

      setTodos((prev) => {
        const incomingSourceIds = new Set(incomingTodos.map((t: any) => t.sourceId));
        // Also include the direct peer and origin in case they deleted everything
        incomingSourceIds.add(conn.peer);
        if (data.origin) incomingSourceIds.add(data.origin);

        const keptTodos = prev.filter(t => {
          // Keep if it's my local task (no sourceId or sourceId === myPeerId)
          if (!t.sourceId || t.sourceId === currentPeerId) return true;

          // Keep if it's from a source NOT in the incoming batch
          return !incomingSourceIds.has(t.sourceId);
        });

        return [...keptTodos, ...incomingTodos];
      });
    }
  }, [setTodos]); // Removed peerId from deps since we use ref now

  // Broadcast changes to all connections when todos change locally
  useEffect(() => {
    // Only broadcast if we have connections
    if (connections.length > 0) {
      // Determine the origin of this update
      // If isProcessingRemoteUpdate is true, it means this update came from a remote peer
      // so preserve the original source (lastOriginRef.current)
      // Otherwise, it's a local update, so the origin is us (peerId)

      const isRemote = isProcessingRemoteUpdate.current;
      const origin = isRemote ? (lastOriginRef.current || skipConnectionRef.current) : peerId;

      // If we are processing a remote update, we only need to forward it to others
      // We do NOT need to send it back to the source (handled by skipConnectionRef)
      // And crucially, if it's a remote update, we must ensure we don't accidentally treat it as local later

      const payload = {
        type: 'SYNC_TODOS',
        payload: todos,
        origin: origin
      };

      connections.forEach(conn => {
        // Skip the connection that just sent us this update
        if (conn.peer === skipConnectionRef.current) {
          return;
        }
        if (conn.open) {
          conn.send(payload);
        }
      });

      // Reset after broadcast attempt
      // Use setTimeout to ensure we don't clear it too early in Strict Mode
      const timer = setTimeout(() => {
        skipConnectionRef.current = null;
        lastOriginRef.current = null;
        isProcessingRemoteUpdate.current = false;
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [todos, connections, peerId]);

  // Initialize Peer
  useEffect(() => {
    let mounted = true;

    const initPeer = async () => {
      const PeerClass = (await import('peerjs')).default;

      // Try to recover saved ID from localStorage
      const savedId = localStorage.getItem('taskflow_peer_id');

      // ICE servers for better connectivity
      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'stun:stun.stunprotocol.org:3478' }
      ];

      const peerConfig = {
        debug: 1,
        config: {
          iceServers,
          iceCandidatePoolSize: 10
        }
      };

      const setupPeer = (idToUse?: string, retryCount = 0) => {
        if (!mounted) return;

        const maxSetupRetries = 3;
        const newPeer = idToUse 
          ? new PeerClass(idToUse, peerConfig) 
          : new PeerClass(peerConfig);

        newPeer.on('open', (id) => {
          if (!mounted) return;
          console.log('My Peer ID is: ' + id);
          setPeerId(id);
          // Persist the successful ID
          localStorage.setItem('taskflow_peer_id', id);
        });

        newPeer.on('connection', (conn) => {
          // Allow all incoming connections to support multi-level reporting (Mesh/Tree topology)
          console.log('Incoming connection:', conn.peer);

          conn.on('open', () => {
            setConnections(prev => [...prev, conn]);
            // Send initial state to the new client - use refs for latest values
            conn.send({
              type: 'SYNC_TODOS',
              payload: todosRef.current,
              origin: peerIdRef.current
            });
          });

          conn.on('data', (data: any) => {
            if (data?.type === 'SYNC_TODOS' && Array.isArray(data.payload)) {
              // Cycle detection: If the update originated from us, ignore it
              // Use ref to get latest peerId to avoid closure issues
              const currentPeerId = peerIdRef.current;
              if (data.origin === currentPeerId && currentPeerId !== null) {
                console.log('Ignored update originating from self via', conn.peer);
                return;
              }

              console.log('Received remote update from', conn.peer, 'origin:', data.origin);
              skipConnectionRef.current = conn.peer;
              lastOriginRef.current = data.origin || conn.peer;
              isProcessingRemoteUpdate.current = true;

              // Merge logic:
              // 1. Identify the source of the incoming data (data.origin or conn.peer)
              // 2. We want to update OUR state with this remote data.
              // 3. Since we want to support aggregation, we shouldn't just replace everything.
              //    However, the payload IS the full state of that remote node.
              //    So we should replace all tasks that belong to that remote node (or its downstream).
              //    
              //    Wait, if A sends to B, B's payload includes A's tasks.
              //    So if we are C receiving from B, we get A+B.
              //    We should replace all tasks in our state that are NOT "ours" (local)?
              //    No, we might have multiple connections (D, E). receiving from B shouldn't wipe D's tasks.

              //    Refined Logic:
              //    The payload contains a list of Todos. Each Todo should ideally have a sourceId.
              //    But currently Todos in payload might not have sourceId if they are from old version.
              //    Let's assume we patch them.

              const incomingTodos = data.payload.map((t: any) => ({
                ...t,
                sourceId: t.sourceId || data.origin || conn.peer // Ensure sourceId is set
              }));

              setTodos((prev) => {
                // We want to keep:
                // 1. Local tasks (sourceId is undefined or myPeerId)
                // 2. Tasks from OTHER connections (not involved in this update)

                // The incoming payload represents the "Truth" from that branch of the network.
                // So we should replace any tasks that match IDs in the incoming payload?
                // Or better: Remove any task that came from the SAME origin as this update, and add new ones?
                // But 'origin' is just the root source.

                // Simpler approach for now:
                // Create a Map of existing tasks.
                // Update with incoming tasks.
                // BUT, if a task was deleted in the incoming payload, we need to delete it here too.
                // This requires knowing which tasks "belong" to this connection channel.
                // Since we are in a mesh/tree, it's hard to know exactly which tasks belong to this channel without tracking.

                // Hack for "Ultrathink":
                // We trust the incoming payload contains EVERYTHING from that peer's view.
                // If we are C, and B sends us data. B's data includes A.
                // We should assume B knows best about A and B.
                // But B doesn't know about D (my other friend).
                // So we need to merge B's view with my view of D and Myself.

                // How to distinguish?
                // We can't easily unless we know the topology.
                // BUT, if we use `sourceId`, we can say:
                // "Replace all tasks where sourceId is in the set of sourceIds present in the incoming payload?"
                // No, what if a sourceId was completely removed (all tasks deleted)?

                // Alternative: 
                // Just merge by ID. The latest timestamp wins? We don't have good timestamps for updates.

                // Let's stick to the "sourceId" segregation.
                // If we receive data from B, and the data contains tasks from A and B.
                // We replace all local tasks that are marked as sourceId=A or sourceId=B.

                const incomingSourceIds = new Set(incomingTodos.map((t: any) => t.sourceId));
                // Also include the direct peer and origin in case they deleted everything
                incomingSourceIds.add(conn.peer);
                if (data.origin) incomingSourceIds.add(data.origin);

                const keptTodos = prev.filter(t => {
                  // Keep if it's my local task (no sourceId or sourceId === myPeerId)
                  if (!t.sourceId || t.sourceId === currentPeerId) return true;

                  // Keep if it's from a source NOT in the incoming batch
                  // This is risky if the incoming batch represents a "state" where some source was removed.
                  // But for now, it's safer than wiping.
                  return !incomingSourceIds.has(t.sourceId);
                });

                return [...keptTodos, ...incomingTodos];
              });
            }
          });

          conn.on('close', () => {
            setConnections(prev => prev.filter(c => c !== conn));
          });

          conn.on('error', (err) => {
            console.error('Connection error:', err);
            setConnections(prev => prev.filter(c => c !== conn));
          });
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);

          // If the saved ID is unavailable (e.g. taken), retry with a random ID
          if (err.type === 'unavailable-id' && idToUse) {
            console.warn('Saved ID is unavailable, falling back to new ID');
            localStorage.removeItem('taskflow_peer_id');
            newPeer.destroy();
            setupPeer(undefined, 0);
            return;
          }

          // Retry on network/server errors
          if ((err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error') && retryCount < maxSetupRetries) {
            console.warn(`Peer setup failed (${err.type}), retrying... (${retryCount + 1}/${maxSetupRetries})`);
            newPeer.destroy();
            setTimeout(() => {
              setupPeer(idToUse, retryCount + 1);
            }, 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }

          if (err.type === 'peer-unavailable') {
            console.warn('The requested peer was not found.');
          }

          // If disconnected, try to reconnect
          if (err.type === 'disconnected' && peerRef.current) {
            console.warn('Peer disconnected, attempting to reconnect...');
            setTimeout(() => {
              peerRef.current?.reconnect();
            }, 1000);
          }
        });

        // Handle disconnection
        newPeer.on('disconnected', () => {
          console.warn('Peer disconnected from server, attempting to reconnect...');
          if (mounted && peerRef.current && !peerRef.current.destroyed) {
            setTimeout(() => {
              peerRef.current?.reconnect();
            }, 1000);
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
  }, [isHost]); // Removed todos from dependency to avoid re-init

  // Connect to a Host with retry mechanism
  const connectToHost = useCallback((hostId: string) => {
    const maxRetries = 5;
    const retryDelay = 1500;
    let retryCount = 0;
    let currentConn: DataConnection | null = null;

    const attemptConnect = () => {
      if (!peerRef.current) {
        console.warn('Peer not initialized, waiting...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      // Check if peer is ready (has an ID)
      if (!peerRef.current.id) {
        console.warn('Peer not ready (no ID yet), waiting...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      // Check if peer is disconnected or destroyed
      if (peerRef.current.disconnected || peerRef.current.destroyed) {
        console.warn('Peer is disconnected/destroyed, reinitializing...');
        peerRef.current.reconnect();
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      console.log(`Connecting to host: ${hostId} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      try {
        currentConn = peerRef.current.connect(hostId, {
          reliable: true,
          serialization: 'json'
        });
      } catch (err) {
        console.error('Failed to create connection:', err);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      if (!currentConn) {
        console.error('Failed to create connection: conn is undefined. Peer state:', {
          disconnected: peerRef.current.disconnected,
          destroyed: peerRef.current.destroyed,
          id: peerRef.current.id
        });
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptConnect, retryDelay);
        }
        return;
      }

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (currentConn && !currentConn.open) {
          console.warn('Connection timeout, retrying...');
          currentConn.close();
          if (retryCount < maxRetries) {
            retryCount++;
            attemptConnect();
          }
        }
      }, 8000);

      currentConn.on('open', () => {
        clearTimeout(connectionTimeout);
        console.log('Connected to host successfully!');
        setIsConnected(true);
        setConnections(prev => [...prev, currentConn!]);

        // Persist the target ID
        localStorage.setItem('taskflow_target_id', hostId);

        // Send local state to host immediately upon connection
        currentConn!.send({
          type: 'SYNC_TODOS',
          payload: todosRef.current,
          origin: peerIdRef.current
        });
      });

      currentConn.on('data', (data: any) => {
        handleIncomingData(currentConn!, data);
      });

      currentConn.on('close', () => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setConnections(prev => prev.filter(c => c !== currentConn));
      });

      currentConn.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Connection error:', err);
        
        // Retry on error
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection in ${retryDelay}ms...`);
          setTimeout(attemptConnect, retryDelay);
        } else {
          setIsConnected(false);
          setConnections(prev => prev.filter(c => c !== currentConn));
        }
      });
    };

    attemptConnect();
  }, [handleIncomingData]); // Use handleIncomingData callback

  return {
    peerId,
    connectionsCount: connections.length,
    connectToHost,
    isConnected,
    isReady: !!peerId
  };
}
