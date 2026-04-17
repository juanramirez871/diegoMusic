import { View, StyleSheet, Image, Text, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "@/context/PlayerContext";
import { useThumbnail } from "@/hooks/useThumbnail";
import { MinimizedPlayerProps } from "@/interfaces/player";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";


export const MinimizedPlayer = ({ onPress, style }: MinimizedPlayerProps) => {

  const { currentSong, isPlaying, isIntendingToPlay, togglePlayPause, progress, duration, isLoading, playNext, playPrevious } = usePlayer();
  const isBuffering = isIntendingToPlay && !isPlaying;
  const thumbnailSource = useThumbnail(currentSong?.id, currentSong?.thumbnail?.url);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = 60;
  const SWIPE_UP_THRESHOLD = 50;
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        playNext();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        playPrevious();
      }
      translateX.value = withSpring(0);
    });

  const swipeUpGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-15, 15])
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY * 0.3;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_UP_THRESHOLD) {
        runOnJS(onPress)();
      }
      translateY.value = withSpring(0);
    });

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => {
      onPress();
    });

  const combinedGesture = Gesture.Race(panGesture, swipeUpGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (!currentSong) return null;
  const progressPercentage = duration > 0 ? Math.min(Math.max((progress / duration) * 100, 0), 100) : 0;

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <GestureDetector gesture={tapGesture}>
          <View style={styles.infoArea}>
            <Image
              source={thumbnailSource}
              style={styles.cover}
            />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{currentSong.channel.name}</Text>
            </View>
          </View>
        </GestureDetector>

        <TouchableOpacity
          style={styles.controls}
          onPress={(e) => {
            e.stopPropagation();
            if (!isLoading) togglePlayPause();
          }}
        >
          <Ionicons
            name={isIntendingToPlay ? "pause-circle" : "play-circle"}
            size={40}
            color={isBuffering ? "rgba(255, 255, 255, 0.4)" : "#fff"}
          />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.bgBar, { width: '100%' }]} />
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414ff',
        padding: 8,
        borderRadius: 8,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 65 : 75,
        zIndex: 1000,
        width: '100%',
    },
    infoArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cover: {
        width: 48,
        height: 48,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
    artist: {
        fontSize: 12,
        color: "#b3b3b3",
    },
    controls: {
        paddingHorizontal: 8,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    bgBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 1,
    }
});
