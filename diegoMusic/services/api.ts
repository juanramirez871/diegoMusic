const BASE_URL = 'http://localhost:3000/api';

const searchCache = new Map<string, any[]>();

const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData.error);
    }

    return await response.json();
  }
  catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};

export const youtubeService = {
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
    id: video.videoId,
    url: `https://www.youtube.com/watch?v=${video.videoId}`,
    title: video.title,
    thumbnail: {
      url: video.videoThumbnails?.sort((a: any, b: any) => b.width - a.width)[0]?.url || "",
    },
    channel: {
      name: video.author,
      id: video.authorId,
      avatar:  video.videoThumbnails?.sort((a: any, b: any) => b.width - a.width)[0]?.url || "",
    },
    duration_formatted: video.durationText || "00:00",
  }),

  searchVideos: async (query: string, limit: number = 21) => {
    const cacheKey = `search:${query.trim().toLowerCase()}`;
    
    if (searchCache.has(cacheKey)) {
      console.log(`[Cache Hit] for query: ${query}`);
      return searchCache.get(cacheKey) as any[];
    }

    const data = await apiFetch<any[]>(`/youtube/search/video?search=${encodeURIComponent(query)}&limit=${limit}`);
    const mappedData = (Array.isArray(data) ? data : []).map(youtubeService.mapSearchToSongData);
    
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

    const data = await apiFetch<any[]>(`/youtube/search/channel/videos?channelId=${encodeURIComponent(channelId)}`);
    const mappedData = (Array.isArray(data) ? data : []).map(youtubeService.mapChannelToSongData);
    
    searchCache.set(cacheKey, mappedData);
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }

    return mappedData;
  },
  getAudioDownloadUrl: (url: string) => {
    return `${BASE_URL}/youtube/audio/download?url=${encodeURIComponent(url)}`;
  },
};

export default apiFetch;
