import { ViewStyle } from "react-native";
import { SongData } from "./Song";
import { Video } from 'expo-av';


export interface CarouselProps {
  currentSong: any;
  prevSong: any;
  nextSong: any;
  showVideo: boolean;
  videoRef: any;
  isVideoReady: boolean;
  isVideoLoading: boolean;
  isVideoPlaying: boolean;
  setIsVideoLoading: (val: boolean) => void;
  setIsVideoReady: (val: boolean) => void;
  setIsVideoPlaying: (val: boolean) => void;
  setVideoProgress: (val: number) => void;
  setVideoDuration: (val: number) => void;
  videoDidFinishHandledRef: any;
  pendingVideoSeekRef: any;
  videoAutoPlay: boolean;
  setVideoAutoPlay: (val: boolean) => void;
  audioStateBeforeVideoRef: any;
  setShowVideo: (val: boolean) => void;
  handleToggleVideo: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (pos: number) => void;
  togglePlayPause: () => void;
}

export interface MinimizedPlayerProps {
  onPress: () => void;
  style?: ViewStyle;
}

export interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface CarouselPlayerProps {
  channelId?: string;
  query?: string;
  data?: SongData[];
}

export interface MaximazedPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export type AudioStateBeforeVideo = {
  wasPlaying: boolean;
  position: number;
};

export type CarouselSongs = {
  current: SongData;
  prev: SongData | null;
  next: SongData | null;
};

export type CarouselVideo = {
  show: boolean;
  ref: React.MutableRefObject<Video | null>;
  isReady: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  autoPlay: boolean;
  setAutoPlay: (val: boolean) => void;
  setShow: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  setIsReady: (val: boolean) => void;
  setIsPlaying: (val: boolean) => void;
  setProgress: (val: number) => void;
  setDuration: (val: number) => void;
  didFinishHandledRef: React.MutableRefObject<boolean>;
  pendingSeekRef: React.MutableRefObject<number | null>;
  audioStateBeforeVideoRef: React.MutableRefObject<AudioStateBeforeVideo | null>;
  toggle: () => Promise<void>;
};

export type CarouselAudio = {
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (pos: number) => void;
  togglePlayPause: () => void;
};

export type PlayerCarouselProps = {
  songs: CarouselSongs;
  video: CarouselVideo;
  audio: CarouselAudio;
};