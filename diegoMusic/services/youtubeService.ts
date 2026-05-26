import apiFetch from './api';
import { API_URL } from './apiUrl';
import { Platform } from 'react-native';

const BASE_URL = API_URL;
const searchCache = new Map<string, any[]>();

export const youtubeService = {
  extractVideoList: (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.videos)) return payload.videos;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  },

  mapSearchToSongData: (video: any) => ({
    id: typeof video.id === 'string' ? video.id : video.id?.videoId || Math.random().toString(36).substring(7),
    url: `https://www.youtube.com/watch?v=${typeof video.id === 'string' ? video.id : video.id?.videoId}`,
    title: video.title,
    thumbnail: {
      url: video.thumbnail?.url || "",
    },
    channel: {
      name: video.channel?.name || "Unknown",
      id: video.channel?.id,
      avatar: video.channel?.icon || "",
    },
    duration_formatted: video.duration_formatted || "00:00",
  }),

  mapChannelToSongData: (video: any) => ({
    id: video.videoId || video.id || video.id?.videoId || Math.random().toString(36).substring(7),
    url: `https://www.youtube.com/watch?v=${video.videoId || video.id || video.id?.videoId}`,
    title: video.title?.text || video.title || '',
    thumbnail: {
      url:
        video.videoThumbnails?.sort((a: any, b: any) => b.width - a.width)[0]?.url ||
        video.thumbnail?.url ||
        "",
    },
    channel: {
      name: video.author || video.channel?.name || 'Unknown',
      id: video.authorId || video.channel?.id,
      avatar: video.authorAvatar || video.channel?.icon || '',
    },
    duration_formatted: video.durationText || video.duration_formatted || "00:00",
  }),

  searchVideos: async (query: string, limit: number = 21) => {
    const cacheKey = `search:${query.trim().toLowerCase()}`;

    if (searchCache.has(cacheKey)) {
      console.log(`[Cache Hit] for query: ${query}`);
      return searchCache.get(cacheKey) as any[];
    }

    const data = await apiFetch<any>(`/youtube/search/video?search=${encodeURIComponent(query)}&limit=${limit}`);
    const mappedData = youtubeService.extractVideoList(data).map(youtubeService.mapSearchToSongData);

    searchCache.set(cacheKey, mappedData);
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }

    return mappedData;
  },

  getChannelVideos: async (channelId: string) => {

    const cacheKey = `channel:${channelId.trim().toLowerCase()}`;
    if (searchCache.has(cacheKey)) {
      console.log(`[Cache Hit] for channel: ${channelId}`);
      return searchCache.get(cacheKey) as any[];
    }

    const data = await apiFetch<any>(`/youtube/search/channel/videos?channelId=${encodeURIComponent(channelId)}`);
    const mappedData = youtubeService.extractVideoList(data).map(youtubeService.mapChannelToSongData);

    searchCache.set(cacheKey, mappedData);
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }

    return mappedData;
  },

  getAudioDownloadUrl: (url: string, startSeconds: number = 0) => {
    return `${BASE_URL}/youtube/audio/download?url=${encodeURIComponent(url)}&start=${startSeconds}`;
  },

  getAudioDirectUrl: async (url: string): Promise<{ url: string; mimeType: string }> => {
    if (Platform.OS === 'web') {
      return { url: `${BASE_URL}/youtube/audio/download?url=${encodeURIComponent(url)}`, mimeType: 'audio/mp4' };
    }

    try {
      const direct = await apiFetch<{ url: string; mimeType: string }>(`/youtube/audio/url?url=${encodeURIComponent(url)}`);
      if (direct?.url) return direct;
    }
    catch (error) {
      console.warn('[youtubeService] /audio/url failed, fallback to /audio/download', error);
    }

    return { url: `${BASE_URL}/youtube/audio/download?url=${encodeURIComponent(url)}`, mimeType: 'audio/mp4' };
  },

  prefetchAudio: (url: string): void => {
    fetch(`${BASE_URL}/youtube/audio/prefetch?url=${encodeURIComponent(url)}`).catch(() => {});
  },

  warmAudio: async (url: string, timeoutMs: number = 25000): Promise<boolean> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${BASE_URL}/youtube/audio/warm?url=${encodeURIComponent(url)}`, { signal: controller.signal });
      return res.ok;
    }
    catch {
      return false;
    }
    finally {
      clearTimeout(t);
    }
  },

  getVideoStreamUrl: (url: string, quality: 'low' | 'medium' | 'high' = 'low') => {
    return `${BASE_URL}/youtube/video/stream?url=${encodeURIComponent(url)}&quality=${quality}`;
  },
};
