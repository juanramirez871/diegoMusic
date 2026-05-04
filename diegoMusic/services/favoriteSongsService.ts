import apiFetch from './api';
import type { SongData } from '@/interfaces/Song';

export const favoriteSongsService = {
  async fetchAll(): Promise<SongData[]> {
    try {
      const data = await apiFetch<{ songs: SongData[] }>('/songs/favorites');
      return data.songs ?? [];
    } catch {
      return [];
    }
  },

  async add(song: SongData): Promise<void> {
    try {
      await apiFetch('/songs/favorites', {
        method: 'POST',
        body: JSON.stringify({
          youtubeId: song.id,
          title: song.title,
          thumbnailUrl: song.thumbnail?.url ?? '',
          durationFormatted: song.duration_formatted,
          channelId: song.channel?.id ?? '',
          channelName: song.channel?.name ?? '',
          channelAvatar: song.channel?.avatar ?? song.channel?.icon ?? '',
        }),
      });
    } catch (err) {
      console.warn('[FavoriteSongs] Failed to add to DB:', err);
    }
  },

  async remove(youtubeId: string): Promise<void> {
    try {
      await apiFetch(`/songs/favorites/${encodeURIComponent(youtubeId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[FavoriteSongs] Failed to remove from DB:', err);
    }
  },
};
