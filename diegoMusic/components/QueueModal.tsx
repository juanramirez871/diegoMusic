import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { usePlayer } from "@/context/PlayerContext";
import { SongData } from "@/components/Song";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function QueueModal({ visible, onClose }: QueueModalProps) {
  const { queue, setQueue, currentSong, playSong, isShuffle, toggleShuffle } = usePlayer();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [visible]);

  const handleClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderItem = ({ item, drag, isActive }: RenderItemParams<SongData>) => {
    const isCurrent = currentSong?.id === item.id;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          onPress={() => playSong(item)}
          style={[
            styles.songItem,
            isActive && styles.activeItem,
            isCurrent && styles.currentSongItem,
          ]}
        >
          <Image source={{ uri: item.thumbnail.url }} style={styles.thumbnail} />
          <View style={styles.songInfo}>
            <Text
              style={[styles.songTitle, isCurrent && styles.currentSongTitle]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {item.channel.name}
            </Text>
          </View>
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <Ionicons name="reorder-two" size={24} color="#b3b3b3" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <LinearGradient
            colors={["#0a0a0aff", "#141414"]}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.headerHandle} />
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Queue</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.controlButton, isShuffle && styles.activeControl]}
                  onPress={toggleShuffle}
                >
                  <Ionicons
                    name="shuffle"
                    size={24}
                    color={isShuffle ? "#fff" : "#b3b3b3"}
                  />
                  <Text
                    style={[
                      styles.controlText,
                      isShuffle && styles.activeControlText,
                    ]}
                  >
                    Shuffle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.listContainer}>
            <DraggableFlatList
              data={queue}
              onDragEnd={({ data }: { data: SongData[] }) => setQueue(data)}
              keyExtractor={(item: SongData) => item.id}
              renderItem={renderItem}
              containerStyle={styles.flatList}
              contentContainerStyle={styles.scrollContent}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  controls: {
    flexDirection: "row",
    width: "100%",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  activeControl: {
    backgroundColor: "#2c5af3ff",
  },
  controlText: {
    color: "#b3b3b3",
    fontSize: 14,
    fontWeight: "600",
  },
  activeControlText: {
    color: "#fff",
  },
  listContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  currentSongItem: {
    backgroundColor: "rgba(44, 90, 243, 0.1)",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  currentSongTitle: {
    color: "#2c5af3ff",
  },
  songArtist: {
    color: "#b3b3b3",
    fontSize: 14,
    marginTop: 2,
  },
  dragHandle: {
    padding: 8,
  },
});
