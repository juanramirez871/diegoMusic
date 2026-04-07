import React, { createContext, useState, useContext, useEffect } from 'react';
import { SongData } from '@/components/Song';
import storage from '@/services/storage';

const CURRENT_SONG_KEY = '@current_song';
const FAVORITES_KEY = '@favorites_songs';

interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
  currentSong: SongData | null;
  setCurrentSong: (song: SongData | null) => void;
  playSong: (song: SongData) => void;
  favorites: SongData[];
  toggleFavorite: (song: SongData) => void;
  isFavorite: (songId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [favorites, setFavorites] = useState<SongData[]>([]);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedSong, savedFavorites] = await Promise.all([
          storage.getItem(CURRENT_SONG_KEY),
          storage.getItem(FAVORITES_KEY)
        ]);
        
        if (savedSong) setCurrentSong(JSON.parse(savedSong));
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      }
      catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };
    loadPersistedData();
  }, []);

  const playSong = async (song: SongData) => {
    setCurrentSong(song);
    try {
      await storage.setItem(CURRENT_SONG_KEY, JSON.stringify(song));
    } catch (error) {
      console.error('Error persisting song:', error);
    }
  };

  const toggleFavorite = async (song: SongData) => {
    const newFavorites = favorites.some(f => f.id === song.id)
      ? favorites.filter(f => f.id !== song.id)
      : [...favorites, song];
    
    setFavorites(newFavorites);
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error persisting favorites:', error);
    }
  };

  const isFavorite = (songId: string) => {
    return favorites.some(f => f.id === songId);
  };

  return (
    <PlayerContext.Provider value={{ 
      isMaximized, 
      setIsMaximized, 
      currentSong, 
      setCurrentSong,
      playSong,
      favorites,
      toggleFavorite,
      isFavorite
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