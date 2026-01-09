import { createContext, useContext, ReactNode } from 'react';
import { usePeerSync, Reporter } from '../hooks/usePeerSync';

interface PeerContextType {
  peerId: string | null;
  connectionsCount: number;
  connectToHost: (hostId: string) => void;
  isConnected: boolean;
  isReady: boolean;
  reporters: Reporter[];
  hostInfo: Reporter | null;
  getUserName: () => string;
  setUserName: (name: string) => void;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export function PeerProvider({ children }: { children: ReactNode }) {
  const peerState = usePeerSync();

  return (
    <PeerContext.Provider value={peerState}>
      {children}
    </PeerContext.Provider>
  );
}

export function usePeer() {
  const context = useContext(PeerContext);
  if (context === undefined) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
}
