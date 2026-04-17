import { youtubeService } from '@/services/api';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { PlaybackState, SafeMediaControl } from './mediaControls';
import { parseDuration } from './utils';
import { SongData } from '@/interfaces/Song';

export const useAudioPlayer = (
  currentSong: SongData | null,
  playNext: () => void,
  preloadedSoundsRef: React.MutableRefObject<Map<string, AudioPlayer>>,
  addRecentPlayed: (song: SongData) => Promise<void>,
  addMostPlayed: (song: SongData) => Promise<void>,
  isOnline: boolean = true,
  isFavorite: (id: string) => boolean
) => {

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const soundRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const currentSongRef = useRef<SongData | null>(null);
  const playNextRef = useRef<() => void>(playNext);
  const playSequenceRef = useRef<number>(0);
  const downloadResumableRef = useRef<any>(null);
  const localFileUriRef = useRef<string | null>(null);
  const isUsingLocalFileRef = useRef<boolean>(false);
  const lastSeekTimeRef = useRef<number>(0);
  const seekOffsetRef = useRef(0);

  const stableSetIsPlaying = (value: boolean) => {
    setIsPlaying(value);
    isPlayingRef.current = value;
  };

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

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
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        cancelDownload();
      }
    });
    return () => {
      subscription.remove();
      cancelDownload();
      statusSubscriptionRef.current?.remove();
      soundRef.current?.remove();
    };
  }, []);

  const cleanupLocalFile = async () => {
    if (localFileUriRef.current) {
      try {
        const cacheDir = FileSystem.cacheDirectory ?? 'cache';
        const isCacheFile = localFileUriRef.current.includes(cacheDir);

        if (isCacheFile) {
          const fileInfo = await FileSystem.getInfoAsync(localFileUriRef.current);
          if (fileInfo.exists) {
            console.log('[CLEANUP] Eliminando archivo temporal:', localFileUriRef.current);
            await FileSystem.deleteAsync(localFileUriRef.current, { idempotent: true });
          }
        } else {
          console.log('[CLEANUP] Omitiendo eliminación de archivo persistente:', localFileUriRef.current);
        }
      }
      catch (error) {
        console.error('Error cleaning up local file:', error);
      }
      localFileUriRef.current = null;
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    const now = Date.now();
    if (now - lastSeekTimeRef.current < 800) return;

    if (status.playing) {
      stableSetIsPlaying(true);
    } else if (!isLoading && isPlayingRef.current) {
      stableSetIsPlaying(false);
    }

    const currentTimeMs = (status.currentTime ?? 0) * 1000;
    const actualPosition = currentTimeMs;

    setProgress(actualPosition);
    const song = currentSongRef.current;

    if (song?.duration_formatted && song.duration_formatted !== "00:00") {
      const parsed = parseDuration(song.duration_formatted);
      if (parsed > 0) setDuration(parsed);
    } else {
      const durationMs = (status.duration ?? 0) * 1000;
      if (durationMs > 0) setDuration(durationMs);
    }

    if (status.didJustFinish) {
      console.log('[PLAYBACK] Canción terminada. Reproduciendo siguiente...');
      playNextRef.current();
    }

    const state = status.playing
      ? PlaybackState.PLAYING
      : (status.isBuffering ? PlaybackState.BUFFERING : PlaybackState.PAUSED);
    SafeMediaControl.updatePlaybackState(state, actualPosition / 1000).catch(() => {});
  };

  const attachStatusListener = (player: AudioPlayer) => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
  };

  const unloadCurrentSound = () => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    const prev = soundRef.current;
    soundRef.current = null;
    prev?.remove();
  };

  const playSongLogic = async (song: SongData) => {

    soundRef.current?.pause();

    const currentSequence = ++playSequenceRef.current;
    const preloadedSound = preloadedSoundsRef.current.get(song.id);

    stableSetIsPlaying(false);
    setIsLoading(true);
    setProgress(0);
    setDuration(parseDuration(song.duration_formatted));
    seekOffsetRef.current = 0;
    isUsingLocalFileRef.current = false;
    localFileUriRef.current = null;

    await cancelDownload();
    unloadCurrentSound();

    try {
      let sound: AudioPlayer;
      const persistentUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
      const cacheUri = `${FileSystem.cacheDirectory}${song.id}.mp3`;

      if (currentSequence !== playSequenceRef.current) return;
      const persistentInfo = await FileSystem.getInfoAsync(persistentUri);
      const hasPersistent = persistentInfo.exists && (persistentInfo as any).size > 5000;

      const cacheInfo = !hasPersistent ? await FileSystem.getInfoAsync(cacheUri) : { exists: false };
      const hasCache = cacheInfo.exists && (cacheInfo as any).size > 5000;
      const localUri = hasPersistent ? persistentUri : (hasCache ? cacheUri : null);

      if (!isOnline && !localUri) {
        console.warn('[OFFLINE] Sin conexión y sin archivo local para:', song.id);
        Alert.alert(
          'Sin conexión',
          'Esta canción no está disponible sin internet. Guárdala en favoritos para escucharla offline.'
        );
        setIsLoading(false);
        stableSetIsPlaying(false);
        return;
      }

      if (preloadedSound) {
        try {
          sound = preloadedSound;
          preloadedSoundsRef.current.delete(song.id);
          console.log('[PRELOADED] Usando sound pre-cargado para', song.id);

          if (localUri) {
            localFileUriRef.current = localUri;
            isUsingLocalFileRef.current = true;
          }

          if (currentSequence !== playSequenceRef.current) {
            sound.remove();
            return;
          }

          attachStatusListener(sound);
          sound.play();

          if (!localUri && isOnline) {
            const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
            const targetUri = isFavorite(song.id) ? persistentUri : cacheUri;
            console.log(`[DOWNLOAD] Iniciando descarga de fondo a: ${isFavorite(song.id) ? 'Favoritos' : 'Cache'}`);
            const downloadResumable = FileSystem.createDownloadResumable(directUrl, targetUri, {});
            downloadResumableRef.current = downloadResumable;
            downloadResumable.downloadAsync().then(async (result: any) => {
              if (result && result.uri && currentSongRef.current?.id === song.id) {
                localFileUriRef.current = result.uri;
                isUsingLocalFileRef.current = true;
                console.log('Descarga finalizada para', song.id, 'en', result.uri);
              }
            }).catch((err: any) => console.error('Download error:', err));
          }

        } catch (error) {
          console.error('[PRELOADED] Fallo al usar sound pre-cargado. Creando nuevo...', error);
          if (currentSequence !== playSequenceRef.current) return;

          if (localUri) {
            localFileUriRef.current = localUri;
            isUsingLocalFileRef.current = true;
            sound = createAudioPlayer({ uri: localUri });
            attachStatusListener(sound);
            sound.play();
          } else if (isOnline) {
            const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
            sound = createAudioPlayer({ uri: directUrl });
            attachStatusListener(sound);
            sound.play();
          } else {
            throw new Error('Offline and no local file');
          }
        }
      }
      else if (localUri) {
        console.log('[LOCAL] Priorizando archivo guardado (favoritos/cache) aunque hay red:', localUri);
        if (currentSequence !== playSequenceRef.current) return;

        localFileUriRef.current = localUri;
        isUsingLocalFileRef.current = true;
        sound = createAudioPlayer({ uri: localUri });
        attachStatusListener(sound);
        sound.play();
      }
      else if (isOnline) {
        const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
        console.log('[NETWORK] Reproduciendo desde URL directa:', song.id);
        if (currentSequence !== playSequenceRef.current) return;

        sound = createAudioPlayer({ uri: directUrl });
        attachStatusListener(sound);
        sound.play();

        const targetUri = isFavorite(song.id) ? persistentUri : cacheUri;
        console.log(`[DOWNLOAD] Iniciando descarga de fondo a: ${isFavorite(song.id) ? 'Favoritos' : 'Cache'}`);
        const downloadResumable = FileSystem.createDownloadResumable(directUrl, targetUri, {});
        downloadResumableRef.current = downloadResumable;
        downloadResumable.downloadAsync().then(async (result: any) => {
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
            isUsingLocalFileRef.current = true;
            console.log('Descarga finalizada para', song.id, 'en', result.uri);
          }
        }).catch((err: any) => console.error('Download error:', err));
      } else {
        throw new Error('Offline and no local file');
      }

      if (currentSequence !== playSequenceRef.current) {
        sound.remove();
        return;
      }

      soundRef.current = sound;
      await addRecentPlayed(song);
      await addMostPlayed(song);
    }
    catch (error) {
      console.error('Error playing song:', error);
      stableSetIsPlaying(false);
    }
    finally {
      if (currentSequence === playSequenceRef.current) {
        setIsLoading(false);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      if (currentSong) {
        await playSongLogic(currentSong);
      }
      return;
    }

    if (isPlaying) {
      soundRef.current.pause();
      stableSetIsPlaying(false);
    } else {
      soundRef.current.play();
      stableSetIsPlaying(true);
    }
  };

  const pause = async () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.pause();
      stableSetIsPlaying(false);
    }
  };

  const switchToLocalFile = async (position: number) => {
    if (!soundRef.current || !localFileUriRef.current) return false;

    try {
      lastSeekTimeRef.current = Date.now();
      const isPlayingNow = isPlayingRef.current;

      unloadCurrentSound();
      const localSound = createAudioPlayer({ uri: localFileUriRef.current });
      attachStatusListener(localSound);
      localSound.seekTo(position / 1000);
      if (isPlayingNow) localSound.play();

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
      if (localFileUriRef.current && !isUsingLocalFileRef.current) {
        const success = await switchToLocalFile(position);
        if (success) return;
      }

      setProgress(position);
      soundRef.current.seekTo(position / 1000);
    }
    catch (error) {
      console.warn('Seek error:', error);
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
