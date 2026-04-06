import React, { createContext, useState, useContext } from 'react';

interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <PlayerContext.Provider value={{ isMaximized, setIsMaximized }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};