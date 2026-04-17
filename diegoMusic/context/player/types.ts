import { ArtistData, SongData } from "@/interfaces/Song";


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
export const REPEAT_KEY = '@player_repeat';
export const ACTIVE_DAYS_KEY = '@player_active_days';
export type RepeatMode = 'off' | 'all' | 'one';

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
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
  isPlaying: boolean;
  isIntendingToPlay: boolean;
  togglePlayPause: () => void;
  pause: () => Promise<void>;
  progress: number;
  duration: number;
  seekTo: (position: number) => void;
  isLoading: boolean;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  showDownloadBanner: boolean;
  streak: number;
  pendingArtistOverlay: { id: string; name: string } | null;
  openArtistOverlay: (artist: { id: string; name: string }) => void;
  closeArtistOverlay: () => void;
}
