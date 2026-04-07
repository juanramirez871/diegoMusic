const BASE_URL = 'http://localhost:3000/api';

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
      // throw new Error(errorData.error || `HTTP error status: ${response.status}`);
      console.log(errorData.error);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};

export const youtubeService = {
  searchVideos: (query: string) => 
    apiFetch<any[]>(`/youtube/search/video?search=${encodeURIComponent(query)}`),
};


export default apiFetch;