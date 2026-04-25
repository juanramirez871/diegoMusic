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
  const [isIntendingToPlay, setIsIntendingToPlay] = useState(false);
  const [isLoading, _setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const soundRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentSongRef = useRef<SongData | null>(null);
  const playNextRef = useRef<() => void>(playNext);
  const playSequenceRef = useRef<number>(0);
  const downloadResumableRef = useRef<any>(null);
  const downloadTargetUriRef = useRef<string | null>(null);
  const localFileUriRef = useRef<string | null>(null);
  const isUsingLocalFileRef = useRef<boolean>(false);
  const lastSeekTimeRef = useRef<number>(0);
  const seekOffsetRef = useRef(0);
  const playStartTimeRef = useRef<number>(0);
  const playbackSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const playSongLogicRef = useRef<((song: SongData, isRetry?: boolean) => Promise<void>) | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const lastMediaControlUpdateRef = useRef<number>(0);

  const stableSetIsPlaying = (value: boolean) => {
    setIsPlaying(value);
    isPlayingRef.current = value;
  };

  const stableSetIsLoading = (value: boolean) => {
    _setIsLoading(value);
    isLoadingRef.current = value;
  };

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const cancelDownload = async () => {
    if (downloadResumableRef.current) {
      const partialUri = downloadTargetUriRef.current;
      console.log('[CANCEL_DL] Cancelando descarga. partialUri:', partialUri);
      try {
        await downloadResumableRef.current.cancelAsync();
        console.log('[CANCEL_DL] cancelAsync OK');
      }
      catch (error) {
        console.warn('[CANCEL_DL] Error en cancelAsync (puede ser que ya terminó):', error);
      }
      downloadResumableRef.current = null;
      downloadTargetUriRef.current = null;

      if (partialUri && FileSystem.cacheDirectory && partialUri.includes(FileSystem.cacheDirectory)) {
        try {
          const info = await FileSystem.getInfoAsync(partialUri);
          console.log('[CANCEL_DL] Archivo parcial existe:', info.exists, 'size:', (info as any).size);
          if (info.exists) {
            await FileSystem.deleteAsync(partialUri, { idempotent: true });
            console.log('[CANCEL_DL] Archivo parcial eliminado:', partialUri);
          }
        }
        catch (e) {
          console.warn('[CANCEL_DL] Error eliminando parcial:', e);
        }
      }
      else {
        console.log('[CANCEL_DL] No se elimina archivo. partialUri:', partialUri, '| cacheDir:', FileSystem.cacheDirectory);
      }
    }
    else {
      console.log('[CANCEL_DL] No hay descarga activa (downloadResumableRef = null)');
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
      if (playbackSafetyTimerRef.current) {
        clearTimeout(playbackSafetyTimerRef.current);
      }
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
      if (isLoadingRef.current) stableSetIsLoading(false);
      stableSetIsPlaying(true);
    } else if (!isLoadingRef.current && isPlayingRef.current && (Date.now() - playStartTimeRef.current > 2000)) {
      stableSetIsPlaying(false);
    }

    const currentTimeMs = (status.currentTime ?? 0) * 1000;
    const actualPosition = currentTimeMs;
    if (now - lastProgressUpdateRef.current >= 200) {
      lastProgressUpdateRef.current = now;
      setProgress(actualPosition);

      const song = currentSongRef.current;
      if (song?.duration_formatted && song.duration_formatted !== "00:00") {
        const parsed = parseDuration(song.duration_formatted);
        if (parsed > 0) setDuration(parsed);
      }
      else {
        const durationMs = (status.duration ?? 0) * 1000;
        if (durationMs > 0) setDuration(durationMs);
      }
    }

    if (status.didJustFinish) {
      const elapsedMs = Date.now() - playStartTimeRef.current;
      if (elapsedMs < 3000) {
        console.warn(`[PLAYBACK] didJustFinish ignorado — playback duró solo ${elapsedMs}ms (posible archivo corrupto o vacío)`);
      }
      else {
        console.log('[PLAYBACK] Canción terminada. Reproduciendo siguiente...');
        playNextRef.current();
      }
    }

    if (now - lastMediaControlUpdateRef.current >= 500) {
      lastMediaControlUpdateRef.current = now;
      const state = status.playing ? PlaybackState.PLAYING : (status.isBuffering ? PlaybackState.BUFFERING : PlaybackState.PAUSED);
      SafeMediaControl.updatePlaybackState(state, actualPosition / 1000).catch(() => {});
    }
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

  const CROSSFADE_DURATION_MS = 600;
  const CROSSFADE_STEPS = 12;
  const fadeOutAndUnload = async (player: AudioPlayer) => {
    try {
      const stepDelay = CROSSFADE_DURATION_MS / CROSSFADE_STEPS;
      const stepSize = 1 / CROSSFADE_STEPS;
      let vol = 1;
      for (let i = 0; i < CROSSFADE_STEPS; i++) {
        vol = Math.max(0, vol - stepSize);
        try { player.volume = vol; } catch {}
        await new Promise<void>((res) => setTimeout(res, stepDelay));
      }
    } catch {}

    try { player.remove(); } catch {}
  };

  const playSongLogic = async (song: SongData, isRetry = false) => {

    if (!isRetry) retryCountRef.current = 0;
    if (playbackSafetyTimerRef.current) {
      clearTimeout(playbackSafetyTimerRef.current);
      playbackSafetyTimerRef.current = null;
    }

    lastProgressUpdateRef.current = 0;
    lastMediaControlUpdateRef.current = 0;
    lastSeekTimeRef.current = 0;
    const dyingPlayer = soundRef.current;
    const currentSequence = ++playSequenceRef.current;
    const preloadedSound = preloadedSoundsRef.current.get(song.id);

    console.log(`\n[PSL_START] ▶ song="${song.title.slice(0,30)}" id=${song.id} seq=${currentSequence} isRetry=${isRetry} preloaded=${!!preloadedSound} dyingPlayer=${!!dyingPlayer}`);
    stableSetIsPlaying(false);
    setIsIntendingToPlay(true);
    stableSetIsLoading(true);
    playStartTimeRef.current = Date.now();
    setProgress(0);
    setDuration(parseDuration(song.duration_formatted));
    seekOffsetRef.current = 0;
    isUsingLocalFileRef.current = false;
    localFileUriRef.current = null;

    await cancelDownload();

    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    soundRef.current = null;
    if (dyingPlayer) fadeOutAndUnload(dyingPlayer);

    SafeMediaControl.updatePlaybackState(PlaybackState.BUFFERING, 0).catch(() => {});

    try {
      let sound: AudioPlayer;
      const persistentUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
      const cacheUri = `${FileSystem.cacheDirectory}${song.id}.mp3`;

      if (currentSequence !== playSequenceRef.current) {
        console.log(`[PSL] seq mismatch después de cancelDownload: ${currentSequence} vs ${playSequenceRef.current}. ABORT.`);
        return;
      }
      const persistentInfo = await FileSystem.getInfoAsync(persistentUri);
      const hasPersistent = persistentInfo.exists && (persistentInfo as any).size > 100000;

      const cacheInfo = !hasPersistent ? await FileSystem.getInfoAsync(cacheUri) : { exists: false };
      const hasCache = cacheInfo.exists && (cacheInfo as any).size > 100000;
      const localUri = hasPersistent ? persistentUri : (hasCache ? cacheUri : null);

      console.log(`[PSL_FILES] seq=${currentSequence} persistent exists=${persistentInfo.exists} size=${(persistentInfo as any).size ?? 'N/A'} hasPersistent=${hasPersistent}`);
      console.log(`[PSL_FILES] cache exists=${(cacheInfo as any).exists} size=${(cacheInfo as any).size ?? 'N/A'} hasCache=${hasCache} → localUri=${localUri ?? 'null'}`);

      if (!isOnline && !localUri) {
        console.warn('[OFFLINE] Sin conexión y sin archivo local para:', song.id);
        Alert.alert(
          'Sin conexión',
          'Esta canción no está disponible sin internet. Guárdala en favoritos para escucharla offline.'
        );

        stableSetIsLoading(false);
        stableSetIsPlaying(false);
        return;
      }

      if (hasPersistent) {

        console.log(`[PSL] seq=${currentSequence} → RAMA: PERSISTENT`);
        if (currentSequence !== playSequenceRef.current) return;
        localFileUriRef.current = persistentUri;
        isUsingLocalFileRef.current = true;

        if (preloadedSound) {
          preloadedSoundsRef.current.delete(song.id);
          try { preloadedSound.remove(); } catch {}
        }

        sound = createAudioPlayer({ uri: persistentUri });
        attachStatusListener(sound);
        sound.play();
      }
      else if (preloadedSound) {
        try {
          sound = preloadedSound;
          preloadedSoundsRef.current.delete(song.id);
          console.log(`[PSL] seq=${currentSequence} → RAMA: PRELOADED`);

          if (localUri) {
            localFileUriRef.current = localUri;
            isUsingLocalFileRef.current = true;
          }

          if (currentSequence !== playSequenceRef.current) {
            console.log(`[PSL] PRELOADED: seq mismatch ${currentSequence} vs ${playSequenceRef.current}. ABORT.`);
            sound.remove();
            return;
          }

          attachStatusListener(sound);
          sound.play();
          console.log(`[PSL] PRELOADED: play() llamado. seq=${currentSequence}`);

          if (!localUri && isOnline) {
            const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
            if (currentSequence !== playSequenceRef.current) return;
            const targetUri = isFavorite(song.id) ? persistentUri : cacheUri;
            console.log(`[DOWNLOAD] Iniciando descarga de fondo a: ${isFavorite(song.id) ? 'Favoritos' : 'Cache'}`);
            const downloadResumable = FileSystem.createDownloadResumable(directUrl, targetUri, {});

            downloadResumableRef.current = downloadResumable;
            downloadTargetUriRef.current = targetUri;
            downloadResumable.downloadAsync().then(async (result: any) => {
              downloadResumableRef.current = null;
              downloadTargetUriRef.current = null;
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
          if (currentSequence !== playSequenceRef.current) return;
          if (localUri) {
            localFileUriRef.current = localUri;
            isUsingLocalFileRef.current = true;
            sound = createAudioPlayer({ uri: localUri });
            attachStatusListener(sound);
            sound.play();
          }
          else if (isOnline) {
            const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
            sound = createAudioPlayer({ uri: directUrl });
            attachStatusListener(sound);
            sound.play();
          }
          else {
            throw new Error('Offline and no local file');
          }
        }
      }
      else if (localUri) {
        console.log(`[PSL] seq=${currentSequence} → RAMA: LOCAL uri=${localUri}`);
        if (currentSequence !== playSequenceRef.current) {
          console.log(`[PSL] LOCAL: seq mismatch ${currentSequence} vs ${playSequenceRef.current}. ABORT.`);
          return;
        }

        try {
          localFileUriRef.current = localUri;
          isUsingLocalFileRef.current = true;
          sound = createAudioPlayer({ uri: localUri });
          attachStatusListener(sound);
          sound.play();
          console.log(`[PSL] LOCAL: play() llamado. seq=${currentSequence}`);
        }
        catch (localErr) {

          console.warn('[PSL] LOCAL: Error al reproducir archivo local, eliminando y usando stream:', localErr);
          await FileSystem.deleteAsync(localUri, { idempotent: true });
          localFileUriRef.current = null;
          isUsingLocalFileRef.current = false;

          if (!isOnline) throw new Error('Offline and local file is corrupt');

          const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
          if (currentSequence !== playSequenceRef.current) return;
          sound = createAudioPlayer({ uri: directUrl });
          attachStatusListener(sound);
          sound.play();

          const targetUri = isFavorite(song.id) ? persistentUri : cacheUri;
          const downloadResumable = FileSystem.createDownloadResumable(directUrl, targetUri, {});
          downloadResumableRef.current = downloadResumable;
          downloadTargetUriRef.current = targetUri;
          downloadResumable.downloadAsync().then(async (result: any) => {
            downloadResumableRef.current = null;
            downloadTargetUriRef.current = null;
            if (result?.uri && currentSongRef.current?.id === song.id) {
              localFileUriRef.current = result.uri;
              isUsingLocalFileRef.current = true;
            }
          })
          .catch((err: any) => console.error('Download error:', err));
        }
      }
      else if (isOnline) {

        console.log(`[PSL] seq=${currentSequence} → RAMA: NETWORK (API fetch) song.url=${song.url}`);
        const { url: directUrl } = await youtubeService.getAudioDirectUrl(song.url);
        console.log(`[PSL] NETWORK: API respondió OK. seq actual=${playSequenceRef.current} (esperado ${currentSequence}). directUrl slice=${directUrl?.slice(0,60)}`);
        if (currentSequence !== playSequenceRef.current) {
          console.log(`[PSL] NETWORK: seq mismatch tras API ${currentSequence} vs ${playSequenceRef.current}. ABORT.`);
          return;
        }

        sound = createAudioPlayer({ uri: directUrl });
        attachStatusListener(sound);
        sound.play();
        console.log(`[PSL] NETWORK: play() llamado. seq=${currentSequence}`);

        const targetUri = isFavorite(song.id) ? persistentUri : cacheUri;
        console.log(`[DOWNLOAD] Iniciando descarga de fondo a: ${isFavorite(song.id) ? 'Favoritos' : 'Cache'}`);
        const downloadResumable = FileSystem.createDownloadResumable(directUrl, targetUri, {});
        downloadResumableRef.current = downloadResumable;
        downloadTargetUriRef.current = targetUri;

        downloadResumable.downloadAsync().then(async (result: any) => {
          downloadResumableRef.current = null;
          downloadTargetUriRef.current = null;
          if (result && result.uri && currentSongRef.current?.id === song.id) {
            localFileUriRef.current = result.uri;
            isUsingLocalFileRef.current = true;
            console.log('Descarga finalizada para', song.id, 'en', result.uri);
          }
        })
        .catch((err: any) => console.error('Download error:', err));
      }
      else throw new Error('Offline and no local file');

      soundRef.current = sound;
      console.log(`[PSL] soundRef asignado. seq=${currentSequence}`);
      await addRecentPlayed(song);
      await addMostPlayed(song);

      if (currentSequence !== playSequenceRef.current) {
        console.log(`[PSL] seq mismatch tras addRecent/MostPlayed: ${currentSequence} vs ${playSequenceRef.current}. Removiendo player. ABORT.`);
        sound.remove();
        return;
      }
      console.log(`[PSL] try block completado OK. seq=${currentSequence}`);
    }
    catch (error) {
      console.error('Error playing song:', error);
      stableSetIsPlaying(false);

      if (currentSequence !== playSequenceRef.current) return;
      if (retryCountRef.current < 1) {
        retryCountRef.current++;
        const retrySequence = currentSequence;
        setTimeout(() => {
          if (retrySequence === playSequenceRef.current) {
            playSongLogicRef.current?.(song, true);
          }
        }, 1000);
      }
      else {
        retryCountRef.current = 0;
        stableSetIsLoading(false);
        Alert.alert(
          'Error de reproducción',
          `No se pudo reproducir "${song.title}"`,
          [
            { text: 'Reintentar', onPress: () => playSongLogicRef.current?.(song) },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      }
    }
    finally {
      console.log(`[PSL_FINALLY] seq=${currentSequence} currentSeq=${playSequenceRef.current} soundRef=${!!soundRef.current} soundRef.playing=${soundRef.current?.playing}`);
      if (currentSequence === playSequenceRef.current)
      {
        if (soundRef.current?.playing) {
          console.log(`[PSL_FINALLY] → ya playing, limpiando loading`);
          stableSetIsLoading(false);
          stableSetIsPlaying(true);
        }
        else if (soundRef.current) {
          console.log(`[PSL_FINALLY] → soundRef existe pero no playing. Activando safety timer 1500ms`);
          playbackSafetyTimerRef.current = setTimeout(() => {
            playbackSafetyTimerRef.current = null;
            if (currentSequence !== playSequenceRef.current) return;
            if (!soundRef.current) return;

            if (soundRef.current.playing) {
              stableSetIsPlaying(true);
              stableSetIsLoading(false);
              return;
            }

            console.warn('[SAFETY] Playback no detectado tras timeout. soundRef.playing=', soundRef.current?.playing, '| isPlayingRef=', isPlayingRef.current);
            try {
              soundRef.current.play();
              stableSetIsPlaying(true);
              stableSetIsLoading(false);
            }
            catch (e) {
              console.error('[SAFETY] Retry play falló:', e);
            }
          }, 1500);
        }
        else {
          console.log(`[PSL_FINALLY] → soundRef es null (falló o fue abortado)`);
        }
      }
      else {
        console.log(`[PSL_FINALLY] → seq mismatch (${currentSequence} vs ${playSequenceRef.current}), ignorando`);
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
      setIsIntendingToPlay(false);
    }
    else {
      soundRef.current.play();
      stableSetIsPlaying(true);
      setIsIntendingToPlay(true);
    }
  };

  const pause = async () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.pause();
      stableSetIsPlaying(false);
      setIsIntendingToPlay(false);
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

  playSongLogicRef.current = playSongLogic;

  return {
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
    playSongLogicRef,
    cancelDownload,
    cleanupLocalFile
  };
};
