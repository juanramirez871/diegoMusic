import React, { createContext, useState, useContext, useEffect } from 'react';
import { SongData } from '@/components/Song';
import storage from '@/services/storage';

const CURRENT_SONG_KEY = '@current_song';
const FAVORITES_KEY = '@favorites_songs';
const QUEUE_KEY = '@player_queue';
const SHUFFLE_KEY = '@player_shuffle';
const DEFAULT_QUEUE_KEY = '@player_default_queue';

interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
  currentSong: SongData | null;
  setCurrentSong: (song: SongData | null) => void;
  playSong: (song: SongData, initialQueue?: SongData[]) => void;
  favorites: SongData[];
  toggleFavorite: (song: SongData) => void;
  isFavorite: (songId: string) => boolean;
  queue: SongData[];
  setQueue: (queue: SongData[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [favorites, setFavorites] = useState<SongData[]>([]);
  const [queue, setQueueState] = useState<SongData[]>([]);
  const [defaultQueue, setDefaultQueue] = useState<SongData[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);

  const setQueue = async (newQueue: SongData[]) => {
    setQueueState(newQueue);
    try {
      await storage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    }
    catch (error) {
      console.error('Error persisting queue:', error);
    }
  };

  const toggleShuffle = async () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    
    let newQueue = [...queue];
    if (newShuffleState)
    {
      for (let i = newQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
      }

      if (currentSong)
      {
        const currentIndex = newQueue.findIndex(s => s.id === currentSong.id);
        if (currentIndex !== -1) {
          newQueue.splice(currentIndex, 1);
          newQueue.unshift(currentSong);
        }
      }
    }
    else
    {
      newQueue = [...defaultQueue];
    }
    
    setQueueState(newQueue);
    try {
      await Promise.all([
        storage.setItem(SHUFFLE_KEY, JSON.stringify(newShuffleState)),
        storage.setItem(QUEUE_KEY, JSON.stringify(newQueue))
      ]);
    }
    catch (error) {
      console.error('Error persisting shuffle state:', error);
    }
  };

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedSong, savedFavorites, savedQueue, savedDefaultQueue, savedShuffle] = await Promise.all([
          storage.getItem(CURRENT_SONG_KEY),
          storage.getItem(FAVORITES_KEY),
          storage.getItem(QUEUE_KEY),
          storage.getItem(DEFAULT_QUEUE_KEY),
          storage.getItem(SHUFFLE_KEY)
        ]);
        
        if (savedSong) {
          const song = JSON.parse(savedSong);
          setCurrentSong(song);
        }

        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavorites(favorites.sort((a: SongData, b: SongData) => a.id.localeCompare(b.id)));
        }

        if (savedQueue) setQueueState(JSON.parse(savedQueue));
        if (savedDefaultQueue) setDefaultQueue(JSON.parse(savedDefaultQueue));
        if (savedShuffle) setIsShuffle(JSON.parse(savedShuffle));
      }
      catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };
    loadPersistedData();
  }, []);

  const playSong = async (song: SongData, initialQueue?: SongData[]) => {

    setCurrentSong(song);
    let newQueue = queue;
    let newDefaultQueue = defaultQueue;
    
    if (initialQueue) {
      newQueue = [...initialQueue];
      newDefaultQueue = [...initialQueue];
      
      if (isShuffle)
      {
        const songsToShuffle = newQueue.filter(s => s.id !== song.id);
        for (let i = songsToShuffle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [songsToShuffle[i], songsToShuffle[j]] = [songsToShuffle[j], songsToShuffle[i]];
        }

        newQueue = [song, ...songsToShuffle];
      }
      
      setQueueState(newQueue);
      setDefaultQueue(newDefaultQueue);
    }
    else if (queue.length === 0) {
      newQueue = [];
      newDefaultQueue = [];
      setQueueState([]);
      setDefaultQueue([]);
    }

    try {
      const storagePromises = [
        storage.setItem(CURRENT_SONG_KEY, JSON.stringify(song))
      ];
      
      if (initialQueue) {
        storagePromises.push(storage.setItem(QUEUE_KEY, JSON.stringify(newQueue)));
        storagePromises.push(storage.setItem(DEFAULT_QUEUE_KEY, JSON.stringify(newDefaultQueue)));
      }
      
      await Promise.all(storagePromises);
    }
    catch (error) {
      console.error('Error persisting playback data:', error);
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    }
  };

  const toggleFavorite = async (song: SongData) => {

    const newFavorites = favorites.some(f => f.id === song.id)
      ? favorites.filter(f => f.id !== song.id)
      : [...favorites, song];
    
    setFavorites(newFavorites);
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
    catch (error) {
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
      isFavorite,
      queue,
      setQueue,
      playNext,
      playPrevious,
      isShuffle,
      toggleShuffle
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