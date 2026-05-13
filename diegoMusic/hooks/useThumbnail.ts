import { useState, useEffect } from 'react';
import * as FileSystem from '@/utils/fileSystem';
import { useLibrary } from '@/context/PlayerContext';

export const useThumbnail = (songId: string | undefined, remoteUrl: string | undefined) => {

  const { isFavorite } = useLibrary();
  const [localExists, setLocalExists] = useState(false);
  const favoriteStatus = songId ? isFavorite(songId) : false;
  const normalizedRemote = typeof remoteUrl === 'string' ? remoteUrl.trim() : '';
  const isYoutubeThumb = /ytimg\.com|googleusercontent\.com/i.test(normalizedRemote);
  const shouldPreferLocal = !normalizedRemote || isYoutubeThumb;

  useEffect(() => {
    let isMounted = true;
    async function checkFile() {
      if (songId && favoriteStatus) {
        const thumbUri = `${FileSystem.documentDirectory}${songId}_thumb.jpg`;
        try {
          const info = await FileSystem.getInfoAsync(thumbUri);
          if (isMounted) setLocalExists(info.exists);
        }
        catch (e) {
          if (isMounted) setLocalExists(false);
        }
      }
      else {
        if (isMounted) setLocalExists(false);
      }
    }
    checkFile();
    return () => { isMounted = false; };
  }, [songId, favoriteStatus]);

  if (normalizedRemote && !shouldPreferLocal) return { uri: normalizedRemote };
  if (localExists && songId) return { uri: `${FileSystem.documentDirectory}${songId}_thumb.jpg` };
  if (normalizedRemote) return { uri: normalizedRemote };

  return require("@/assets/images/cover.jpg");
};
