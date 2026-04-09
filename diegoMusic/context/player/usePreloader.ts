import { SongData } from '@/components/Song';
import { youtubeService } from '@/services/api';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef } from 'react';

export const usePreloader = () => {
  const preloadedSoundsRef = useRef<Map<string, Audio.Sound>>(new Map());

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

    for (const song of nextSongs)
    {
      const localUri = `${(FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory}${song.id}.mp3`;
      try {

        let fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            youtubeService.getAudioDownloadUrl(song.url),
            localUri,
            {}
          );

          const downloadResult = await downloadResumable.downloadAsync().catch(err => {
            console.error(`Error downloading preloaded song ${song.id}:`, err);
            return null;
          });

          if (downloadResult && downloadResult.uri) {
            console.log(`Descarga finalizada para preload ${song.id} en ${downloadResult.uri}`);
          }

          fileInfo = await FileSystem.getInfoAsync(localUri);
        }

        const MIN_FILE_SIZE = 10 * 1024;
        let isValidMp3 = false;
        if (fileInfo.exists && fileInfo.size !== undefined && fileInfo.size >= MIN_FILE_SIZE)
        {
          try {
            const fileHandle = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
            const firstBytesString = atob(fileHandle.slice(0, 4));
            const b0 = firstBytesString.charCodeAt(0);
            const b1 = firstBytesString.charCodeAt(1);
            const b2 = firstBytesString.charCodeAt(2);
            if (
              (b0 === 0x49 && b1 === 0x44 && b2 === 0x33) ||
              (b0 === 0xFF && (b1 & 0xE0) === 0xE0)
            ) {
              isValidMp3 = true;
            }
          }
          catch (e) {
            console.warn(`[PRELOADED] Error leyendo bytes para validar mp3: ${song.id}`, e);
          }
        }
        
        if (!fileInfo.exists || (fileInfo.size !== undefined && fileInfo.size < MIN_FILE_SIZE) || !isValidMp3) {
          console.warn(`Archivo preloaded corrupto ${song.id}, eliminando`);
          await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
          continue;
        }

        if (!preloadedSoundsRef.current.has(song.id))
        {
          const sourceUri = localUri;
          console.log(`[PRELOADED] Creando sound pre-cargado para ${song.id} en ${sourceUri}`);
          const { sound, status } = await Audio.Sound.createAsync(
            { uri: sourceUri },
            { shouldPlay: false }
          );

          if (status.isLoaded) {
            console.log(`[PRELOADED] Sound pre-cargado y guardado para ${song.id}`);
            preloadedSoundsRef.current.set(song.id, sound);
          }
          else {
            console.warn(`[PRELOADED] No se pudo cargar el sound preloaded para ${song.id}`);
            await sound.unloadAsync();
          }
        }
      }
      catch (error) {
        console.error(`Error preloading song ${song.id}:`, error);
      }
    }
  };

  const clearPreloaded = async () => {
    for (const sound of preloadedSoundsRef.current.values()) {
      await sound.unloadAsync();
    }
    preloadedSoundsRef.current.clear();
  };

  return {
    preloadedSoundsRef,
    preloadNextSongs,
    clearPreloaded
  };
};
