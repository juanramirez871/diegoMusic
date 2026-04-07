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
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};

export const youtubeService = {
  searchVideos: async (query: string) => {
    const cacheKey = `search:${query.trim().toLowerCase()}`;
    
    if (searchCache.has(cacheKey)) {
      console.log(`[Cache Hit] for query: ${query}`);
      return searchCache.get(cacheKey) as any[];
    }

    const data = await apiFetch<any[]>(`/youtube/search/video?search=${encodeURIComponent(query)}`);
    
    searchCache.set(cacheKey, data);
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }

    return data;
  },
};

export default apiFetch;
