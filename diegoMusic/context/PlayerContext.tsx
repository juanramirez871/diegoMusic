import React, { createContext, useState, useContext, useEffect } from 'react';
import { SongData } from '@/components/Song';
import storage from '@/services/storage';

const CURRENT_SONG_KEY = '@current_song';

interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
  currentSong: SongData | null;
  setCurrentSong: (song: SongData | null) => void;
  playSong: (song: SongData) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);

  useEffect(() => {
    const loadPersistedSong = async () => {
      try {
        const savedSong = await storage.getItem(CURRENT_SONG_KEY);
        if (savedSong) {
          setCurrentSong(JSON.parse(savedSong));
        }
      } catch (error) {
        console.error('Error loading persisted song:', error);
      }
    };
    loadPersistedSong();
  }, []);

  const playSong = async (song: SongData) => {
    setCurrentSong(song);
    try {
      await storage.setItem(CURRENT_SONG_KEY, JSON.stringify(song));
    }
    catch (error) {
      console.error('Error persisting song:', error);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      isMaximized, 
      setIsMaximized, 
      currentSong, 
      setCurrentSong,
      playSong 
    }}>
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