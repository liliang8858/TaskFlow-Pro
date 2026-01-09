import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useTodos } from '../context/TodoContext';

export function usePeerSync(isHost: boolean = false) {
  const { todos, setTodos } = useTodos();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  
  // Track which connection sent the update to avoid echoing back
  const skipConnectionRef = useRef<string | null>(null);

  // Broadcast changes to all connections when todos change locally
  useEffect(() => {
    // Only broadcast if we have connections
    if (connections.length > 0) {
      const payload = { type: 'SYNC_TODOS', payload: todos };
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
      skipConnectionRef.current = null;
    }
  }, [todos, connections]);

  // Initialize Peer
  useEffect(() => {
    const initPeer = async () => {
      const PeerClass = (await import('peerjs')).default;
      const newPeer = new PeerClass();

      newPeer.on('open', (id) => {
        console.log('My Peer ID is: ' + id);
        setPeerId(id);
      });

      newPeer.on('connection', (conn) => {
        // Allow all incoming connections to support multi-level reporting (Mesh/Tree topology)
        console.log('Incoming connection:', conn.peer);
        
        conn.on('open', () => {
          setConnections(prev => [...prev, conn]);
          // Send initial state to the new client
          conn.send({ type: 'SYNC_TODOS', payload: todos });
        });

        conn.on('data', (data: any) => {
           if (data?.type === 'SYNC_TODOS' && Array.isArray(data.payload)) {
             console.log('Received remote update from', conn.peer);
             skipConnectionRef.current = conn.peer;
             setTodos(data.payload);
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

      peerRef.current = newPeer;
    };

    initPeer();

    return () => {
      peerRef.current?.destroy();
    };
  }, [isHost]); // Removed todos from dependency to avoid re-init

  // Connect to a Host
  const connectToHost = useCallback((hostId: string) => {
    if (!peerRef.current) {
        console.warn('Peer not initialized');
        return;
    }
    
    // Check if peer is ready (has an ID)
    if (!peerRef.current.id) {
        console.warn('Peer not ready (no ID yet)');
        return;
    }

    console.log('Connecting to host:', hostId);
    const conn = peerRef.current.connect(hostId);
    
    if (!conn) {
        console.error('Failed to create connection: conn is undefined. Peer state:', {
            disconnected: peerRef.current.disconnected,
            destroyed: peerRef.current.destroyed,
            id: peerRef.current.id
        });
        return;
    }
    
    conn.on('open', () => {
      console.log('Connected to host');
      setIsConnected(true);
      setConnections(prev => [...prev, conn]);
      
      // Send local state to host immediately upon connection
      // This allows the "Controller" to push its tasks to the "Screen"
      conn.send({ type: 'SYNC_TODOS', payload: todos });
    });

    conn.on('data', (data: any) => {
        if (data?.type === 'SYNC_TODOS' && Array.isArray(data.payload)) {
            console.log('Client received update from host', conn.peer);
            skipConnectionRef.current = conn.peer;
            setTodos(data.payload);
        }
    });

    conn.on('close', () => {
        setIsConnected(false);
        setConnections(prev => prev.filter(c => c !== conn));
    });
    
    conn.on('error', (err) => {
        console.error('Connection error:', err);
        setIsConnected(false);
        setConnections(prev => prev.filter(c => c !== conn));
    });

  }, [todos]); // Keep todos dependency so we send latest data on connect

  return { 
      peerId, 
      connectionsCount: connections.length, 
      connectToHost, 
      isConnected,
      isReady: !!peerId 
  };
}
