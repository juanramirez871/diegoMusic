import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { SongData, ArtistData } from '@/components/Song';
import storage from '@/services/storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { youtubeService } from '@/services/api';

const CURRENT_SONG_KEY = '@current_song';
const FAVORITES_KEY = '@favorites_songs';
const FAVORITE_ARTISTS_KEY = '@favorite_artists';
const RECENT_PLAYED_KEY = '@last_music_played';
const MOST_PLAYED_KEY = '@most_played_songs';
const FAVORITES_QUEUE_KEY = '@player_favorites_queue';
const FAVORITES_DEFAULT_QUEUE_KEY = '@player_favorites_default_queue';
const SEARCH_QUEUE_KEY = '@player_search_queue';
const SEARCH_DEFAULT_QUEUE_KEY = '@player_search_default_queue';
const QUEUE_SOURCE_KEY = '@player_queue_source';
const SHUFFLE_KEY = '@player_shuffle';

interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
  currentSong: SongData | null;
  setCurrentSong: (song: SongData | null) => void;
  playSong: (song: SongData, initialQueue?: SongData[], source?: 'favorites' | 'search') => void;
  favorites: SongData[];
  favoriteArtists: ArtistData[];
  recentPlayed: SongData[];
  mostPlayed: SongData[];
  toggleFavorite: (song: SongData) => void;
  toggleFavoriteArtist: (artist: ArtistData) => void;
  isFavorite: (songId: string) => boolean;
  isFavoriteArtist: (artistId: string) => boolean;
  queue: SongData[];
  setQueue: (queue: SongData[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  progress: number;
  duration: number;
  seekTo: (position: number) => void;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const [favorites, setFavorites] = useState<SongData[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<ArtistData[]>([]);
  const [recentPlayed, setRecentPlayed] = useState<SongData[]>([]);
  const [mostPlayed, setMostPlayed] = useState<SongData[]>([]);
  const [queue, setQueueState] = useState<SongData[]>([]);
  const [defaultQueue, setDefaultQueue] = useState<SongData[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [queueSource, setQueueSource] = useState<'favorites' | 'search'>('search');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekOffsetRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentSongRef = useRef<SongData | null>(null);
  const preloadedSoundsRef = useRef<Map<string, Audio.Sound>>(new Map());
  const downloadResumableRef = useRef<any>(null);
  const localFileUriRef = useRef<string | null>(null);
  const isUsingLocalFileRef = useRef<boolean>(false);
  const lastSeekTimeRef = useRef<number>(0);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const cleanupLocalFile = async () => {
    if (localFileUriRef.current) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(localFileUriRef.current);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(localFileUriRef.current, { idempotent: true });
        }
      }
      catch (error) {
        console.error('Error cleaning up local file:', error);
      }
      localFileUriRef.current = null;
    }
  };

  const cancelDownload = async () => {
    if (downloadResumableRef.current) {
      try {
        await downloadResumableRef.current.cancelAsync();
      }
      catch (error) {
        console.warn('Error cancelling download:', error);
      }
      downloadResumableRef.current = null;
    }
  };

  useEffect(() => {
    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex !== -1) preloadNextSongs(queue, currentIndex);
    }
  }, [currentSong?.id, queue]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      preloadedSoundsRef.current.forEach(sound => sound.unloadAsync());
      preloadedSoundsRef.current.clear();
      cancelDownload();
      cleanupLocalFile();
    };
  }, []);

  const preloadNextSongs = async (currentQueue: SongData[], currentIndex: number) => {

    const nextSongs = currentQueue.slice(currentIndex + 1, currentIndex + 4);
    const nextSongIds = new Set(nextSongs.map(s => s.id));
    
    for (const [id, sound] of preloadedSoundsRef.current.entries())
    {
      if (!nextSongIds.has(id)) {
        await sound.unloadAsync();
        preloadedSoundsRef.current.delete(id);
        
        const localUri = `${(FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory}${id}.mp3`;
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
      }
    }

    for (const song of nextSongs) {
      const localUri = `${(FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory}${song.id}.mp3`;
      
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        
        if (!fileInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            youtubeService.getAudioDownloadUrl(song.url),
            localUri,
            {}
          );
          await downloadResumable.downloadAsync().catch(err => console.error(`Error downloading preloaded song ${song.id}:`, err));
        }

        if (!preloadedSoundsRef.current.has(song.id)) {
          const sourceUri = (await FileSystem.getInfoAsync(localUri)).exists 
            ? localUri 
            : youtubeService.getAudioDownloadUrl(song.url);

          const { sound } = await Audio.Sound.createAsync(
            { uri: sourceUri },
            { shouldPlay: false }
          );
          preloadedSoundsRef.current.set(song.id, sound);
        }
      }
      catch (error) {
        console.error(`Error preloading song ${song.id}:`, error);
      }
    }
  };

  const parseDuration = (durationStr: string): number => {
    if (!durationStr || durationStr === "00:00") return 0;
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 1) return parts[0] * 1000;
    else if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
    else if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

    return 0;
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {

      const now = Date.now();
      if (now - lastSeekTimeRef.current < 800) return;

      setIsPlaying(status.isPlaying);
      const actualPosition = isUsingLocalFileRef.current 
        ? status.positionMillis 
        : status.positionMillis + seekOffsetRef.current;

      setProgress(actualPosition);
      const song = currentSongRef.current;

      if (song?.duration_formatted && song.duration_formatted !== "00:00") {
        const parsed = parseDuration(song.duration_formatted);
        if (parsed > 0) setDuration(parsed);
      }
      else if (status.durationMillis && status.durationMillis > 0) {
        setDuration(status.durationMillis);
      }

      if (status.didJustFinish) playNext();
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      if (currentSong) {
        await playSong(currentSong);
      }
      return;
    }
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const switchToLocalFile = async (position: number) => {
    if (!soundRef.current || !localFileUriRef.current) return false;
    
    try {
      lastSeekTimeRef.current = Date.now(); // Bloquear actualizaciones de progreso
      const status = await soundRef.current.getStatusAsync() as any;
      const isPlayingNow = status.isPlaying;
      
      await soundRef.current.unloadAsync();
      const { sound: localSound } = await Audio.Sound.createAsync(
        { uri: localFileUriRef.current },
        { 
          shouldPlay: isPlayingNow,
          positionMillis: position
        },
        onPlaybackStatusUpdate
      );
      soundRef.current = localSound;
      isUsingLocalFileRef.current = true;
      seekOffsetRef.current = 0;
      setProgress(position);
      return true;
    }
    catch (error) {
      console.error('Error switching to local file:', error);
      return false;
    }
  };

  const seekTo = async (position: number) => {

    if (!soundRef.current || !currentSong) return;
    lastSeekTimeRef.current = Date.now();
    
    try {
      const diff = Math.abs(position - progress);
      
      if (localFileUriRef.current) {
        if (isUsingLocalFileRef.current) {
          setProgress(position);
          try {
            await soundRef.current.setPositionAsync(position);
          }
          catch (e: any) {
            if (e.message?.includes('interrupted')) {
              setTimeout(async () => {
                lastSeekTimeRef.current = Date.now();
                await soundRef.current?.setPositionAsync(position).catch(() => {});
              }, 100);
            }
          }
          return;
        }
        else {
          const success = await switchToLocalFile(position);
          if (success) return;
        }
      }

      if (diff > 30000 || position < seekOffsetRef.current) {
        setIsLoading(true);
        setProgress(position);
        
        if (localFileUriRef.current) {
          const success = await switchToLocalFile(position);
          if (success) {
            setIsLoading(false);
            return;
          }
        }

        await soundRef.current.unloadAsync();
        seekOffsetRef.current = position;
        const startSeconds = Math.floor(position / 1000);
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: youtubeService.getAudioDownloadUrl(currentSong.url, startSeconds) },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        
        soundRef.current = sound;
        setProgress(position);
        setIsLoading(false);
      }
      else {
        const relativePosition = position - seekOffsetRef.current;
        setProgress(position);
        await soundRef.current.setPositionAsync(relativePosition);
      }
    }
    catch (error) {
      console.warn('Seek error:', error);
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedSong, savedFavorites, savedArtists, savedRecent, savedMostPlayed, savedSource, savedShuffle] = await Promise.all([
          storage.getItem(CURRENT_SONG_KEY),
          storage.getItem(FAVORITES_KEY),
          storage.getItem(FAVORITE_ARTISTS_KEY),
          storage.getItem(RECENT_PLAYED_KEY),
          storage.getItem(MOST_PLAYED_KEY),
          storage.getItem(QUEUE_SOURCE_KEY),
          storage.getItem(SHUFFLE_KEY)
        ]);
        
        if (savedSong) {
          const song = JSON.parse(savedSong);
          setCurrentSong(song);
          setDuration(parseDuration(song.duration_formatted));
        }

        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavorites(favorites.sort((a: SongData, b: SongData) => a.id.localeCompare(b.id)));
        }

        if (savedArtists) setFavoriteArtists(JSON.parse(savedArtists));
        if (savedRecent) setRecentPlayed(JSON.parse(savedRecent));
        if (savedMostPlayed) setMostPlayed(JSON.parse(savedMostPlayed));

        const source: 'favorites' | 'search' = (savedSource as 'favorites' | 'search') || 'search';
        setQueueSource(source);

        const queueKey = source === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
        const defaultQueueKey = source === 'favorites' ? FAVORITES_DEFAULT_QUEUE_KEY : SEARCH_DEFAULT_QUEUE_KEY;

        const [savedQueue, savedDefaultQueue] = await Promise.all([
          storage.getItem(queueKey),
          storage.getItem(defaultQueueKey)
        ]);

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

  const playSong = async (song: SongData, initialQueue?: SongData[], source?: 'favorites' | 'search') => {

    const preloadedSound = preloadedSoundsRef.current.get(song.id);
    await cancelDownload();
    if (!preloadedSound) await cleanupLocalFile();

    setCurrentSong(song);
    setIsPlaying(false);
    setProgress(0);
    setDuration(parseDuration(song.duration_formatted));
    seekOffsetRef.current = 0;
    isUsingLocalFileRef.current = false;
    
    if (preloadedSound)
    {
      const localUri = `${(FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory}${song.id}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        localFileUriRef.current = localUri;
        isUsingLocalFileRef.current = true;
      }
    }

    if (!preloadedSound) setIsLoading(true);
    if (soundRef.current) {
      try {
        await soundRef.current.setOnPlaybackStatusUpdate(null);
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      catch (error) {
        console.error('Error unloading previous sound:', error);
      }
    }

    try {
      let sound: Audio.Sound;
      const downloadUrl = youtubeService.getAudioDownloadUrl(song.url);
      const localUri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}${song.id}.mp3`;
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        localUri,
        {},
      );
      downloadResumableRef.current = downloadResumable;

      const downloadPromise = downloadResumable.downloadAsync();      
      if (preloadedSound)
      {
        sound = preloadedSound;
        preloadedSoundsRef.current.delete(song.id);
        await sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await sound.playAsync();
        
        downloadPromise.then(async (result: any) => {
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
            console.log('Song downloaded to:', result.uri);
          }
        }).catch((err: any) => console.error('Download error:', err));
      }
      else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: downloadUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        sound = newSound;
        downloadPromise.then(async (result: any) => {
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
            console.log('Song downloaded to:', result.uri);
          }
        }).catch((err: any) => console.error('Download error:', err));
      }
      
      soundRef.current = sound;
    }
    catch (error) {
      console.error('Error playing song:', error);
    }
    finally {
      setIsLoading(false);
    }
  
    setRecentPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 8);
      storage.setItem(RECENT_PLAYED_KEY, JSON.stringify(updated)).catch(err => 
        console.error('Error saving recent played:', err)
      );
      
      return updated;
    });

    setMostPlayed(prev => {
      const existingSongIndex = prev.findIndex(s => s.id === song.id);
      let updated;
      
      if (existingSongIndex !== -1) {
        updated = [...prev];
        updated[existingSongIndex] = {
          ...updated[existingSongIndex],
          timesPlayed: (updated[existingSongIndex].timesPlayed || 0) + 1
        };
      } else {
        updated = [...prev, { ...song, timesPlayed: 1 }];
      }

      updated.sort((a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0));
      const limited = updated.slice(0, 10);
      
      storage.setItem(MOST_PLAYED_KEY, JSON.stringify(limited)).catch(err => 
        console.error('Error saving most played:', err)
      );
      
      return limited;
    });

    let newQueue = queue;
    let newDefaultQueue = defaultQueue;
    let newSource = queueSource;
    
    if (initialQueue) {
      newSource = source || 'search';
      setQueueSource(newSource);
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
      const queueKey = newSource === 'favorites' ? FAVORITES_QUEUE_KEY : SEARCH_QUEUE_KEY;
      const defaultQueueKey = newSource === 'favorites' ? FAVORITES_DEFAULT_QUEUE_KEY : SEARCH_DEFAULT_QUEUE_KEY;

      const storagePromises = [
        storage.setItem(CURRENT_SONG_KEY, JSON.stringify(song)),
        storage.setItem(QUEUE_SOURCE_KEY, newSource)
      ];
      
      if (initialQueue) {
        storagePromises.push(storage.setItem(queueKey, JSON.stringify(newQueue)));
        storagePromises.push(storage.setItem(defaultQueueKey, JSON.stringify(newDefaultQueue)));
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

  const toggleFavoriteArtist = async (artist: ArtistData) => {
    const isAlreadyFavorite = favoriteArtists.some(f => f.id === artist.id);
    const newFavoriteArtists = isAlreadyFavorite
      ? favoriteArtists.filter(f => f.id !== artist.id)
      : [...favoriteArtists, artist];
    
    setFavoriteArtists(newFavoriteArtists);
    try {
      await storage.setItem(FAVORITE_ARTISTS_KEY, JSON.stringify(newFavoriteArtists));
    }
    catch (error) {
      console.error('Error persisting favorite artists:', error);
    }
  };

  const isFavoriteArtist = (artistId: string) => {
    return favoriteArtists.some(f => f.id === artistId);
  };

  return (
    <PlayerContext.Provider value={{ 
      isMaximized, 
      setIsMaximized, 
      currentSong, 
      setCurrentSong,
      playSong,
      favorites,
      favoriteArtists,
      recentPlayed,
      mostPlayed,
      toggleFavorite,
      toggleFavoriteArtist,
      isFavorite,
      isFavoriteArtist,
      queue,
      setQueue,
      playNext,
      playPrevious,
      isShuffle,
      toggleShuffle,
      isPlaying,
      togglePlayPause,
      progress,
      duration,
      seekTo,
      isLoading
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