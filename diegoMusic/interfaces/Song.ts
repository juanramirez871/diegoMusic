import {
  Animated,
} from "react-native";

export interface ArtistData {
  id: string;
  name: string;
  avatar: string;
}

export interface SongData {
  id: string;
  url: string;
  title: string;
  thumbnail: {
    url: string;
  };
  channel: {
    name: string;
    id?: string;
    avatar?: string;
    icon?: string;
  };
  duration_formatted: string;
  timesPlayed?: number;
}

export interface SongProps {
  data?: SongData;
  onPress?: (song: SongData) => void;
}

export interface GenreOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  genreTitle: string;
  channelId?: string;
  fadeAnim: Animated.Value;
}

export interface SongOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  song?: SongData;
}