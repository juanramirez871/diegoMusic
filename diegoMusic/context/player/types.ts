import { SongData, ArtistData } from '@/components/Song';

export const CURRENT_SONG_KEY = '@current_song';
export const FAVORITES_KEY = '@favorites_songs';
export const FAVORITE_ARTISTS_KEY = '@favorite_artists';
export const RECENT_PLAYED_KEY = '@last_music_played';
export const MOST_PLAYED_KEY = '@most_played_songs';
export const FAVORITES_QUEUE_KEY = '@player_favorites_queue';
export const FAVORITES_DEFAULT_QUEUE_KEY = '@player_favorites_default_queue';
export const SEARCH_QUEUE_KEY = '@player_search_queue';
export const SEARCH_DEFAULT_QUEUE_KEY = '@player_search_default_queue';
export const QUEUE_SOURCE_KEY = '@player_queue_source';
export const SHUFFLE_KEY = '@player_shuffle';

export interface PlayerContextType {
  isMaximized: boolean;
  setIsMaximized: (value: boolean) => void;
  currentSong: SongData | null;
  setCurrentSong: (song: SongData | null) => void;
  playSong: (song: SongData, initialQueue?: SongData[], source?: 'favorites' | 'search') => void;
  favorites: SongData[];
  favoriteArtists: ArtistData[];
  recentPlayed: SongData[];
  mostPlayed: SongData[];
  toggleFavorite: (song: SongData) => void;
  toggleFavoriteArtist: (artist: ArtistData) => void;
  isFavorite: (songId: string) => boolean;
  isFavoriteArtist: (artistId: string) => boolean;
  queue: SongData[];
  setQueue: (queue: SongData[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  progress: number;
  duration: number;
  seekTo: (position: number) => void;
  isLoading: boolean;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
}
