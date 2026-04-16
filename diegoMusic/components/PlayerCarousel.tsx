import Foundation from '@expo/vector-icons/Foundation';
import { Video, ResizeMode } from 'expo-av';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { youtubeService as apiYoutubeService } from '@/services/api';
import { useThumbnail } from '@/hooks/useThumbnail';
import { LoadingSpinner } from './LoadingSpinner';
import React from 'react';
import { PlayerCarouselProps } from '@/interfaces/player';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 48;
const SWIPE_THRESHOLD = 80;


export function PlayerCarousel({ songs, video, audio }: PlayerCarouselProps) {

  const translateX = useSharedValue(0);
  const prevThumbnailSource = useThumbnail(songs.prev?.id, songs.prev?.thumbnail?.url);
  const currentThumbnailSource = useThumbnail(songs.current?.id, songs.current?.thumbnail?.url);
  const nextThumbnailSource = useThumbnail(songs.next?.id, songs.next?.thumbnail?.url);
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD && (songs.next || songs.prev)) {
        translateX.value = withTiming(-width, { duration: 300 }, (finished) => {
          if (finished) runOnJS(audio.playNext)();
        });
      }
      else if (event.translationX > SWIPE_THRESHOLD && (songs.next || songs.prev)) {
        translateX.value = withTiming(width, { duration: 300 }, (finished) => {
          if (finished) runOnJS(audio.playPrevious)();
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
    const opacity = interpolate(Math.abs(translateX.value), [0, width], [1, 0.5], Extrapolation.CLAMP);
    const scale = interpolate(Math.abs(translateX.value), [0, width], [1, 0.8], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const useSideImageStyle = (isNext: boolean) => useAnimatedStyle(() => {
    const targetValue = isNext ? -width : width;
    const opacity = interpolate(translateX.value, [0, targetValue], [0.5, 1], Extrapolation.CLAMP);
    const scale = interpolate(translateX.value, [0, targetValue], [0.8, 1], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const nextImageStyle = useSideImageStyle(true);
  const prevImageStyle = useSideImageStyle(false);

  const presentVideoFullscreen = async () => {
    if (!video.show || !video.isReady) return;
    const player: any = video.ref.current;
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
      if (video.show && video.isReady) {
        runOnJS(presentVideoFullscreen)();
      }
    });

  return (
    <View style={styles.carouselContainer}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.imagesWrapper, animatedStyle]}>
          <View style={styles.imageContainerWrapper}>
            {songs.prev && (
              <Animated.View style={[prevImageStyle, styles.imageWrapper]}>
                <Image key={songs.prev.id} source={prevThumbnailSource} style={styles.cover} />
              </Animated.View>
            )}
          </View>

          <View style={styles.imageContainerWrapper}>
            <GestureDetector gesture={videoLongPressGesture}>
              <Animated.View style={[styles.imageContainer, mainImageStyle]}>
                {video.show && (
                  <Video
                    ref={video.ref}
                    source={{ uri: apiYoutubeService.getVideoStreamUrl(songs.current.url) }}
                    style={[styles.cover, styles.videoLayer, { opacity: video.isReady ? 1 : 0 }]}
                    resizeMode={ResizeMode.COVER}
                    isLooping={false}
                    shouldPlay={video.autoPlay}
                    onLoad={(status) => {
                      if (!(status as any).isLoaded) return;
                      console.log("[Video] Metadata cargada:", (status as any).uri);
                      video.didFinishHandledRef.current = false;
                      const durationMillis = (status as any).durationMillis ?? 0;
                      if (durationMillis > 0) runOnJS(video.setDuration)(durationMillis);
                      const pending = video.pendingSeekRef.current;
                      if (pending !== null) {
                        video.pendingSeekRef.current = null;
                        runOnJS(video.setProgress)(pending);
                        video.ref.current?.setPositionAsync(pending).catch(() => {});
                      }
                    }}
                    onReadyForDisplay={() => {
                      console.log("[Video] Listo para mostrar");
                      runOnJS(video.setIsLoading)(false);
                      runOnJS(video.setIsReady)(true);
                    }}
                    onError={(error) => {
                      console.error("[Video] Error de carga/reproducción:", error);
                      runOnJS(video.setIsLoading)(false);
                      runOnJS(video.setIsReady)(false);
                      runOnJS(video.setShow)(false);
                      runOnJS(video.setAutoPlay)(false);
                      const restore = video.audioStateBeforeVideoRef.current;
                      if (restore) {
                        runOnJS(audio.seekTo)(restore.position);
                        if (restore.wasPlaying) runOnJS(audio.togglePlayPause)();
                      }
                    }}
                    onPlaybackStatusUpdate={(status) => {
                      if (!(status as any).isLoaded) return;
                      runOnJS(video.setIsPlaying)(Boolean((status as any).isPlaying));
                      runOnJS(video.setProgress)(Number((status as any).positionMillis || 0));
                      const durationMillis = Number((status as any).durationMillis || 0);
                      if (durationMillis > 0) runOnJS(video.setDuration)(durationMillis);
                      if ((status as any).didJustFinish && !video.didFinishHandledRef.current) {
                        video.didFinishHandledRef.current = true;
                        runOnJS(audio.playNext)();
                      }
                    }}
                  />
                )}
                {(!video.show || !video.isReady) && (
                  <Image key={songs.current.id} source={currentThumbnailSource} style={styles.cover} />
                )}
                <TouchableOpacity onPress={video.toggle} style={styles.icon}>
                  {video.show && video.isLoading ? (
                    <LoadingSpinner size={22} />
                  ) : (
                    <Foundation name="play-video" size={30} color="#ffffffff" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </GestureDetector>
          </View>

          <View style={styles.imageContainerWrapper}>
            {songs.next && (
              <Animated.View style={nextImageStyle}>
                <Image key={songs.next.id} source={nextThumbnailSource} style={styles.cover} />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
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
