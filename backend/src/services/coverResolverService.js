import { searchArtistImage, searchTrackCover } from './deezerService.js';

const ITUNES_API_BASE = 'https://itunes.apple.com/search';
const normalize = (value = '') => String(value).trim();
const toScore = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const upsizeItunesArtwork = (url) => {
  if (!url) return null;
  return url.replace(/\d+x\d+bb\.jpg$/, '1000x1000bb.jpg');
};

const searchItunesCover = async ({ title, artist, album, limit = 5 }) => {

  const terms = [normalize(artist), normalize(title), normalize(album)].filter(Boolean).join(' ');
  if (!terms) return null;

  const url = `${ITUNES_API_BASE}?term=${encodeURIComponent(terms)}&entity=song&limit=${Number(limit) || 5}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`iTunes request failed with status ${response.status}`);

  const data = await response.json();
  const first = Array.isArray(data?.results) ? data.results[0] : null;
  if (!first) return null;

  const cover = upsizeItunesArtwork(first.artworkUrl100);
  return {
    source: 'itunes',
    confidence: 0.65,
    best: {
      id: first.trackId,
      title: first.trackName ?? null,
      artist: first.artistName ?? null,
      album: first.collectionName ?? null,
      cover,
      covers: {
        xl: cover,
        big: cover,
        medium: first.artworkUrl100 ?? null,
        small: first.artworkUrl60 ?? null,
      },
      preview: first.previewUrl ?? null,
      deezerUrl: null,
      score: 0.65,
      matchedByQuery: terms,
      trackViewUrl: first.trackViewUrl ?? null,
    },
    attempts: [{ query: terms, results: data?.resultCount ?? 0 }],
  };
};

export const resolveCover = async ({ title, artist, album, rawTitle, limit = 5, minScore = 0.72 }) => {

  const deezer = await searchTrackCover({ title, artist, album, rawTitle, limit });
  const deezerScore = toScore(deezer?.best?.score, 0);
  if (deezer?.best && deezerScore >= Number(minScore)) {
    return {
      source: 'deezer',
      confidence: deezerScore,
      minScore: Number(minScore),
      ...deezer,
    };
  }

  const itunes = await searchItunesCover({ title: title || rawTitle, artist, album, limit });
  if (itunes?.best)
  {
    return {
      source: 'itunes',
      confidence: itunes.confidence,
      minScore: Number(minScore),
      fallbackFrom: {
        deezerScore,
        deezerMatched: deezer?.best?.matchedByQuery ?? null,
      },
      normalized: deezer?.normalized,
      best: itunes.best,
      attempts: [...(deezer?.attempts ?? []), ...(itunes.attempts ?? [])],
      total: 1,
    };
  }

  if (deezer?.best)
  {
    return {
      source: 'deezer',
      confidence: deezerScore,
      minScore: Number(minScore),
      lowConfidence: true,
      normalized: deezer?.normalized,
      best: deezer.best,
      attempts: deezer?.attempts ?? [],
      total: deezer?.total ?? 1,
    };
  }

  return {
    source: 'none',
    confidence: 0,
    minScore: Number(minScore),
    normalized: deezer?.normalized,
    attempts: deezer?.attempts ?? [],
    total: 0,
    best: null,
  };
};

export const resolveArtistImage = async ({ artist, rawTitle, limit = 5, minScore = 0.72 }) => {

  const deezer = await searchArtistImage({ artist, rawTitle, limit });
  const deezerScore = toScore(deezer?.best?.score, 0);
  if (deezer?.best)
  {
    return {
      source: 'deezer',
      confidence: deezerScore,
      minScore: Number(minScore),
      lowConfidence: deezerScore < Number(minScore),
      normalized: deezer?.normalized,
      best: deezer.best,
      attempts: deezer?.attempts ?? [],
      total: deezer?.total ?? 1,
    };
  }

  return {
    source: 'none',
    confidence: 0,
    minScore: Number(minScore),
    normalized: deezer?.normalized,
    attempts: deezer?.attempts ?? [],
    total: 0,
    best: null,
  };
};
