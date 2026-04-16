import { ArtistData } from "./Song";


export interface FavoriteArtistsProps {
  onArtistPress?: (artist: ArtistData) => void;
}

export interface MusicArtistProps {
  artist: ArtistData;
}