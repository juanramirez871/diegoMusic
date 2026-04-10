import { usePlayer } from '@/context/PlayerContext';
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Foundation from '@expo/vector-icons/Foundation';
import { LoadingSpinner } from './LoadingSpinner';
import QueueModal from './QueueModal';
import SleepTimerModal from './SleepTimerModal';
import SongOptionsModal from './SongOptionsModal';
import { Video, ResizeMode } from 'expo-av';
import { youtubeService as apiYoutubeService } from '@/services/api';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 48;
const SWIPE_THRESHOLD = 80;

interface MaximazedPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export const MaximazedPlayer = ({ visible, onClose }: MaximazedPlayerProps) => {

  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isSleepTimerVisible, setIsSleepTimerVisible] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
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
    progress,
    duration,
    seekTo,
    isLoading,
    sleepTimer
  } = usePlayer();
  const translateX = useSharedValue(0);

  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const nextSong = currentIndex !== -1 && currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null;
  const prevSong = currentIndex > 0 ? queue[currentIndex - 1] : null;

  const currentDisplayProgress = (isSeeking || isLoading) ? seekProgress : progress;

  useEffect(() => {
    translateX.value = 0;
    setSeekProgress(0);
    setShowVideo(false);
  }, [currentSong?.id]);

  useEffect(() => {
    if (!isLoading && !isSeeking) {
      setSeekProgress(progress);
    }
  }, [isLoading, isSeeking, progress]);

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

  const progressPercentage = duration > 0 ? Math.min(Math.max((currentDisplayProgress / duration) * 100, 0), 100) : 0;

  const handleNext = () => {
    if (!nextSong) return;
    translateX.value = withTiming(-width, { duration: 300 }, (finished) => {
      if (finished) runOnJS(playNext)();
    });
  };

  const handlePrevious = () => {
    if (!prevSong) return;
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
      if (event.translationX < -SWIPE_THRESHOLD && nextSong) {
        translateX.value = withSpring(-width, { velocity: event.velocityX }, (finished) => {
          if (finished) runOnJS(playNext)();
        });
      }
      else if (event.translationX > SWIPE_THRESHOLD && prevSong) {
        translateX.value = withSpring(width, { velocity: event.velocityX }, (finished) => {
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
      if (duration > 0) {
        if (!isSeeking) runOnJS(setIsSeeking)(true);
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * duration, 0), duration);
        runOnJS(setSeekProgress)(newProgress);
      }
    })
    .onEnd((event) => {
      if (duration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * duration, 0), duration);
        runOnJS(seekTo)(newProgress);
        setTimeout(() => {
          runOnJS(setIsSeeking)(false);
        }, 1500);
      } else {
        runOnJS(setIsSeeking)(false);
      }
    })

  const progressTap = Gesture.Tap()
    .onEnd((event) => {
      if (duration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * duration, 0), duration);
        runOnJS(setSeekProgress)(newProgress);
        runOnJS(setIsSeeking)(true);
        runOnJS(seekTo)(newProgress);
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
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#2c5af3ff', '#141414', '#101010ff']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                          source={{ uri: prevSong.thumbnail.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg" }}
                          style={styles.cover}
                        />
                      </Animated.View>
                    )}
                  </View>

                  <View style={styles.imageContainerWrapper}>
                    <Animated.View style={[styles.imageContainer, mainImageStyle]}>
                      {showVideo ? (
                        <Video
                          source={{ uri: apiYoutubeService.getVideoStreamUrl(currentSong.url) }}
                          style={styles.cover}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay
                          isLooping
                          isMuted
                        />
                      ) : (
                        <Image
                          source={{ uri: currentSong.thumbnail.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg" }}
                          style={styles.cover}
                        />
                      )}
                      <TouchableOpacity onPress={() => setShowVideo((v) => !v)} style={styles.icon}>
                        <Foundation name="play-video" size={30} color="#ffffffff" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>

                  <View style={styles.imageContainerWrapper}>
                    {nextSong && (
                      <Animated.View style={nextImageStyle}>
                        <Image
                          source={{ uri: nextSong.thumbnail.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg" }}
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
                  <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                  <Text style={styles.artist} numberOfLines={1}>{currentSong.channel.name}</Text>
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
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Ionicons name="shuffle" size={28} color={isShuffle ? "#2c5af3ff" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrevious}>
                <Ionicons name="play-skip-back" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={() => !isLoading && togglePlayPause()}>
                {isLoading ? (
                  <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingSpinner size={60} />
                  </View>
                ) : (
                  <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={80} color="#fff" />
                )}
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
  },
  scrollingTextWrapper: {
    flexDirection: 'row',
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
