import { usePlayer } from '@/context/PlayerContext';
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import QueueModal from './QueueModal';
import SleepTimerModal from './SleepTimerModal';
import SongOptionsModal from './SongOptionsModal';
import { useVideoPlayer } from 'expo-video';
import { useEventListener } from 'expo';
import { youtubeService } from '@/services/api';
import { useNetwork } from '@/context/NetworkContext';
import { SongData } from '@/interfaces/Song';
import { PlayerCarousel } from './PlayerCarousel';
import { DownloadBanner } from './DownloadBanner';
import { AudioStateBeforeVideo, MaximazedPlayerProps, PlayerCarouselProps } from '@/interfaces/player';

const { width } = Dimensions.get('window');

const MarqueeText = ({ text, style }: { text: string; style: any }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
    >
      <Text style={style} numberOfLines={1}>
        {text}
      </Text>
    </ScrollView>
  );
};

type UseVideoPlaybackArgs = {
  currentSong: SongData | null;
  isOnline: boolean;
  audio: {
    isPlaying: boolean;
    progress: number;
    pause: () => Promise<void>;
    seekTo: (pos: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
  };
};

const useVideoPlayback = ({ currentSong, isOnline, audio }: UseVideoPlaybackArgs) => {

  const [showVideo, setShowVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoDidFinishHandledRef = useRef(false);
  const pendingVideoSeekRef = useRef<number | null>(null);
  const audioStateBeforeVideoRef = useRef<AudioStateBeforeVideo | null>(null);
  const showVideoRef = useRef(false);
  const isVideoReadyRef = useRef(false);
  const isVideoPlayingRef = useRef(false);

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.5;
  });

  useEventListener(player, 'statusChange', ({ status, error }: any) => {
    if (status === 'readyToPlay') {
      setIsVideoLoading(false);
      setIsVideoReady(true);
      isVideoReadyRef.current = true;
      if (player.duration) setVideoDuration(player.duration * 1000);
      const pending = pendingVideoSeekRef.current;
      if (pending !== null) {
        pendingVideoSeekRef.current = null;
        player.currentTime = pending / 1000;
        setVideoProgress(pending);
      }
    } else if (status === 'error') {
      console.error('[Video] Error de carga/reproducción:', error);
      setIsVideoLoading(false);
      setIsVideoReady(false);
      isVideoReadyRef.current = false;
      setShowVideo(false);
      showVideoRef.current = false;
      const restore = audioStateBeforeVideoRef.current;
      if (restore) {
        audio.seekTo(restore.position);
        if (restore.wasPlaying) audio.togglePlayPause();
      }
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }: any) => {
    setIsVideoPlaying(isPlaying);
    isVideoPlayingRef.current = isPlaying;
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }: any) => {
    if (!showVideoRef.current) return;
    setVideoProgress(currentTime * 1000);
    if (player.duration) setVideoDuration(player.duration * 1000);
  });

  useEventListener(player, 'playToEnd', () => {
    if (!videoDidFinishHandledRef.current) {
      videoDidFinishHandledRef.current = true;
      audio.playNext();
    }
  });

  useEffect(() => {
    setVideoProgress(0);
    player.pause();
    setShowVideo(false);
    showVideoRef.current = false;
    setIsVideoLoading(false);
    setIsVideoReady(false);
    isVideoReadyRef.current = false;
    setIsVideoPlaying(false);
    isVideoPlayingRef.current = false;
    pendingVideoSeekRef.current = null;
    audioStateBeforeVideoRef.current = null;
    setVideoDuration(0);
    videoDidFinishHandledRef.current = false;
  }, [currentSong?.id]);

  const seek = (position: number) => {
    if (showVideoRef.current) {
      if (!isVideoReadyRef.current) {
        pendingVideoSeekRef.current = position;
        return;
      }
      player.currentTime = position / 1000;
      return;
    }
    audio.seekTo(position);
  };

  const toggle = async () => {
    if (!currentSong) return;

    if (!showVideoRef.current) {
      if (!isOnline) {
        Alert.alert('Modo video', 'El video solo se puede reproducir con internet.');
        return;
      }

      videoDidFinishHandledRef.current = false;
      audioStateBeforeVideoRef.current = { wasPlaying: audio.isPlaying, position: audio.progress };
      pendingVideoSeekRef.current = audio.progress;
      setIsVideoLoading(true);
      setIsVideoReady(false);
      isVideoReadyRef.current = false;
      setIsVideoPlaying(false);
      isVideoPlayingRef.current = false;
      await audio.pause();
      await player.replaceAsync({ uri: youtubeService.getVideoStreamUrl(currentSong.url) });
      player.play();
      setShowVideo(true);
      showVideoRef.current = true;
      return;
    }

    const position = isVideoReadyRef.current
      ? player.currentTime * 1000
      : (pendingVideoSeekRef.current ?? audioStateBeforeVideoRef.current?.position ?? 0);

    const shouldResumeAudio = Boolean(audioStateBeforeVideoRef.current?.wasPlaying || isVideoPlayingRef.current);
    player.pause();
    setShowVideo(false);
    showVideoRef.current = false;
    setIsVideoLoading(false);
    setIsVideoReady(false);
    isVideoReadyRef.current = false;
    setIsVideoPlaying(false);
    isVideoPlayingRef.current = false;
    videoDidFinishHandledRef.current = false;
    audio.seekTo(position);

    if (shouldResumeAudio) audio.togglePlayPause();
  };

  const closeIfOpen = async () => {
    if (showVideoRef.current) await toggle();
  };

  return {
    showVideo,
    isVideoLoading,
    isVideoReady,
    videoProgress,
    videoDuration,
    isVideoPlaying,
    player,
    toggle,
    closeIfOpen,
    seek,
  };
};

export const MaximazedPlayer = ({ visible, onClose }: MaximazedPlayerProps) => {

  const { isOnline } = useNetwork();
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isSleepTimerVisible, setIsSleepTimerVisible] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const isVideoFullscreenRef = useRef(false);

  useEffect(() => {
    if (isVideoFullscreen) {
      isVideoFullscreenRef.current = true;
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (isVideoFullscreenRef.current) {
      isVideoFullscreenRef.current = false;
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [isVideoFullscreen]);
  const {
    currentSong,
    queue,
    toggleFavorite,
    isFavorite,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isPlaying,
    isIntendingToPlay,
    togglePlayPause,
    pause,
    progress,
    duration,
    seekTo,
    isLoading,
    sleepTimer
  } = usePlayer();

  const video = useVideoPlayback({
    currentSong,
    isOnline,
    audio: {
      isPlaying,
      progress,
      pause,
      seekTo,
      togglePlayPause,
      playNext,
    },
  });


  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const hasNextOrPrev = queue.length > 1 && currentIndex !== -1;
  const nextSong = hasNextOrPrev ? queue[(currentIndex + 1) % queue.length] : null;
  const prevSong = hasNextOrPrev ? queue[(currentIndex - 1 + queue.length) % queue.length] : null;

  const activeProgress = video.showVideo ? (video.isVideoReady ? video.videoProgress : progress) : progress;
  const activeDuration = video.showVideo ? (video.isVideoReady && video.videoDuration > 0 ? video.videoDuration : duration) : duration;
  const activeIsPlaying = video.showVideo ? (video.isVideoReady ? video.isVideoPlaying : false) : isPlaying;
  const activeIsLoading = video.showVideo ? video.isVideoLoading : isLoading;
  const isSeekEnabled = true;

  const currentDisplayProgress = (isSeeking || activeIsLoading) ? seekProgress : activeProgress;
  const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons) as any;
  const isAudioBuffering = !video.showVideo && isIntendingToPlay && !isPlaying;
  const playTint = useSharedValue(isAudioBuffering ? 1 : 0);

  useEffect(() => {
    playTint.value = withTiming(isAudioBuffering ? 1 : 0, { duration: 220 });
  }, [isAudioBuffering, playTint]);

  useEffect(() => {
    if (!activeIsLoading && !isSeeking) {
      setSeekProgress(activeProgress);
    }
  }, [activeIsLoading, isSeeking, activeProgress]);

  const formatTime = (millis: number) => {

    if (millis === undefined || millis === null || isNaN(millis)) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = activeDuration > 0 ? Math.min(Math.max((currentDisplayProgress / activeDuration) * 100, 0), 100) : 0;
  const playIconAnimatedProps = useAnimatedProps(() => ({
    color: interpolateColor(playTint.value, [0, 1], ["#fff", "rgba(255, 255, 255, 0.4)"]),
  }));

  const playerTranslateY = useSharedValue(0);
  const playerTranslateX = useSharedValue(0);

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: playerTranslateY.value },
      { translateX: playerTranslateX.value },
    ],
  }));

  const handleClose = async () => {
    await video.closeIfOpen();
    onClose();
  };

  const handlePlayPausePress = async () => {
    if (video.showVideo) {
      if (!video.isVideoReady) return;
      if (video.player.playing) video.player.pause();
      else video.player.play();
      return;
    }
    if (!isLoading) togglePlayPause();
  };

  const handleNext = () => {
    if (hasNextOrPrev) playNext();
  };

  const handlePrevious = () => {
    if (hasNextOrPrev) playPrevious();
  };

  const SWIPE_DOWN_THRESHOLD = 80;
  const SWIPE_HORIZ_THRESHOLD = 60;

  const swipeDownGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([15, Infinity])
    .failOffsetX([-25, 25])
    .onUpdate((e) => {
      if (e.translationY > 0) {
        playerTranslateY.value = e.translationY * 0.4;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SWIPE_DOWN_THRESHOLD) {
        handleClose();
      }
      playerTranslateY.value = withSpring(0);
    });

  const swipeHorizGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      playerTranslateX.value = e.translationX * 0.25;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_HORIZ_THRESHOLD) {
        handleNext();
      } else if (e.translationX > SWIPE_HORIZ_THRESHOLD) {
        handlePrevious();
      }
      playerTranslateX.value = withSpring(0);
    });

  const playerGesture = Gesture.Race(swipeDownGesture, swipeHorizGesture);

  const handleShare = async () => {
    if (!currentSong) return;
    try {
      await Share.share({
        message: `¡Escucha "${currentSong.title}" de ${currentSong.channel.name} en Diego Music!\nhttps://www.youtube.com/watch?v=${currentSong.id}`,
        url: `https://www.youtube.com/watch?v=${currentSong.id}`,
        title: currentSong.title,
      });
    }
    catch (error: any) {
      console.error(error.message);
    }
  };

  const handleSeek = (pos: number) => {
    video.seek(pos);
    setSeekProgress(pos);
    setIsSeeking(true);
    setTimeout(() => setIsSeeking(false), 1500);
  };

  const progressGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(isSeekEnabled)
    .onUpdate((event) => {
      if (activeDuration > 0) {
        setIsSeeking(true);
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        setSeekProgress(newProgress);
      }
    })
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        handleSeek(newProgress);
      } else {
        setIsSeeking(false);
      }
    });

  const progressTap = Gesture.Tap()
    .runOnJS(true)
    .enabled(isSeekEnabled)
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        handleSeek(newProgress);
      }
    });

  if (!currentSong) return null;
  const favoriteStatus = isFavorite(currentSong.id);
  const carouselProps: PlayerCarouselProps = {
    songs: { current: currentSong, prev: prevSong, next: nextSong },
    video: {
      show: video.showVideo,
      player: video.player,
      isReady: video.isVideoReady,
      isLoading: video.isVideoLoading,
      toggle: video.toggle,
    },
    audio: { playNext, playPrevious, seekTo, togglePlayPause },
    onEnterFullscreen: () => setIsVideoFullscreen(true),
    onExitFullscreen: () => setIsVideoFullscreen(false),
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <GestureDetector gesture={playerGesture}>
      <Animated.View style={[styles.modalContainer, playerAnimatedStyle]}>
        <LinearGradient
          colors={['#2c5af3ff', '#141414', '#101010ff']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>NOW PLAYING</Text>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsOptionsVisible(true)}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <PlayerCarousel key={currentSong.id} {...carouselProps} />

            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <View style={styles.textWrapper}>
                  <MarqueeText key={`title-${currentSong.id}`} text={currentSong.title} style={styles.title} />
                  <MarqueeText key={`artist-${currentSong.id}`} text={currentSong.channel.name} style={styles.artist} />
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
                  <Ionicons 
                    name={favoriteStatus ? "heart" : "heart-outline"} 
                    size={28} 
                    color={favoriteStatus ? "#2c5af3ff" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.progressSection}>
              <GestureDetector gesture={Gesture.Exclusive(progressGesture, progressTap)}>
                <View style={[styles.progressContainer, { opacity: isSeekEnabled ? 1 : 0.5 }]}>
                  <View style={styles.bgBar} />
                  <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  <View style={[styles.progressDot, { left: `${progressPercentage}%` }]} />
                </View>
              </GestureDetector>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(currentDisplayProgress)}</Text>
                <Text style={styles.timeText}>{formatTime(activeDuration)}</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Ionicons name="shuffle" size={28} color={isShuffle ? "#2c5af3ff" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrevious}>
                <Ionicons name="play-skip-back" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={handlePlayPausePress}>
                <AnimatedIonicons
                  animatedProps={playIconAnimatedProps}
                  name={video.showVideo ? (activeIsPlaying ? "pause-circle" : "play-circle") : (isIntendingToPlay ? "pause-circle" : "play-circle")}
                  size={80}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Ionicons name="play-skip-forward" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleRepeat} style={styles.repeatButton}>
                <Ionicons
                  name={repeatMode === 'one' ? "repeat-outline" : "repeat"}
                  size={28}
                  color={repeatMode !== 'off' ? "#2c5af3ff" : "#fff"}
                />
                {repeatMode === 'one' && (
                  <View style={styles.repeatOneBadge}>
                    <Text style={styles.repeatOneText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setIsSleepTimerVisible(true)}>
                <MaterialCommunityIcons
                  name={sleepTimer ? "timer" : "timer-outline"}
                  size={24}
                  color={sleepTimer ? "#2c5af3ff" : "#b3b3b3"}
                />
              </TouchableOpacity>
              <View style={{ width: 16 }} />
              <TouchableOpacity onPress={() => setIsQueueVisible(true)}>
                <Ionicons name="list" size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {isVideoFullscreen && (
          <GestureDetector gesture={Gesture.LongPress().minDuration(450).onStart(() => setIsVideoFullscreen(false)).runOnJS(true)}>
            <View style={styles.videoFullscreen}>
              <VideoView
                player={video.player}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                nativeControls={false}
              />
              <Ionicons
                name="chevron-down"
                size={20}
                color="rgba(255,255,255,0.4)"
                style={styles.videoFullscreenHint}
              />
            </View>
          </GestureDetector>
        )}
      </Animated.View>
      </GestureDetector>

      <SongOptionsModal 
        visible={isOptionsVisible} 
        onClose={() => setIsOptionsVisible(false)}
        song={currentSong}
      />

      <QueueModal
        visible={isQueueVisible}
        onClose={() => setIsQueueVisible(false)}
      />

      <SleepTimerModal
        visible={isSleepTimerVisible}
        onClose={() => setIsSleepTimerVisible(false)}
      />
      <DownloadBanner />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  infoContainer: {
    marginTop: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    marginRight: 16,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 18,
    marginTop: 4,
  },
  scrollingTextContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  scrollingTextWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  progressSection: {
    marginTop: 30,
  },
  progressContainer: {
    height: 20,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  bgBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    paddingHorizontal: 10,
  },
  repeatButton: {
    position: 'relative',
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    backgroundColor: '#2c5af3ff',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  videoFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  videoFullscreenHint: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 16,
    alignSelf: 'center',
    zIndex: 1000,
  },
 });
