export interface Translations {
  tabs: {
    home: string;
    favorite: string;
    search: string;
    settings: string;
  };
  favorite: {
    title: string;
    findIn: string;
    songCount: string;
    noResults: string;
    noSongs: string;
  };
  search: {
    title: string;
    placeholder: string;
    placeholderOffline: string;
    browseAll: string;
  };
  searchOverlay: {
    placeholder: string;
    cancel: string;
    noResults: string;
    noResultsSub: string;
    emptyTitle: string;
    emptySub: string;
    recentSearches: string;
    clearAll: string;
  };
  lyrics: {
    title: string;
    offline: string;
    notFound: string;
    noConnection: string;
    notAvailable: string;
    searchPlaceholder: string;
  };
  offline: {
    title: string;
    message: string;
  };
  settings: {
    title: string;
    language: string;
    videoQuality: string;
    videoQualityLow: string;
    videoQualityMedium: string;
    videoQualityHigh: string;
  };
  home: {
    musicTag: string;
    mostPlayedTitle: string;
    noMostPlayed: string;
  };
  stats: {
    title: string;
    totalPlays: string;
    minutes: string;
    liked: string;
    dayStreak: string;
    keepGoing: string;
    playToday: string;
    topArtists: string;
    mostPlayed: string;
    empty: string;
    plays: string;
  };
  player: {
    nowPlaying: string;
    videoOfflineTitle: string;
    videoOfflineMessage: string;
    shareMessage: string;
  };
  queue: {
    title: string;
    shuffle: string;
  };
  sleepTimer: {
    title: string;
    active: string;
    disable: string;
    minutesOption: string;
    hourOption: string;
    hoursOption: string;
  };
  genre: {
    noSongsFound: string;
  };
  download: {
    songDownloaded: string;
    notificationTitle: string;
    notificationBody: string;
  };
  musicArtist: {
    forFansOf: string;
  };
  favoriteArtists: {
    title: string;
    empty: string;
  };
  songOptions: {
    untitled: string;
    addToFavorites: string;
    removeFromFavorites: string;
    addArtistToFavorites: string;
    removeArtistFromFavorites: string;
    openOriginalVideo: string;
  };
  song: {
    untitled: string;
    unknownArtist: string;
  };
  errors: {
    offlineTitle: string;
    offlineSongUnavailable: string;
    playbackTitle: string;
    playbackFailed: string;
    retry: string;
    cancel: string;
    downloadTitle: string;
    downloadFailed: string;
  };
  genres: Record<string, string>;
}
