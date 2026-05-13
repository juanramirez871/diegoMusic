import React, { createContext, useContext } from 'react';
import { PlaybackContextType } from './types';

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ value: PlaybackContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
};

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within a PlaybackProvider');
  return ctx;
};
