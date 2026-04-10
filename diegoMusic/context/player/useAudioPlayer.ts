import { SongData } from '@/components/Song';
import { youtubeService } from '@/services/api';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import { PlaybackState, SafeMediaControl } from './mediaControls';
import { parseDuration } from './utils';

export const useAudioPlayer = (
  currentSong: SongData | null,
  playNext: () => void,
  preloadedSoundsRef: React.MutableRefObject<Map<string, Audio.Sound>>,
  addRecentPlayed: (song: SongData) => Promise<void>,
  addMostPlayed: (song: SongData) => Promise<void>,
  isOnline: boolean = true
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

  const playSongLogic = async (song: SongData) => {
  
    const preloadedSound = preloadedSoundsRef.current.get(song.id);
    await cancelDownload();

    setIsPlaying(false);
    setProgress(0);
    setDuration(parseDuration(song.duration_formatted));
    seekOffsetRef.current = 0;
    isUsingLocalFileRef.current = false;
    localFileUriRef.current = null;
  
    if (!preloadedSound) setIsLoading(true);
    if (soundRef.current) {
      try {
        await soundRef.current.setOnPlaybackStatusUpdate(null);
        const unloadPromise = soundRef.current.unloadAsync();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Unload timeout')), 1000));
        await Promise.race([unloadPromise, timeoutPromise]).catch(e => console.warn('Unload error/timeout:', e));
        soundRef.current = null;
      }
      catch (error) {
        console.error('Error unloading previous sound:', error);
      }
    }

    try {
      let sound: Audio.Sound;
      const persistentUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
      const cacheUri = `${FileSystem.cacheDirectory}${song.id}.mp3`;
      
      const persistentInfo = await FileSystem.getInfoAsync(persistentUri);
      const hasPersistent = persistentInfo.exists && (persistentInfo as any).size > 5000;
      
      const cacheInfo = !hasPersistent ? await FileSystem.getInfoAsync(cacheUri) : { exists: false };
      const hasCache = cacheInfo.exists && (cacheInfo as any).size > 5000;
      const localUri = hasPersistent ? persistentUri : (hasCache ? cacheUri : null);
      
      if (!isOnline && !localUri) {
        console.warn('[OFFLINE] Sin conexión y sin archivo local para:', song.id);
        setIsLoading(false);
        return;
      }

      if (preloadedSound)
      {
        try {
          sound = preloadedSound;
          preloadedSoundsRef.current.delete(song.id);
          console.log('[PRELOADED] Usando sound pre-cargado para', song.id);
          
          let status = await sound.getStatusAsync();
          if (!status.isLoaded) {
            console.warn('[PRELOADED] El sound pre-cargado no está cargado. Recargando...', song.id);
            if (localUri) {
              await sound.loadAsync({ uri: localUri }, { shouldPlay: false }, true);
            }
            else if (isOnline) {
              const downloadUrl = youtubeService.getAudioDownloadUrl(song.url);
              await sound.loadAsync({ uri: downloadUrl }, { shouldPlay: false }, true);
            }
            else {
              throw new Error('Offline and no local file');
            }
          }
          
          await sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
          await sound.playAsync();
          
          if (localUri) {
            localFileUriRef.current = localUri;
            isUsingLocalFileRef.current = true;
          }
          else if (isOnline) {
            const downloadUrl = youtubeService.getAudioDownloadUrl(song.url);
            const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, cacheUri, {});
            downloadResumableRef.current = downloadResumable;
            downloadResumable.downloadAsync().then(async (result: any) => {
              if (result && result.uri && currentSongRef.current?.id === song.id) {
                localFileUriRef.current = result.uri;
                isUsingLocalFileRef.current = true;
                console.log('Descarga finalizada para', song.id, 'en', result.uri);
              }
            })
            .catch((err: any) => console.error('Download error:', err));
          }
          
        }
        catch (error) {
          console.error('[PRELOADED] Fallo al usar sound pre-cargado. Creando nuevo...', error);
          if (localUri) {
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: localUri },
              { shouldPlay: true },
              onPlaybackStatusUpdate
            );
            sound = newSound;
            isUsingLocalFileRef.current = true;
            localFileUriRef.current = localUri;
          }
          else if (isOnline) {
            const downloadUrl = youtubeService.getAudioDownloadUrl(song.url);
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: downloadUrl },
              { shouldPlay: true },
              onPlaybackStatusUpdate
            );
            sound = newSound;
          }
          else {
            throw new Error('Offline and no local file');
          }
        }
      }
      else if (localUri) {
        console.log('[LOCAL] Reproduciendo desde archivo local:', localUri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: localUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        sound = newSound;
        localFileUriRef.current = localUri;
        isUsingLocalFileRef.current = true;
      }
      else if (isOnline) {
        const downloadUrl = youtubeService.getAudioDownloadUrl(song.url);
        console.log('[NETWORK] Reproduciendo desde red:', downloadUrl);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: downloadUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        sound = newSound;
        const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, cacheUri, {});
        downloadResumableRef.current = downloadResumable;
        downloadResumable.downloadAsync().then(async (result: any) => {
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
            isUsingLocalFileRef.current = true;
            console.log('Descarga finalizada para', song.id, 'en', result.uri);
          }
        })
        .catch((err: any) => console.error('Download error:', err));
      }
      else {
        throw new Error('Offline and no local file');
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

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      if (currentSong) {
        await playSongLogic(currentSong);
      }
      return;
    }
    
    if (isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const pause = async () => {
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
    }
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

  return {
    isPlaying,
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
  };
};
