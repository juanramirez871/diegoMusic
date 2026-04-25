import { useEffect, useRef, useState } from 'react';
import { SongData } from '@/interfaces/Song';
import storage from '@/services/storage';

export type LyricLine = { time: number; text: string };

const LYRICS_QUERIES_KEY = '@lyrics_custom_queries';

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

const YOUTUBE_NOISE = /\b(official|music|video|audio|lyrics?|hd|hq|4k|mv|clip|vevo|visualizer|letra|traducid[ao]|subtitulad[ao]|en\s+español|explicit|clean|directed|remaster(ed)?|extended|original\s+mix|live|acoustic|remix|version|cover|demo|session|unplugged|en\s+vivo|radio\s+edit|single)\b/i;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanTitle(title: string, artist?: string): string {

  let t = title;
  if (artist) {
    const artistEscaped = escapeRegex(artist.trim());
    t = t.replace(new RegExp(`^${artistEscaped}\\s*[-–—:]\\s*`, 'i'), '');
  }

  t = t.replace(/\([^)]*\)/g, (m) => (YOUTUBE_NOISE.test(m) || /\(\d{4}\)/.test(m) ? '' : m));
  t = t.replace(/\[[^\]]*\]/g, (m) => (YOUTUBE_NOISE.test(m) || /\[\d{4}\]/.test(m) ? '' : m));
  t = t.replace(/\s*[-–—|]\s*(official|lyric|music|video|audio|hd|hq|4k|vevo|letra).*/gi, '');
  t = t.replace(/\s*\b(feat\.?|ft\.?|featuring)\b.*/gi, '');
  t = t.replace(/\s*\bprod\.?\s+\S+/gi, '');
  t = t.replace(/[-–—|,]+\s*$/, '').replace(/\s+/g, ' ').trim();

  return t;
}

export function useLyrics(currentSong: SongData | null, isOnline: boolean) {

  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[] | null>(null);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lyricsQuery, setLyricsQuery] = useState('');
  const queryCacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    setSyncedLyrics(null);
    setPlainLyrics(null);
    setNotFound(false);

    if (!currentSong || !isOnline) {
      setLyricsQuery('');
      return;
    }

    const artist = currentSong.channel.name;
    const cleanedTitle = cleanTitle(currentSong.title, artist);
    const defaultQuery = `${artist} ${cleanedTitle}`;
    setLyricsQuery(defaultQuery);

    let cancelled = false;
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        let queryToUse = defaultQuery;
        let isCustom = false;

        try {
          const raw = await storage.getItem(LYRICS_QUERIES_KEY);
          if (raw) {
            const cache: Record<string, string> = JSON.parse(raw);
            queryCacheRef.current = cache;
            if (cache[currentSong.id]) {
              queryToUse = cache[currentSong.id];
              isCustom = true;
            }
          }
        } catch {}

        if (cancelled) return;
        if (isCustom) setLyricsQuery(queryToUse);

        const url = isCustom
          ? `https://lrclib.net/api/search?q=${encodeURIComponent(queryToUse)}`
          : `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanedTitle)}&artist_name=${encodeURIComponent(artist)}`;

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

  const manualSearch = async (query: string) => {
    if (!currentSong) return;

    queryCacheRef.current[currentSong.id] = query;
    setLyricsQuery(query);
    storage.setItem(LYRICS_QUERIES_KEY, JSON.stringify(queryCacheRef.current)).catch(() => {});

    setSyncedLyrics(null);
    setPlainLyrics(null);
    setNotFound(false);
    setLoading(true);
    try {
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) { setNotFound(true); return; }
      const track = data[0];
      
      if (track.syncedLyrics) setSyncedLyrics(parseLRC(track.syncedLyrics));
      else if (track.plainLyrics) setPlainLyrics(track.plainLyrics);
      else setNotFound(true);
    }
    catch {
      setNotFound(true);
    }
    finally {
      setLoading(false);
    }
  };

  const getCurrentLineIndex = (progress: number): number => {
    if (!syncedLyrics) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].time <= progress) idx = i;
      else break;
    }

    return idx;
  };

  return { syncedLyrics, plainLyrics, loading, notFound, lyricsQuery, getCurrentLineIndex, manualSearch };
}
