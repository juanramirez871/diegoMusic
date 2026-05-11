import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from '@/utils/fileSystem';
import { usePlayer } from '@/context/PlayerContext';

export function useIsDownloaded(songId?: string): boolean {
  const { favorites } = usePlayer();
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' || !songId) {
      setDownloaded(false);
      return;
    }

    let cancelled = false;
    const uri = `${FileSystem.documentDirectory}${songId}.mp3`;

    FileSystem.getInfoAsync(uri)
      .then((info) => {
        if (cancelled) return;
        setDownloaded(info.exists && (info as any).size > 100000);
      })
      .catch(() => !cancelled && setDownloaded(false));

    return () => { cancelled = true; };
  }, [songId, favorites]);

  return downloaded;
}
