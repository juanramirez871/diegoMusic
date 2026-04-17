import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import storage from '@/services/storage';
import { PlayerContextType, CURRENT_SONG_KEY, QUEUE_SOURCE_KEY } from './player/types';
import { SafeMediaControl, Command, PlaybackState } from './player/mediaControls';
import { parseDuration } from './player/utils';
import { usePlayerStorage } from './player/usePlayerStorage';
import { usePreloader } from './player/usePreloader';
import { useAudioPlayer } from './player/useAudioPlayer';
import { usePlayerQueue } from './player/usePlayerQueue';
import { useNetwork } from './NetworkContext';
import { SongData } from '@/interfaces/Song';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { isOnline } = useNetwork();
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);
  const { 
    favorites, 
    favoriteArtists, 
    recentPlayed, 
    mostPlayed, 
    toggleFavorite, 
    isFavorite, 
    toggleFavoriteArtist, 
    isFavoriteArtist,
    addRecentPlayed,
    addMostPlayed
  } = usePlayerStorage();

  const {
    queue,
    setQueue,
    isShuffle,
    toggleShuffle,
    updateQueueAndSource,
    getNextSong,
    getPreviousSong
  } = usePlayerQueue();

  const { 
    preloadedSoundsRef, 
    preloadNextSongs, 
    clearPreloaded 
  } = usePreloader();

  const playSong = async (song: SongData, initialQueue?: SongData[], source?: 'favorites' | 'search') => {

    setCurrentSong(song);
    setIsIntendingToPlay(true);

    const playPromise = playSongLogic(song);
    const queueUpdatePromise = updateQueueAndSource(song, initialQueue, source);
    const [{ newSource }] = await Promise.all([queueUpdatePromise, playPromise]);
    
    try {
      await Promise.all([
        storage.setItem(CURRENT_SONG_KEY, JSON.stringify(song)),
        storage.setItem(QUEUE_SOURCE_KEY, newSource)
      ]);
    }
    catch (error) {
      console.error('Error persisting playback data:', error);
    }
  };

  const playNext = useCallback(() => {
    const nextSong = getNextSong(currentSong);
    if (nextSong) playSong(nextSong);
  }, [getNextSong, currentSong, playSong]);

  const playPrevious = useCallback(() => {
    const prevSong = getPreviousSong(currentSong);
    if (prevSong) playSong(prevSong);
  }, [getPreviousSong, currentSong, playSong]);

  const {
    isPlaying,
    isIntendingToPlay,
    setIsIntendingToPlay,
    isLoading,
    progress,
    duration,
    setDuration,
    togglePlayPause,
    pause,
    seekTo,
    playSongLogic,
    cancelDownload,
    cleanupLocalFile
  } = useAudioPlayer(
    currentSong,
    playNext,
    preloadedSoundsRef,
    addRecentPlayed,
    addMostPlayed,
    isOnline,
    isFavorite
  );

  const togglePlayPauseRef = useRef(togglePlayPause);
  const playNextRef = useRef(playNext);
  const playPreviousRef = useRef(playPrevious);
  const seekToRef = useRef(seekTo);

  useEffect(() => {
    togglePlayPauseRef.current = togglePlayPause;
  }, [togglePlayPause]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    playPreviousRef.current = playPrevious;
  }, [playPrevious]);

  useEffect(() => {
    seekToRef.current = seekTo;
  }, [seekTo]);

  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);
  const sleepTimerRef = React.useRef<any>(null);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    setSleepTimerState(minutes);

    if (minutes !== null) {
      const ms = minutes * 60 * 1000;
      sleepTimerRef.current = setTimeout(() => {
        pause();
        setSleepTimerState(null);
        sleepTimerRef.current = null;
      }, ms);
    }
  }, [pause]);

  useEffect(() => {
    const loadCurrentSong = async () => {
      try {
        const savedSong = await storage.getItem(CURRENT_SONG_KEY);
        if (savedSong) {
          const song = JSON.parse(savedSong);
          setCurrentSong(song);
          setDuration(parseDuration(song.duration_formatted));
        }
      } catch (error) {
        console.error('Error loading initial song:', error);
      }
    };
    loadCurrentSong();
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          allowsRecording: false,
          shouldPlayInBackground: true,
        });

        if (SafeMediaControl.isAvailable()) {
          await SafeMediaControl.enableMediaControls({
            capabilities: [
              Command.PLAY,
              Command.PAUSE,
              Command.NEXT_TRACK,
              Command.PREVIOUS_TRACK,
              Command.STOP,
              Command.SEEK,
            ].filter(Boolean),
            compactCapabilities: [
              Command.PREVIOUS_TRACK,
              Command.PLAY,
              Command.NEXT_TRACK,
            ].filter(Boolean),
            notification: { color: '#2c5af3' },
          });
          await SafeMediaControl.updatePlaybackState(PlaybackState.STOPPED, 0);
        }
      }
      catch (error) {
        console.warn('Error setting audio mode or media controls:', error);
      }
    };
    setupAudio();

    const removeListener = SafeMediaControl.addListener((event: any) => {
      switch (event.command) {
        case Command.PLAY:
        case Command.PAUSE:
          togglePlayPauseRef.current();
          break;
        case Command.NEXT_TRACK:
          playNextRef.current();
          break;
        case Command.PREVIOUS_TRACK:
          playPreviousRef.current();
          break;
        case Command.SEEK:
          if (event.data?.position !== undefined) {
            seekToRef.current(event.data.position * 1000);
          }
          break;
      }
    });

    return () => {
      removeListener();
      SafeMediaControl.disableMediaControls().catch(() => {});
    };
  }, []);


  useEffect(() => {
    const updateMetadata = async () => {
      if (currentSong) {
        let artworkUri = currentSong.thumbnail?.url;
        
        if (isFavorite(currentSong.id)) {
          const localThumbUri = `${FileSystem.documentDirectory}${currentSong.id}_thumb.jpg`;
          try {
            const info = await FileSystem.getInfoAsync(localThumbUri);
            if (info.exists) {
              artworkUri = localThumbUri;
            }
          } catch (e) {
            console.warn('Error checking local thumbnail for metadata:', e);
          }
        }

        const normalizedArtworkUri =
          typeof artworkUri === 'string' && artworkUri.length > 0
            ? artworkUri.replace(/^http:\/\//, 'https://')
            : undefined;

        const metadata: any = {
          title: currentSong.title,
          artist: currentSong.channel?.name || 'Unknown Artist',
          duration: parseDuration(currentSong.duration_formatted) / 1000,
        };

        if (normalizedArtworkUri) {
          metadata.artwork = { uri: normalizedArtworkUri };
        }

        SafeMediaControl.updateMetadata(metadata).catch(() => {});
      }
    };

    updateMetadata();
  }, [currentSong, favorites]);


  useEffect(() => {
    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex !== -1) preloadNextSongs(queue, currentIndex, isOnline);
    }
  }, [currentSong?.id, queue, isOnline]);


  useEffect(() => {
    return () => {
      clearPreloaded();
      cancelDownload();
      cleanupLocalFile();
    };
  }, []);

  const onToggleShuffle = () => toggleShuffle(currentSong);

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
      toggleShuffle: onToggleShuffle,
      isPlaying,
      isIntendingToPlay,
      togglePlayPause,
      pause,
      progress,
      duration,
      seekTo,
      isLoading,
      sleepTimer,
      setSleepTimer
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
