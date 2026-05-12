import apiFetch from './api';
import type { ArtistData } from '@/interfaces/Song';

export const favoriteArtistsService = {
  async fetchAll(): Promise<ArtistData[] | null> {
    try {
      const data = await apiFetch<{ artists: ArtistData[] }>('/artists/favorites');
      return data.artists ?? [];
    }
    catch {
      return null;
    }
  },

  async add(artist: ArtistData): Promise<ArtistData | null> {
    try {
      const res = await apiFetch<{ artist?: ArtistData }>('/artists/favorites', {
        method: 'POST',
        body: JSON.stringify({ channelId: artist.id, name: artist.name, avatar: artist.avatar }),
      });
      return res.artist ?? null;
    }
    catch (err) {
      console.warn('[FavoriteArtists] Failed to add to DB:', err);
      return null;
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
