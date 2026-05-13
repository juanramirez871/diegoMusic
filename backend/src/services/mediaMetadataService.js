import * as coverResolverService from './coverResolverService.js';

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();
const inflight = new Map();
const normalize = (value = '') => String(value).trim().toLowerCase();

const getCached = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if ((Date.now() - hit.at) > TTL_MS) {
    cache.delete(key);
    return null;
  }

  return hit.value;
};

const setCached = (key, value) => {
  cache.set(key, { at: Date.now(), value });
  return value;
};

const withInflight = async (key, fn) => {
  const cached = getCached(key);
  if (cached) return cached;
  if (inflight.has(key)) return inflight.get(key);

  const promise = fn()
    .then((value) => setCached(key, value))
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
};

const warmInflight = (key, fn) => {
  if (getCached(key) || inflight.has(key)) return;
  const promise = fn()
    .then((value) => setCached(key, value))
    .catch(() => null)
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
};

const withTimeout = async (promise, ms = 1800) => {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });

  const result = await Promise.race([promise, timeout]);
  clearTimeout(timer);
  return result;
};

export const resolveTrackCoverCached = async ({ title, artist, rawTitle }) => {
  const key = `track:${normalize(title)}|${normalize(artist)}|${normalize(rawTitle)}`;
  return withInflight(key, async () => {
    const result = await coverResolverService.resolveCover({
      title,
      artist,
      rawTitle,
      minScore: 0,
      limit: 3,
    });

    return result?.best?.cover || null;
  });
};

export const getTrackCoverFromCache = ({ title, artist, rawTitle }) => {
  const key = `track:${normalize(title)}|${normalize(artist)}|${normalize(rawTitle)}`;
  return getCached(key);
};

export const warmTrackCover = ({ title, artist, rawTitle }) => {
  const key = `track:${normalize(title)}|${normalize(artist)}|${normalize(rawTitle)}`;
  warmInflight(key, async () => {
    const result = await coverResolverService.resolveCover({
      title,
      artist,
      rawTitle,
      minScore: 0,
      limit: 3,
    });

    return result?.best?.cover || null;
  });
};

export const resolveArtistImageCached = async ({ artist, rawTitle }) => {
  const key = `artist:${normalize(artist)}|${normalize(rawTitle)}`;
  return withInflight(key, async () => {
    const result = await coverResolverService.resolveArtistImage({
      artist,
      rawTitle,
      minScore: 0,
      limit: 3,
    });

    return result?.best?.image || null;
  });
};

export const getArtistImageFromCache = ({ artist, rawTitle }) => {
  const key = `artist:${normalize(artist)}|${normalize(rawTitle)}`;
  return getCached(key);
};

export const warmArtistImage = ({ artist, rawTitle }) => {
  const key = `artist:${normalize(artist)}|${normalize(rawTitle)}`;
  warmInflight(key, async () => {
    const result = await coverResolverService.resolveArtistImage({
      artist,
      rawTitle,
      minScore: 0,
      limit: 3,
    });

    return result?.best?.image || null;
  });
};

export const enrichMediaMetadata = async ({ title, artistName, thumbnailUrl, artistAvatar }) => {
  const [cover, avatar] = await Promise.all([
    withTimeout(resolveTrackCoverCached({ title, artist: artistName, rawTitle: title })),
    withTimeout(resolveArtistImageCached({ artist: artistName, rawTitle: title })),
  ]);

  return {
    thumbnailUrl: cover || thumbnailUrl || '',
    artistAvatar: avatar || artistAvatar || '',
  };
};

export const enrichFromCacheAndWarm = ({ title, artistName, thumbnailUrl, artistAvatar }) => {
  const cover = getTrackCoverFromCache({ title, artist: artistName, rawTitle: title });
  const avatar = getArtistImageFromCache({ artist: artistName, rawTitle: title });

  warmTrackCover({ title, artist: artistName, rawTitle: title });
  warmArtistImage({ artist: artistName, rawTitle: title });

  return {
    thumbnailUrl: cover || thumbnailUrl || '',
    artistAvatar: avatar || artistAvatar || '',
  };
};
