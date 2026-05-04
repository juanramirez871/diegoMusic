import apiFetch from './api';
import type { SongData } from '@/interfaces/Song';
import type { ArtistPlayData, SongPlayData } from '@/context/player/types';

export interface PlayStats {
  recentPlayed: SongData[];
  mostPlayed: SongData[];
  artistPlays: Record<string, ArtistPlayData>;
  songPlays: Record<string, SongPlayData>;
  activeDays: string[];
  lyricsQueries: Record<string, string>;
}

export const songsPlayedService = {
  async recordPlay(song: SongData): Promise<void> {
    try {
      await apiFetch('/songs/played', {
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
      console.warn('[SongsPlayed] Failed to record play:', err);
    }
  },

  async fetchStats(): Promise<PlayStats | null> {
    try {
      return await apiFetch<PlayStats>('/songs/played/stats');
    } catch {
      return null;
    }
  },

  async updateLyricsQuery(youtubeId: string, query: string): Promise<void> {
    try {
      await apiFetch('/songs/played/lyrics-query', {
        method: 'PATCH',
        body: JSON.stringify({ youtubeId, query }),
      });
    }
    catch (err) {
      console.warn('[SongsPlayed] Failed to update lyrics query:', err);
    }
  },
};
