import { ViewStyle } from "react-native";
import { SongData } from "./Song";

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