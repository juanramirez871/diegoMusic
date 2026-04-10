import { SongData } from '@/components/Song';
import { youtubeService } from '@/services/api';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef } from 'react';

export const usePreloader = () => {
  const preloadedSoundsRef = useRef<Map<string, Audio.Sound>>(new Map());

  const preloadNextSongs = async (currentQueue: SongData[], currentIndex: number) => {
    
    const currentSong = currentQueue[currentIndex];
    const nextSongs = currentQueue.slice(currentIndex + 1, currentIndex + 4);
    const idsToKeep = new Set([currentSong.id, ...nextSongs.map(s => s.id)]);
    
    for (const [id, sound] of preloadedSoundsRef.current.entries())
    {
      if (!idsToKeep.has(id))
      {
        await sound.unloadAsync();
        preloadedSoundsRef.current.delete(id);
        
        const cacheUri = `${FileSystem.cacheDirectory}${id}.mp3`;
        const cacheInfo = await FileSystem.getInfoAsync(cacheUri);
        if (cacheInfo.exists) {
          await FileSystem.deleteAsync(cacheUri, { idempotent: true }).catch(() => {});
        }
      }
    }

    for (const song of nextSongs)
    {
      const persistentUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
      let fileInfo = await FileSystem.getInfoAsync(persistentUri);
      let localUri = persistentUri;
      
      if (!fileInfo.exists) {

        localUri = `${FileSystem.cacheDirectory}${song.id}.mp3`;
        fileInfo = await FileSystem.getInfoAsync(localUri);
        
        if (!fileInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            youtubeService.getAudioDownloadUrl(song.url),
            localUri,
            {}
          );
          
          try {
            const downloadResult = await downloadResumable.downloadAsync();
            if (downloadResult && downloadResult.uri) {
              console.log(`[PRELOADED] Descarga finalizada para ${song.id} en ${downloadResult.uri}`);
              fileInfo = await FileSystem.getInfoAsync(localUri);
            }
          }
          catch (err) {
            console.error(`[PRELOADED] Error descargando song ${song.id}:`, err);
            continue;
          }
        }
      }

      const MIN_FILE_SIZE = 5 * 1024;
      if (!fileInfo.exists || (fileInfo.size !== undefined && fileInfo.size < MIN_FILE_SIZE)) {
        console.warn(`[PRELOADED] Archivo corrupto o demasiado pequeño ${song.id}, eliminando`);
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
        continue;
      }

      if (!preloadedSoundsRef.current.has(song.id)) {
        try {
          console.log(`[PRELOADED] Cargando sound para ${song.id} desde ${localUri}`);
          const { sound, status } = await Audio.Sound.createAsync(
            { uri: localUri },
            { shouldPlay: false }
          );

          if (status.isLoaded) preloadedSoundsRef.current.set(song.id, sound);
          else await sound.unloadAsync();

        }
        catch (error) {
          console.warn(`[PRELOADED] Error al crear objeto de sonido para ${song.id}:`, error);
          if (localUri.includes(FileSystem.cacheDirectory ?? '')) {
            await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
          }
        }
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
