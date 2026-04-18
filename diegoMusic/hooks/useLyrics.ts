import { useEffect, useState } from 'react';
import { SongData } from '@/interfaces/Song';

export type LyricLine = { time: number; text: string };

function parseLRC(lrc: string): LyricLine[] {
  const result: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  for (const line of lrc.split('\n'))
  {
    const match = line.match(regex);
    if (match) {
      const ms = (parseInt(match[1]) * 60 + parseInt(match[2])) * 1000 + parseInt(match[3].padEnd(3, '0'));
      const text = match[4].trim();
      if (text) result.push({ time: ms, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

function cleanTitle(title: string): string {
  return title
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useLyrics(currentSong: SongData | null, isOnline: boolean) {

  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[] | null>(null);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setSyncedLyrics(null);
    setPlainLyrics(null);
    setNotFound(false);

    if (!currentSong || !isOnline) return;

    let cancelled = false;
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const title = cleanTitle(currentSong.title);
        const artist = currentSong.channel.name;
        console.log(`Title ${title} artist ${artist}`)
        const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (cancelled) return;
        if (!Array.isArray(data) || data.length === 0) {
          setNotFound(true);
          return;
        }

        const track = data[0];
        if (track.syncedLyrics) setSyncedLyrics(parseLRC(track.syncedLyrics));
        else if (track.plainLyrics) setPlainLyrics(track.plainLyrics);
        else setNotFound(true);
      }
      catch {
        if (!cancelled) setNotFound(true);
      }
      finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLyrics();
    return () => { cancelled = true; };
  }, [currentSong?.id, isOnline]);

  const getCurrentLineIndex = (progress: number): number => {
    if (!syncedLyrics) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].time <= progress) idx = i;
      else break;
    }

    return idx;
  };

  return { syncedLyrics, plainLyrics, loading, notFound, getCurrentLineIndex };
}
