import { usePlayer } from '@/context/PlayerContext';
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, interpolateColor, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming, cancelAnimation, withDelay } from 'react-native-reanimated';
import Foundation from '@expo/vector-icons/Foundation';
import { LoadingSpinner } from './LoadingSpinner';
import QueueModal from './QueueModal';
import SleepTimerModal from './SleepTimerModal';
import SongOptionsModal from './SongOptionsModal';
import { Video, ResizeMode } from 'expo-av';
import { youtubeService as apiYoutubeService } from '@/services/api';
import { useNetwork } from '@/context/NetworkContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 48;
const SWIPE_THRESHOLD = 80;

interface MaximazedPlayerProps {
  visible: boolean;
  onClose: () => void;
}

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

export const MaximazedPlayer = ({ visible, onClose }: MaximazedPlayerProps) => {

  const { isOnline } = useNetwork();
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isSleepTimerVisible, setIsSleepTimerVisible] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoAutoPlay, setVideoAutoPlay] = useState(false);
  const videoRef = useRef<Video | null>(null);
  const videoDidFinishHandledRef = useRef(false);
  const showVideoRef = useRef(false);
  const pendingVideoSeekRef = useRef<number | null>(null);
  const audioStateBeforeVideoRef = useRef<{ wasPlaying: boolean; position: number } | null>(null);
  const { 
    currentSong, 
    queue, 
    toggleFavorite, 
    isFavorite, 
    playNext, 
    playPrevious, 
    isShuffle, 
    toggleShuffle,
    isPlaying,
    togglePlayPause,
    pause,
    progress,
    duration,
    seekTo,
    isLoading,
    sleepTimer
  } = usePlayer();

  const translateX = useSharedValue(0);
  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const hasNextOrPrev = queue.length > 1 && currentIndex !== -1;
  const nextSong = hasNextOrPrev ? queue[(currentIndex + 1) % queue.length] : null;
  const prevSong = hasNextOrPrev ? queue[(currentIndex - 1 + queue.length) % queue.length] : null;

  const getThumbnailSource = (song: any) => {
    if (song?.thumbnail?.url) {
      return { uri: song.thumbnail.url };
    }
    return require("@/assets/images/cover.jpg");
  };

  const prevThumbnailSource = getThumbnailSource(prevSong);
  const currentThumbnailSource = getThumbnailSource(currentSong);
  const nextThumbnailSource = getThumbnailSource(nextSong);

  const activeProgress = showVideo ? (isVideoReady ? videoProgress : progress) : progress;
  const activeDuration = showVideo ? (isVideoReady && videoDuration > 0 ? videoDuration : duration) : duration;
  const activeIsPlaying = showVideo ? (isVideoReady ? isVideoPlaying : false) : isPlaying;
  const activeIsLoading = showVideo ? isVideoLoading : isLoading;

  const currentDisplayProgress = (isSeeking || activeIsLoading) ? seekProgress : activeProgress;
  const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons) as any;
  const playTint = useSharedValue(!showVideo && isLoading ? 1 : 0);

  useEffect(() => {
    showVideoRef.current = showVideo;
  }, [showVideo]);

  useEffect(() => {
    playTint.value = withTiming(!showVideo && isLoading ? 1 : 0, { duration: 220 });
  }, [showVideo, isLoading, playTint]);

  useEffect(() => {
    translateX.value = 0;
    setSeekProgress(0);
    if (showVideoRef.current) {
      videoRef.current?.pauseAsync().catch(() => {});
      setShowVideo(false);
      setIsVideoLoading(false);
      setIsVideoReady(false);
      setIsVideoPlaying(false);
      setVideoAutoPlay(false);
      pendingVideoSeekRef.current = null;
      audioStateBeforeVideoRef.current = null;
      setVideoProgress(0);
      setVideoDuration(0);
    }
    videoDidFinishHandledRef.current = false;
  }, [currentSong?.id, translateX]);

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

  const handleSeek = (position: number) => {
    if (showVideo) {
      if (!isVideoReady) {
        pendingVideoSeekRef.current = position;
        return;
      }
      videoRef.current?.setPositionAsync(position).catch(() => {});
      return;
    }
    seekTo(position);
  };

  const handleToggleVideo = async () => {
    if (!currentSong) return;

    if (!showVideo) {
      if (!isOnline) {
        Alert.alert('Modo video', 'El video solo se puede reproducir con internet.');
        return;
      }
      videoDidFinishHandledRef.current = false;
      audioStateBeforeVideoRef.current = { wasPlaying: isPlaying, position: progress };
      pendingVideoSeekRef.current = progress;
      setVideoAutoPlay(true);
      setIsVideoLoading(true);
      setIsVideoReady(false);
      setIsVideoPlaying(false);
      await pause();
      setShowVideo(true);
      return;
    }

    const status = await videoRef.current?.getStatusAsync();
    const isLoaded = Boolean(status && (status as any).isLoaded);
    const position = isLoaded
      ? (status as any).positionMillis
      : (pendingVideoSeekRef.current ?? audioStateBeforeVideoRef.current?.position ?? 0);
    const shouldResumeAudio = Boolean(audioStateBeforeVideoRef.current?.wasPlaying || isVideoPlaying);
    await videoRef.current?.pauseAsync().catch(() => {});
    setVideoAutoPlay(false);
    setShowVideo(false);
    setIsVideoLoading(false);
    setIsVideoReady(false);
    setIsVideoPlaying(false);
    videoDidFinishHandledRef.current = false;
    seekTo(position);

    if (shouldResumeAudio) togglePlayPause();
  };

  const presentVideoFullscreen = async () => {
    if (!showVideo || !isVideoReady) return;
    const player: any = videoRef.current;
    if (typeof player?.presentFullscreenPlayer === 'function') {
      player.presentFullscreenPlayer();
      return;
    }
    if (typeof player?.presentFullscreenPlayerAsync === 'function') {
      await player.presentFullscreenPlayerAsync();
    }
  };

  const videoLongPressGesture = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      if (showVideo && isVideoReady) {
        runOnJS(presentVideoFullscreen)();
      }
    });

  const handleClose = async () => {
    if (showVideo) {
      await handleToggleVideo();
    }
    onClose();
  };

  const handlePlayPausePress = async () => {
    if (showVideo) {
      if (!isVideoReady) return;
      const status = await videoRef.current?.getStatusAsync();
      if (!status || !(status as any).isLoaded) return;
      if ((status as any).isPlaying) await videoRef.current?.pauseAsync();
      else await videoRef.current?.playAsync();
      return;
    }
    if (!isLoading) togglePlayPause();
  };

  const handleNext = () => {
    if (!hasNextOrPrev) return;
    translateX.value = withTiming(-width, { duration: 300 }, (finished) => {
      if (finished) runOnJS(playNext)();
    });
  };

  const handlePrevious = () => {
    if (!hasNextOrPrev) return;
    translateX.value = withTiming(width, { duration: 300 }, (finished) => {
      if (finished) runOnJS(playPrevious)();
    });
  };

  const handleShare = async () => {
    if (!currentSong) return;
    try {
      const result = await Share.share({
        message: `¡Escucha "${currentSong.title}" de ${currentSong.channel.name} en Diego Music!\nhttps://www.youtube.com/watch?v=${currentSong.id}`,
        url: `https://www.youtube.com/watch?v=${currentSong.id}`,
        title: currentSong.title,
      });
    }
    catch (error: any) {
      console.error(error.message);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD && hasNextOrPrev) {
        translateX.value = withTiming(-width, { duration: 300 }, (finished) => {
          if (finished) runOnJS(playNext)();
        });
      }
      else if (event.translationX > SWIPE_THRESHOLD && hasNextOrPrev) {
        translateX.value = withTiming(width, { duration: 300 }, (finished) => {
          if (finished) runOnJS(playPrevious)();
        });
      }
      else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const mainImageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [1, 0.8],
      Extrapolation.CLAMP
    );

    return { opacity, transform: [{ scale }] };
  });

  const useSideImageStyle = (isNext: boolean) => useAnimatedStyle(() => {
    const targetValue = isNext ? -width : width;
    const opacity = interpolate(
      translateX.value,
      [0, targetValue],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, targetValue],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const nextImageStyle = useSideImageStyle(true);
  const prevImageStyle = useSideImageStyle(false);

  const progressGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (activeDuration > 0) {
        if (!isSeeking) runOnJS(setIsSeeking)(true);
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        runOnJS(setSeekProgress)(newProgress);
      }
    })
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        runOnJS(handleSeek)(newProgress);
        setTimeout(() => {
          runOnJS(setIsSeeking)(false);
        }, 1500);
      } else {
        runOnJS(setIsSeeking)(false);
      }
    })

  const progressTap = Gesture.Tap()
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        runOnJS(setSeekProgress)(newProgress);
        runOnJS(setIsSeeking)(true);
        runOnJS(handleSeek)(newProgress);
        setTimeout(() => {
          runOnJS(setIsSeeking)(false);
        }, 1500);
      }
    });

  if (!currentSong) return null;
  const favoriteStatus = isFavorite(currentSong.id);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#2c5af3ff', '#141414', '#101010ff']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>REPRODUCIENDO</Text>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsOptionsVisible(true)}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.carouselContainer}>
              <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.imagesWrapper, animatedStyle]}>
                  <View style={styles.imageContainerWrapper}>
                    {prevSong && (
                      <Animated.View style={[prevImageStyle, styles.imageWrapper]}>
                        <Image
                          source={prevThumbnailSource}
                          style={styles.cover}
                        />
                      </Animated.View>
                    )}
                  </View>

                  <View style={styles.imageContainerWrapper}>
                    <GestureDetector gesture={videoLongPressGesture}>
                      <Animated.View style={[styles.imageContainer, mainImageStyle]}>
                      {showVideo && (
                        <Video
                          ref={videoRef}
                          source={{ uri: apiYoutubeService.getVideoStreamUrl(currentSong.url) }}
                          style={[styles.cover, styles.videoLayer, { opacity: isVideoReady ? 1 : 0 }]}
                          resizeMode={ResizeMode.COVER}
                          isLooping={false}
                          shouldPlay={false}
                          onLoad={(status) => {
                            if (!(status as any).isLoaded) return;
                            setIsVideoLoading(false);
                            setIsVideoReady(true);
                            videoDidFinishHandledRef.current = false;
                            const durationMillis = (status as any).durationMillis ?? 0;
                            if (durationMillis > 0) setVideoDuration(durationMillis);
                            const pending = pendingVideoSeekRef.current;
                            if (pending !== null) {
                              pendingVideoSeekRef.current = null;
                              setVideoProgress(pending);
                              videoRef.current?.setPositionAsync(pending).catch(() => {});
                            }
                            if (videoAutoPlay) {
                              videoRef.current?.playAsync().catch(() => {});
                            }
                          }}
                          onError={() => {
                            setIsVideoLoading(false);
                            setIsVideoReady(false);
                            setShowVideo(false);
                            setVideoAutoPlay(false);
                            const restore = audioStateBeforeVideoRef.current;
                            if (restore) {
                              seekTo(restore.position);
                              if (restore.wasPlaying) togglePlayPause();
                            }
                          }}
                          onPlaybackStatusUpdate={(status) => {
                            if (!(status as any).isLoaded) return;
                            setIsVideoPlaying(Boolean((status as any).isPlaying));
                            setVideoProgress(Number((status as any).positionMillis || 0));
                            const durationMillis = Number((status as any).durationMillis || 0);
                            if (durationMillis > 0) setVideoDuration(durationMillis);
                            if ((status as any).didJustFinish && !videoDidFinishHandledRef.current) {
                              videoDidFinishHandledRef.current = true;
                              runOnJS(playNext)();
                            }
                          }}
                        />
                      )}
                      {(!showVideo || !isVideoReady) && (
                        <Image
                          source={currentThumbnailSource}
                          style={styles.cover}
                        />
                      )}
                      <TouchableOpacity onPress={handleToggleVideo} style={styles.icon}>
                        {showVideo && isVideoLoading ? (
                          <LoadingSpinner size={22} />
                        ) : (
                          <Foundation name="play-video" size={30} color="#ffffffff" />
                        )}
                      </TouchableOpacity>
                      </Animated.View>
                    </GestureDetector>
                  </View>

                  <View style={styles.imageContainerWrapper}>
                    {nextSong && (
                      <Animated.View style={nextImageStyle}>
                        <Image
                          source={nextThumbnailSource}
                          style={styles.cover}
                        />
                      </Animated.View>
                    )}
                  </View>
                </Animated.View>
              </GestureDetector>
            </View>

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
                <View style={styles.progressContainer}>
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
                  name={(!showVideo && isLoading) || activeIsPlaying ? "pause-circle" : "play-circle"}
                  size={80}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Ionicons name="play-skip-forward" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSleepTimerVisible(true)}>
                <MaterialCommunityIcons 
                  name={sleepTimer ? "timer" : "timer-outline"} 
                  size={28} 
                  color={sleepTimer ? "#2c5af3ff" : "#fff"} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setIsQueueVisible(true)}>
                <Ionicons name="list" size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

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
  carouselContainer: {
    width: width,
    height: IMAGE_SIZE,
    marginLeft: -24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesWrapper: {
    flexDirection: 'row',
    width: width * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
     width: IMAGE_SIZE,
     height: IMAGE_SIZE,
     borderRadius: 12,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.5,
     shadowRadius: 15,
     elevation: 20,
     position: 'relative',
    },
   imageContainerWrapper: {
     width: width,
     justifyContent: 'center',
     alignItems: 'center',
   },
   cover: {
     width: IMAGE_SIZE,
     height: IMAGE_SIZE,
     borderRadius: 12,
   },
   videoLayer: {
     position: 'absolute',
     top: 0,
     left: 0,
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
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  icon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 10,
    elevation: 10,
    borderRadius: 12,
    padding: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
 });
