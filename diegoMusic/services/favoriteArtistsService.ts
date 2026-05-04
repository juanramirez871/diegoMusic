import apiFetch from './api';
import type { ArtistData } from '@/interfaces/Song';

export const favoriteArtistsService = {
  async fetchAll(): Promise<ArtistData[]> {
    try {
      const data = await apiFetch<{ artists: ArtistData[] }>('/artists/favorites');
      return data.artists ?? [];
    }
    catch {
      return [];
    }
  },

  async add(artist: ArtistData): Promise<void> {
    try {
      await apiFetch('/artists/favorites', {
        method: 'POST',
        body: JSON.stringify({ channelId: artist.id, name: artist.name, avatar: artist.avatar }),
      });
    }
    catch (err) {
      console.warn('[FavoriteArtists] Failed to add to DB:', err);
    }
  },

  async remove(channelId: string): Promise<void> {
    try {
      await apiFetch(`/artists/favorites/${encodeURIComponent(channelId)}`, {
        method: 'DELETE',
      });
    }
    catch (err) {
      console.warn('[FavoriteArtists] Failed to remove from DB:', err);
    }
  },
};
