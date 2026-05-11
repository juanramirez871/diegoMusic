import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from '@/utils/fileSystem';
import { usePlayer } from '@/context/PlayerContext';

export function usePendingDownloads(): number {
  
  const { favorites, downloadVersion } = usePlayer();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setPending(0);
      return;
    }

    let cancelled = false;
    (async () => {
      const checks = await Promise.all(
        favorites.map(async (song) => {
          try {
            const info = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${song.id}.mp3`);
            return info.exists && (info as any).size > 100000;
          }
          catch {
            return false;
          }
        }),
      );
      if (!cancelled) setPending(checks.filter((ok) => !ok).length);
    })();

    return () => { cancelled = true; };
  }, [favorites, downloadVersion]);

  return pending;
}
