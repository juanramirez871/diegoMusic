import { useEffect, useRef, useState } from 'react';
import type { LyricLine } from '@/interfaces/lyrics';
import { translateText, DEFAULT_TRANSLATION, SUPPORTED_LANGUAGES } from '@/services/lyricsTranslation';
import storage from '@/services/storage';
import { TranslationPrefs, UseLyricsTranslationReturn } from '@/interfaces/translations';

const TRANSLATION_PREFS_KEY = '@lyrics_translation_prefs';

export function useLyricsTranslation(
  syncedLyrics: LyricLine[] | null,
  plainLyrics: string | null,
): UseLyricsTranslationReturn {

  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translationFrom, setTranslationFrom] = useState(DEFAULT_TRANSLATION.from);
  const [translationTo, setTranslationTo] = useState(DEFAULT_TRANSLATION.to);
  const [translatedSynced, setTranslatedSynced] = useState<LyricLine[] | null>(null);
  const [translatedPlain, setTranslatedPlain] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cancelledRef = useRef(false);

  useEffect(() => {
    storage.getItem(TRANSLATION_PREFS_KEY).then((raw) => {
      if (raw) {
        try {
          const prefs: TranslationPrefs = JSON.parse(raw);
          setTranslationEnabled(prefs.enabled ?? false);
          setTranslationFrom(prefs.from ?? DEFAULT_TRANSLATION.from);
          setTranslationTo(prefs.to ?? DEFAULT_TRANSLATION.to);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    storage.setItem(TRANSLATION_PREFS_KEY, JSON.stringify({
      enabled: translationEnabled,
      from: translationFrom,
      to: translationTo,
    })).catch(() => {});
  }, [translationEnabled, translationFrom, translationTo]);

  useEffect(() => {
    cancelledRef.current = false;
    setTranslatedSynced(null);
    setTranslatedPlain(null);

    if (!translationEnabled || (!syncedLyrics && !plainLyrics)) {
      return;
    }

    const doTranslate = async () => {
      setTranslating(true);
      try {
        if (syncedLyrics && syncedLyrics.length > 0) {
          const texts = syncedLyrics.map((l) => l.text);
          const cacheKey = `${translationFrom}-${translationTo}-${texts.join('|').slice(0, 200)}`;

          let translated: string[];
          if (cacheRef.current.has(cacheKey)) {
            translated = cacheRef.current.get(cacheKey)!.split('\n');
          } else {
            translated = await translateText(texts, translationFrom, translationTo);
            cacheRef.current.set(cacheKey, translated.join('\n'));
          }

          if (!cancelledRef.current) {
            setTranslatedSynced(
              syncedLyrics.map((line, i) => ({ time: line.time, text: translated[i] ?? line.text })),
            );
          }
        }
        else if (plainLyrics) {

          const cacheKey = `plain-${translationFrom}-${translationTo}-${plainLyrics.slice(0, 200)}`;
          let translated: string;
          if (cacheRef.current.has(cacheKey)) {
            translated = cacheRef.current.get(cacheKey)!;
          }
          else {
            const lines = plainLyrics.split('\n').filter((l) => l.trim());
            const result = await translateText(lines, translationFrom, translationTo);
            translated = result.join('\n');
            cacheRef.current.set(cacheKey, translated);
          }

          if (!cancelledRef.current) {
            setTranslatedPlain(translated);
          }
        }
      }
      catch {
        if (!cancelledRef.current) {
          setTranslatedSynced(syncedLyrics);
          setTranslatedPlain(plainLyrics);
        }
      }
      finally {
        if (!cancelledRef.current) setTranslating(false);
      }
    };

    doTranslate();
    return () => { cancelledRef.current = true; };
  }, [translationEnabled, translationFrom, translationTo, syncedLyrics, plainLyrics]);

  return {
    translationEnabled,
    setTranslationEnabled,
    translationFrom,
    setTranslationFrom,
    translationTo,
    setTranslationTo,
    translatedSynced,
    translatedPlain,
    translating,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
