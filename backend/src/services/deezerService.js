const DEEZER_API_BASE = 'https://api.deezer.com';
const normalize = (value = '') => String(value).trim();
const buildQuery = ({ title, artist, album }) => {
  const chunks = [];
  if (title) chunks.push(`track:"${title}"`);
  if (artist) chunks.push(`artist:"${artist}"`);
  if (album) chunks.push(`album:"${album}"`);
  if (chunks.length === 0) return '';
  return chunks.join(' ');
};

const YOUTUBE_NOISE = /\b(official|music|video|audio|lyrics?|hd|hq|4k|mv|clip|vevo|visualizer|letra|traducid[ao]|subtitulad[ao]|explicit|clean|directed|remaster(ed)?|extended|original\s+mix|live|acoustic|remix|version|cover|demo|session|unplugged|radio\s+edit|single)\b/gi;
const removeDiacritics = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const sanitizeText = (value = '') => {
  let v = normalize(value);
  v = v.replace(/\([^)]*\)/g, ' ');
  v = v.replace(/\[[^\]]*\]/g, ' ');
  v = v.replace(/\s*[-–—|]\s*(official|lyric|music|video|audio|hd|hq|4k|vevo|letra).*/gi, ' ');
  v = v.replace(/\b(feat\.?|ft\.?|featuring)\b.*$/gi, ' ');
  v = v.replace(YOUTUBE_NOISE, ' ');
  v = v.replace(/[–—]/g, '-');
  v = v.replace(/\s+/g, ' ').trim();
  return v;
};

const splitRawTitle = (rawTitle = '') => {
  const value = sanitizeText(rawTitle);
  const separators = [' - ', ' – ', ' — ', ' | ', ': '];
  for (const sep of separators)
  {
    if (value.includes(sep)) {
      const [left, ...rest] = value.split(sep);
      const right = rest.join(sep).trim();
      if (left && right) return { inferredArtist: left.trim(), inferredTitle: right };
    }
  }

  return { inferredArtist: '', inferredTitle: value };
};

const similarityScore = (needle = '', hay = '') => {
  const a = removeDiacritics(needle.toLowerCase());
  const b = removeDiacritics(hay.toLowerCase());

  if (!a || !b) return 0;
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.8;

  const tokens = a.split(' ').filter(Boolean);
  if (tokens.length === 0) return 0;
  const matched = tokens.filter((t) => b.includes(t)).length;

  return matched / tokens.length;
};

const scoreTrack = (track, expected) => {
  const title = track?.title ?? '';
  const artist = track?.artist?.name ?? '';
  const album = track?.album?.title ?? '';
  const titleScore = expected.title ? similarityScore(expected.title, title) : 0;
  const artistScore = expected.artist ? similarityScore(expected.artist, artist) : 0;
  const albumScore = expected.album ? similarityScore(expected.album, album) : 0;
  const base = (titleScore * 0.6) + (artistScore * 0.35) + (albumScore * 0.05);
  return Number(base.toFixed(4));
};

const buildQueryPlan = ({ title, artist, album, rawTitle }) => {
  const plan = [];
  const safeTitle = sanitizeText(title);
  const safeArtist = sanitizeText(artist);
  const safeAlbum = sanitizeText(album);
  const parsedRaw = splitRawTitle(rawTitle || title || '');
  const rawInferredArtist = sanitizeText(parsedRaw.inferredArtist);
  const shouldPreferRawArtist = rawInferredArtist && (!safeArtist || similarityScore(rawInferredArtist, safeArtist) < 0.5);
  const inferredArtist = shouldPreferRawArtist ? rawInferredArtist : (safeArtist || rawInferredArtist);
  const inferredTitle = safeTitle || parsedRaw.inferredTitle;

  const push = (query) => {
    if (!query) return;
    if (!plan.includes(query)) plan.push(query);
  };

  push(buildQuery({ title: inferredTitle, artist: inferredArtist, album: safeAlbum }));
  if (inferredArtist && inferredTitle) push(`artist:"${inferredArtist}" ${inferredTitle}`);
  if (inferredArtist && inferredTitle) push(`${inferredArtist} ${inferredTitle}`);
  if (rawTitle) push(sanitizeText(rawTitle));
  if (inferredTitle) push(inferredTitle);

  return {
    plan,
    normalized: {
      title: inferredTitle,
      artist: inferredArtist,
      album: safeAlbum,
      rawTitle: sanitizeText(rawTitle || ''),
    },
  };
};

const searchByQuery = async (query, limit) => {

  const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${Number(limit) || 5}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Deezer request failed with status ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data?.data) ? data.data : [];
  return items;
};

const searchArtistByQuery = async (query, limit) => {

  const url = `${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(query)}&limit=${Number(limit) || 5}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Deezer artist request failed with status ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data?.data) ? data.data : [];
  return items;
};

const pickBestCover = (track) => {
  const album = track?.album ?? {};
  return album.cover_xl || album.cover_big || album.cover_medium || album.cover || null;
};

export const searchTrackCover = async ({ title, artist, album, rawTitle, limit = 5 }) => {
  const inputRawTitle = normalize(rawTitle || title);
  const { plan, normalized } = buildQueryPlan({
    title,
    artist,
    album,
    rawTitle: inputRawTitle,
  });

  if (plan.length === 0) {
    throw new Error('At least one of title, artist, album is required');
  }

  let attempts = [];
  let combined = [];
  for (const query of plan) {
    const items = await searchByQuery(query, limit);
    attempts.push({ query, results: items.length });
    combined = combined.concat(items.map((item) => ({ ...item, __query: query })));
    if (items.length > 0) break;
  }

  const dedupMap = new Map();
  for (const item of combined) {
    if (!dedupMap.has(item.id)) dedupMap.set(item.id, item);
  }
  const ranked = [...dedupMap.values()]
    .map((track) => ({ track, score: scoreTrack(track, normalized) }))
    .sort((a, b) => b.score - a.score);

  const bestEntry = ranked[0] ?? null;
  const best = bestEntry?.track ?? null;

  return {
    query: attempts[0]?.query ?? '',
    attempts,
    total: ranked.length,
    normalized,
    best: best
      ? {
          id: best.id,
          title: best.title,
          artist: best.artist?.name ?? null,
          album: best.album?.title ?? null,
          cover: pickBestCover(best),
          covers: {
            xl: best.album?.cover_xl ?? null,
            big: best.album?.cover_big ?? null,
            medium: best.album?.cover_medium ?? null,
            small: best.album?.cover_small ?? null,
          },
          preview: best.preview ?? null,
          deezerUrl: best.link ?? null,
          score: bestEntry?.score ?? 0,
          matchedByQuery: best.__query ?? null,
        }
      : null,
  };
};

export const searchArtistImage = async ({ artist, rawTitle, limit = 5 }) => {

  const safeArtist = sanitizeText(artist);
  const parsedRaw = splitRawTitle(rawTitle || '');
  const inferredArtist = safeArtist || sanitizeText(parsedRaw.inferredArtist);

  if (!inferredArtist) {
    throw new Error('artist or rawTitle is required');
  }

  const attempts = [];
  const queries = [inferredArtist, sanitizeText(rawTitle || '')].filter(Boolean);
  let combined = [];

  for (const query of queries) {
    const items = await searchArtistByQuery(query, limit);
    attempts.push({ query, results: items.length });
    combined = combined.concat(items.map((item) => ({ ...item, __query: query })));
    if (items.length > 0) break;
  }

  const dedupMap = new Map();
  for (const item of combined) {
    if (!dedupMap.has(item.id)) dedupMap.set(item.id, item);
  }

  const ranked = [...dedupMap.values()]
    .map((entry) => ({
      artist: entry,
      score: similarityScore(inferredArtist, entry?.name ?? ''),
    }))
    .sort((a, b) => b.score - a.score);

  const bestEntry = ranked[0] ?? null;
  const best = bestEntry?.artist ?? null;

  return {
    query: attempts[0]?.query ?? inferredArtist,
    attempts,
    total: ranked.length,
    normalized: {
      artist: inferredArtist,
      rawTitle: sanitizeText(rawTitle || ''),
    },
    best: best
      ? {
          id: best.id,
          name: best.name ?? null,
          image: best.picture_xl || best.picture_big || best.picture_medium || best.picture || null,
          images: {
            xl: best.picture_xl ?? null,
            big: best.picture_big ?? null,
            medium: best.picture_medium ?? null,
            small: best.picture_small ?? null,
          },
          deezerUrl: best.link ?? null,
          score: bestEntry?.score ?? 0,
          matchedByQuery: best.__query ?? null,
        }
      : null,
  };
};
