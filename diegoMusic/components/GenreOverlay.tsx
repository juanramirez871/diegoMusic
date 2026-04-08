import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Song, { SongData } from "./Song";
import { youtubeService } from "../services/api";
import { usePlayer } from "../context/PlayerContext";
import { Skeleton } from "./Skeleton";

interface GenreOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  genreTitle: string;
  fadeAnim: Animated.Value;
}

const SongSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <Skeleton width={50} height={50} borderRadius={4} />
    <View style={styles.skeletonInfo}>
      <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={12} borderRadius={4} />
    </View>
  </View>
);

export const GenreOverlay: React.FC<GenreOverlayProps> = ({
  isVisible,
  onClose,
  genreTitle,
  fadeAnim,
}) => {

  const { playSong } = usePlayer();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && genreTitle) {
      const fetchGenreSongs = async () => {
        setIsLoading(true);
        try {
          const query = `best ${genreTitle} songs`;
          const data = await youtubeService.searchVideos(query);
          setResults(data);
        } catch (error) {
          console.error("Error fetching genre songs:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGenreSongs();
    }
  }, [isVisible, genreTitle]);

  const handleSelectSong = async (song: SongData) => {
    if (song.channel?.id) {
      try {
        const channelVideos = await youtubeService.getChannelVideos(song.channel.id);
        const filteredQueue = channelVideos.filter(s => s.id !== song.id);
        playSong(song, [song, ...filteredQueue]);
      }
      catch (error) {
        console.error("Error fetching channel videos for queue:", error);
        playSong(song);
      }
    }
    else {
      playSong(song);
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, zIndex: 110 }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{genreTitle}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.resultsContainer,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {isLoading ? (
          [...Array(10)].map((_, i) => <SongSkeleton key={i} />)
        ) : results.length > 0 ? (
          results.map((item, index) => (
            <Song
              key={`${item.id}-${index}`}
              data={item}
              onPress={handleSelectSong}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No se encontraron canciones</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsContainer: {
    paddingTop: 10,
  },
  skeletonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 100,
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "#b3b3b3",
    fontSize: 16,
  },
});
