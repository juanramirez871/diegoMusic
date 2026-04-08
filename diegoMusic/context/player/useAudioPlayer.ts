import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { SongData } from '@/components/Song';
import { youtubeService } from '@/services/api';
import { SafeMediaControl, PlaybackState } from './mediaControls';
import { parseDuration } from './utils';

export const useAudioPlayer = (
  currentSong: SongData | null,
  playNext: () => void,
  preloadedSoundsRef: React.MutableRefObject<Map<string, Audio.Sound>>,
  addRecentPlayed: (song: SongData) => Promise<void>,
  addMostPlayed: (song: SongData) => Promise<void>
) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentSongRef = useRef<SongData | null>(null);
  const downloadResumableRef = useRef<any>(null);
  const localFileUriRef = useRef<string | null>(null);
  const isUsingLocalFileRef = useRef<boolean>(false);
  const lastSeekTimeRef = useRef<number>(0);
  const seekOffsetRef = useRef(0);

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

  const onPlaybackStatusUpdate = (status: any) => {

    if (status.isLoaded)
    {
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
      const state = status.isPlaying 
        ? PlaybackState.PLAYING 
        : (status.isBuffering ? PlaybackState.BUFFERING : PlaybackState.PAUSED);

      SafeMediaControl.updatePlaybackState(state, actualPosition / 1000).catch(() => {});
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      if (currentSong) {
        // playSong logic will be handled outside or passed in
      }
      return;
    }
    
    if (isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const switchToLocalFile = async (position: number) => {
    if (!soundRef.current || !localFileUriRef.current) return false;
    
    try {
      lastSeekTimeRef.current = Date.now();
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

  const playSongLogic = async (song: SongData) => {
  
    const preloadedSound = preloadedSoundsRef.current.get(song.id);
    await cancelDownload();
    if (!preloadedSound) await cleanupLocalFile();

    setIsPlaying(false);
    setProgress(0);
    setDuration(parseDuration(song.duration_formatted));
    seekOffsetRef.current = 0;
    isUsingLocalFileRef.current = false;
    
    if (preloadedSound) {
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
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, localUri, {});
      downloadResumableRef.current = downloadResumable;

      const downloadPromise = downloadResumable.downloadAsync();      
      if (preloadedSound) {
        sound = preloadedSound;
        preloadedSoundsRef.current.delete(song.id);
        await sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await sound.playAsync();
        
        downloadPromise.then(async (result: any) => {
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
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
          }
        }).catch((err: any) => console.error('Download error:', err));
      }
      
      soundRef.current = sound;
      await addRecentPlayed(song);
      await addMostPlayed(song);
    }
    catch (error) {
      console.error('Error playing song:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  return {
    isPlaying,
    isLoading,
    progress,
    duration,
    setProgress,
    setDuration,
    setIsPlaying,
    setIsLoading,
    togglePlayPause,
    seekTo,
    playSongLogic,
    soundRef,
    cancelDownload,
    cleanupLocalFile
  };
};
