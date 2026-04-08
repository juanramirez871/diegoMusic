import { useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { SongData } from '@/components/Song';
import { youtubeService } from '@/services/api';

export const usePreloader = () => {
  const preloadedSoundsRef = useRef<Map<string, Audio.Sound>>(new Map());

  const preloadNextSongs = async (currentQueue: SongData[], currentIndex: number) => {
    
    const nextSongs = currentQueue.slice(currentIndex + 1, currentIndex + 4);
    const nextSongIds = new Set(nextSongs.map(s => s.id));
    
    for (const [id, sound] of preloadedSoundsRef.current.entries()) {
      if (!nextSongIds.has(id))
      {
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
      } catch (error) {
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
