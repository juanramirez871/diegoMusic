import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { usePlayer } from '@/context/PlayerContext';

export const useThumbnail = (songId: string | undefined, remoteUrl: string | undefined) => {
  const { isFavorite } = usePlayer();
  const [localExists, setLocalExists] = useState(false);
  const favoriteStatus = songId ? isFavorite(songId) : false;

  useEffect(() => {
    let isMounted = true;
    async function checkFile() {
      if (songId && favoriteStatus) {
        const thumbUri = `${FileSystem.documentDirectory}${songId}_thumb.jpg`;
        try {
          const info = await FileSystem.getInfoAsync(thumbUri);
          if (isMounted) setLocalExists(info.exists);
        } catch (e) {
          if (isMounted) setLocalExists(false);
        }
      } else {
        if (isMounted) setLocalExists(false);
      }
    }
    checkFile();
    return () => { isMounted = false; };
  }, [songId, favoriteStatus]);

  if (localExists && songId) {
    return { uri: `${FileSystem.documentDirectory}${songId}_thumb.jpg` };
  }
  
  if (remoteUrl) {
    return { uri: remoteUrl };
  }

  return require("@/assets/images/cover.jpg");
};
