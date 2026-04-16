import { youtubeService } from '@/services/api';
import storage from '@/services/storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import {
    FAVORITES_KEY,
    FAVORITE_ARTISTS_KEY,
    MOST_PLAYED_KEY,
    RECENT_PLAYED_KEY
} from './types';
import { ArtistData, SongData } from '@/interfaces/Song';

export const usePlayerStorage = () => {

  const [favorites, setFavorites] = useState<SongData[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<ArtistData[]>([]);
  const [recentPlayed, setRecentPlayed] = useState<SongData[]>([]);
  const [mostPlayed, setMostPlayed] = useState<SongData[]>([]);

  const syncThumbnails = async (favoritesList: SongData[]) => {
    console.log(`[SYNC] Revisando ${favoritesList.length} favoritos para portadas faltantes...`);
    for (const song of favoritesList) {
      if (!song.thumbnail?.url) continue;
      
      const thumbnailUri = `${FileSystem.documentDirectory}${song.id}_thumb.jpg`;
      try {
        const info = await FileSystem.getInfoAsync(thumbnailUri);
        if (!info.exists) {
          console.log(`[SYNC] Descargando portada faltante para: ${song.title}`);
          const thumbDownload = FileSystem.createDownloadResumable(
            song.thumbnail.url,
            thumbnailUri,
            {}
          );
          await thumbDownload.downloadAsync();
        }
      } catch (e) {
        console.warn(`[SYNC] Error sincronizando portada de ${song.title}:`, e);
      }
    }
  };

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
          const sorted = parsedFavorites.sort((a: SongData, b: SongData) => a.id.localeCompare(b.id));
          setFavorites(sorted);
          
          // Trigger thumbnail sync in background
          syncThumbnails(sorted);
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
    const persistentUri = `${FileSystem.documentDirectory}${song.id}.mp3`;
    const thumbnailUri = `${FileSystem.documentDirectory}${song.id}_thumb.jpg`;
    
    let newFavorites;
    if (isFav) newFavorites = favorites.filter(f => f.id !== song.id);
    else newFavorites = [...favorites, song].sort((a, b) => a.id.localeCompare(b.id));
    
    setFavorites(newFavorites);

    try {

      await storage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      if (isFav) {
        try {
          await Promise.all([
            FileSystem.deleteAsync(persistentUri, { idempotent: true }),
            FileSystem.deleteAsync(thumbnailUri, { idempotent: true })
          ]);
        }
        catch (e) {
          console.warn('Error deleting favorite files:', e);
        }
      }
      else {
        const fileInfo = await FileSystem.getInfoAsync(persistentUri);
        if (!fileInfo.exists) {
          console.log(`[FAVORITE] Iniciando descarga de audio: ${song.title}`);
          youtubeService.getAudioDirectUrl(song.url).then(({ url: directUrl }) => {
            const downloadResumable = FileSystem.createDownloadResumable(directUrl, persistentUri, {});
            return downloadResumable.downloadAsync();
          }).then(() => {
            console.log(`[FAVORITE] Descarga de audio completada: ${song.title}`);
          }).catch(err => {
            console.error(`[FAVORITE] Error descargando audio ${song.title}:`, err);
          });
        }

        if (song.thumbnail?.url) {
          const thumbInfo = await FileSystem.getInfoAsync(thumbnailUri);
          if (!thumbInfo.exists) {
            const thumbDownload = FileSystem.createDownloadResumable(
              song.thumbnail.url,
              thumbnailUri,
              {}
            );
            
            console.log(`[FAVORITE] Iniciando descarga de portada: ${song.title}`);
            thumbDownload.downloadAsync().then(() => {
              console.log(`[FAVORITE] Descarga de portada completada: ${song.title}`);
            }).catch(err => {
              console.error(`[FAVORITE] Error descargando portada ${song.title}:`, err);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in toggleFavorite process:', error);
      setFavorites(favorites);
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
