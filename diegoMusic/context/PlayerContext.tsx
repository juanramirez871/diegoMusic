import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import storage from '@/services/storage';
import { SongData } from '@/components/Song';
import { PlayerContextType, CURRENT_SONG_KEY, QUEUE_SOURCE_KEY } from './player/types';
import { SafeMediaControl, Command } from './player/mediaControls';
import { parseDuration } from './player/utils';
import { usePlayerStorage } from './player/usePlayerStorage';
import { usePreloader } from './player/usePreloader';
import { useAudioPlayer } from './player/useAudioPlayer';
import { usePlayerQueue } from './player/usePlayerQueue';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

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
    
    const { newSource } = await updateQueueAndSource(song, initialQueue, source);
    await playSongLogic(song);
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
    isLoading,
    progress,
    duration,
    setDuration,
    togglePlayPause,
    seekTo,
    playSongLogic,
    cancelDownload,
    cleanupLocalFile
  } = useAudioPlayer(
    currentSong,
    playNext,
    preloadedSoundsRef,
    addRecentPlayed,
    addMostPlayed
  );

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
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });

        const isMediaControlEnabled = await SafeMediaControl.isEnabled();
        if (isMediaControlEnabled) {
          await SafeMediaControl.enableMediaControls({
            capabilities: [
              Command.PLAY, Command.PAUSE, Command.NEXT_TRACK, 
              Command.PREVIOUS_TRACK, Command.STOP, Command.SEEK,
            ],
            compactCapabilities: [
              Command.PREVIOUS_TRACK, Command.PLAY, 
              Command.PAUSE, Command.NEXT_TRACK,
            ],
            notification: { color: '#2c5af3' },
          });
        }
      }
      catch (error) {
        console.warn('Error setting audio mode or media controls:', error);
      }
    };
    setupAudio();

    let removeListener: (() => void) | undefined;
    SafeMediaControl.isEnabled().then(enabled => {
      if (enabled) {
        removeListener = SafeMediaControl.addListener((event: any) => {
          switch (event.command) {
            case Command.PLAY:
            case Command.PAUSE:
              togglePlayPause();
              break;
            case Command.NEXT_TRACK:
              playNext();
              break;
            case Command.PREVIOUS_TRACK:
              playPrevious();
              break;
            case Command.SEEK:
              if (event.data?.position !== undefined) {
                seekTo(event.data.position * 1000);
              }
              break;
          }
        });
      }
    }).catch(() => {});

    return () => {
      if (removeListener) removeListener();
    };
  }, [togglePlayPause]);


  useEffect(() => {
    if (currentSong) {
      SafeMediaControl.updateMetadata({
        title: currentSong.title,
        artist: currentSong.channel?.name || 'Unknown Artist',
        artwork: { uri: currentSong.thumbnail.url },
        duration: parseDuration(currentSong.duration_formatted) / 1000,
      }).catch(() => {});
    }
  }, [currentSong]);


  useEffect(() => {
    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex !== -1) preloadNextSongs(queue, currentIndex);
    }
  }, [currentSong?.id, queue]);


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
