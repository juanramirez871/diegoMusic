import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PlayerUIContextType } from './types';

const PlayerUIContext = createContext<PlayerUIContextType | undefined>(undefined);

export const PlayerUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [pendingArtistOverlay, setPendingArtistOverlay] = useState<{ id: string; name: string } | null>(null);

  const openArtistOverlay = useCallback((artist: { id: string; name: string }) => {
    setIsMaximized(false);
    setPendingArtistOverlay(artist);
  }, []);

  const closeArtistOverlay = useCallback(() => {
    setPendingArtistOverlay(null);
  }, []);

  const value = useMemo<PlayerUIContextType>(() => ({
    isMaximized,
    setIsMaximized,
    pendingArtistOverlay,
    openArtistOverlay,
    closeArtistOverlay,
  }), [isMaximized, pendingArtistOverlay, openArtistOverlay, closeArtistOverlay]);

  return <PlayerUIContext.Provider value={value}>{children}</PlayerUIContext.Provider>;
};

export const usePlayerUI = () => {
  const ctx = useContext(PlayerUIContext);
  if (!ctx) throw new Error('usePlayerUI must be used within a PlayerUIProvider');
  return ctx;
};
