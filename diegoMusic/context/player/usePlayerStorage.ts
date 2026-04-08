import { useState, useEffect } from 'react';
import storage from '@/services/storage';
import { SongData, ArtistData } from '@/components/Song';
import { 
  FAVORITES_KEY, 
  FAVORITE_ARTISTS_KEY, 
  RECENT_PLAYED_KEY, 
  MOST_PLAYED_KEY 
} from './types';

export const usePlayerStorage = () => {

  const [favorites, setFavorites] = useState<SongData[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<ArtistData[]>([]);
  const [recentPlayed, setRecentPlayed] = useState<SongData[]>([]);
  const [mostPlayed, setMostPlayed] = useState<SongData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedFavorites, savedArtists, savedRecent, savedMostPlayed] = await Promise.all([
          storage.getItem(FAVORITES_KEY),
          storage.getItem(FAVORITE_ARTISTS_KEY),
          storage.getItem(RECENT_PLAYED_KEY),
          storage.getItem(MOST_PLAYED_KEY),
        ]);

        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavorites(parsedFavorites.sort((a: SongData, b: SongData) => a.id.localeCompare(b.id)));
        }
        if (savedArtists) setFavoriteArtists(JSON.parse(savedArtists));
        if (savedRecent) setRecentPlayed(JSON.parse(savedRecent));
        if (savedMostPlayed) setMostPlayed(JSON.parse(savedMostPlayed));
      }
      catch (error) {
        console.error('Error loading persisted storage data:', error);
      }
    };
    loadData();
  }, []);

  const toggleFavorite = async (song: SongData) => {
    const isFav = favorites.some(f => f.id === song.id);
    const newFavorites = isFav
      ? favorites.filter(f => f.id !== song.id)
      : [...favorites, song];
    
    setFavorites(newFavorites);
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
    catch (error) {
      console.error('Error persisting favorites:', error);
    }
  };

  const isFavorite = (songId: string) => {
    return favorites.some(f => f.id === songId);
  };

  const toggleFavoriteArtist = async (artist: ArtistData) => {
    const isAlreadyFavorite = favoriteArtists.some(f => f.id === artist.id);
    const newFavoriteArtists = isAlreadyFavorite
      ? favoriteArtists.filter(f => f.id !== artist.id)
      : [...favoriteArtists, artist];
    
    setFavoriteArtists(newFavoriteArtists);
    try {
      await storage.setItem(FAVORITE_ARTISTS_KEY, JSON.stringify(newFavoriteArtists));
    }
    catch (error) {
      console.error('Error persisting favorite artists:', error);
    }
  };

  const isFavoriteArtist = (artistId: string) => {
    return favoriteArtists.some(f => f.id === artistId);
  };

  const addRecentPlayed = async (song: SongData) => {
    const filtered = recentPlayed.filter(s => s.id !== song.id);
    const updated = [song, ...filtered].slice(0, 8);
    setRecentPlayed(updated);
    try {
      await storage.setItem(RECENT_PLAYED_KEY, JSON.stringify(updated));
    }
    catch (err) {
      console.error('Error saving recent played:', err);
    }
  };

  const addMostPlayed = async (song: SongData) => {

    const existingSongIndex = mostPlayed.findIndex(s => s.id === song.id);
    let updated;
    
    if (existingSongIndex !== -1)
    {
      updated = [...mostPlayed];
      updated[existingSongIndex] = {
        ...updated[existingSongIndex],
        timesPlayed: (updated[existingSongIndex].timesPlayed || 0) + 1
      };
    }
    else {
      updated = [...mostPlayed, { ...song, timesPlayed: 1 }];
    }

    updated.sort((a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0));
    const limited = updated.slice(0, 10);
    setMostPlayed(limited);
    try {
      await storage.setItem(MOST_PLAYED_KEY, JSON.stringify(limited));
    }
    catch (err) {
      console.error('Error saving most played:', err);
    }
  };

  return {
    favorites,
    favoriteArtists,
    recentPlayed,
    mostPlayed,
    toggleFavorite,
    isFavorite,
    toggleFavoriteArtist,
    isFavoriteArtist,
    addRecentPlayed,
    addMostPlayed
  };
};
