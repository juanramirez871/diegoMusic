import { useState, useEffect } from 'react';
import storage from '@/services/storage';
import {
  FAVORITES_QUEUE_KEY,
  SEARCH_QUEUE_KEY,
  FAVORITES_DEFAULT_QUEUE_KEY,
  SEARCH_DEFAULT_QUEUE_KEY,
  QUEUE_SOURCE_KEY,
  SHUFFLE_KEY,
  REPEAT_KEY,
  RepeatMode,
} from './types';
import { SongData } from '@/interfaces/Song';

export const usePlayerQueue = () => {

  const [queue, setQueueState] = useState<SongData[]>([]);
  const [defaultQueue, setDefaultQueue] = useState<SongData[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queueSource, setQueueSource] = useState<'favorites' | 'search'>('search');

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const savedSource = await storage.getItem(QUEUE_SOURCE_KEY);
        const source: 'favorites' | 'search' = (savedSource as 'favorites' | 'search') || 'search';
        setQueueSource(source);

        const queueKey = source === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
        const defaultQueueKey = source === 'favorites' ? FAVORITES_DEFAULT_QUEUE_KEY : SEARCH_DEFAULT_QUEUE_KEY;
        const [savedQueue, savedDefaultQueue, savedShuffle] = await Promise.all([
          storage.getItem(queueKey),
          storage.getItem(defaultQueueKey),
          storage.getItem(SHUFFLE_KEY)
        ]);

        const savedRepeat = await storage.getItem(REPEAT_KEY);
        if (savedQueue) setQueueState(JSON.parse(savedQueue));
        if (savedDefaultQueue) setDefaultQueue(JSON.parse(savedDefaultQueue));
        if (savedShuffle) setIsShuffle(JSON.parse(savedShuffle));
        if (savedRepeat) setRepeatMode(JSON.parse(savedRepeat) as RepeatMode);
      }
      catch (error) {
        console.error('Error loading persisted queue:', error);
      }
    };
    loadQueue();
  }, []);

  const setQueue = async (newQueue: SongData[]) => {
    setQueueState(newQueue);
    try {
      const queueKey = queueSource === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
      await storage.setItem(queueKey, JSON.stringify(newQueue));
    }
    catch (error) {
      console.error('Error persisting queue:', error);
    }
  };

  const toggleShuffle = async (currentSong: SongData | null) => {

    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    
    let newQueue = [...queue];
    if (newShuffleState) {
      for (let i = newQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
      }

      if (currentSong) {
        const currentIndex = newQueue.findIndex(s => s.id === currentSong.id);
        if (currentIndex !== -1) {
          newQueue.splice(currentIndex, 1);
          newQueue.unshift(currentSong);
        }
      }
    }
    else {
      newQueue = [...defaultQueue];
    }
    
    setQueueState(newQueue);
    try {
      const queueKey = queueSource === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
      await Promise.all([
        storage.setItem(SHUFFLE_KEY, JSON.stringify(newShuffleState)),
        storage.setItem(queueKey, JSON.stringify(newQueue))
      ]);
    }
    catch (error) {
      console.error('Error persisting shuffle state:', error);
    }
  };

  const updateQueueAndSource = async (
    song: SongData, 
    initialQueue?: SongData[], 
    source?: 'favorites' | 'search',
    shuffleActive: boolean = isShuffle
  ) => {

    let newQueue = queue;
    let newDefaultQueue = defaultQueue;
    let newSource = queueSource;
    
    if (initialQueue) {
      newSource = source || 'search';
      setQueueSource(newSource);
      newQueue = [...initialQueue];
      newDefaultQueue = [...initialQueue];
      
      if (shuffleActive) {
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
      const queueKey = newSource === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
      const defaultQueueKey = newSource === 'favorites' ? FAVORITES_DEFAULT_QUEUE_KEY : SEARCH_DEFAULT_QUEUE_KEY;
      const storagePromises = [
        storage.setItem(QUEUE_SOURCE_KEY, newSource)
      ];
      
      if (initialQueue) {
        storagePromises.push(storage.setItem(queueKey, JSON.stringify(newQueue)));
        storagePromises.push(storage.setItem(defaultQueueKey, JSON.stringify(newDefaultQueue)));
      }
      
      await Promise.all(storagePromises);
    }
    catch (error) {
      console.error('Error persisting queue data:', error);
    }
    
    return { newQueue, newDefaultQueue, newSource };
  };

  const toggleRepeat = async () => {
    const next: RepeatMode = repeatMode === 'off' ? 'one' : 'off';
    setRepeatMode(next);
    try {
      await storage.setItem(REPEAT_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error persisting repeat mode:', error);
    }
  };

  const getNextSong = (currentSong: SongData | null) => {
    if (queue.length === 0 || !currentSong) return null;
    if (repeatMode === 'one') return currentSong;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) return queue[currentIndex + 1];
    return queue[0];
  };

  const getPreviousSong = (currentSong: SongData | null) => {
    if (queue.length === 0 || !currentSong) return null;
    if (repeatMode === 'one') return currentSong;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) return queue[currentIndex - 1];
    if (repeatMode === 'all') return queue[queue.length - 1];
    return null;
  };

  return {
    queue,
    setQueue,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    queueSource,
    updateQueueAndSource,
    getNextSong,
    getPreviousSong
  };
};
