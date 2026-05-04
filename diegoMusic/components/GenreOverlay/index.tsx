import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from '@/components/IconSymbol';
import Song from "@/components/Song";
import { youtubeService } from "@/services/youtubeService";
import { usePlayer } from "@/context/PlayerContext";
import { Skeleton } from "@/components/Skeleton";
import { GenreOverlayProps, SongData } from "@/interfaces/Song";
import { useLanguage } from "@/context/LanguageContext";
import { styles } from './styles';


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
  searchQuery,
  channelId,
  fadeAnim,
  bottomOffset = 0,
}) => {

  const { playSong } = usePlayer();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && genreTitle) {
      const fetchSongs = async () => {
        setIsLoading(true);
        try {
          let data: SongData[] = [];
          if (channelId) {
            data = await youtubeService.getChannelVideos(channelId);
          } else {
            const query = `best ${searchQuery ?? genreTitle} songs`;
            data = await youtubeService.searchVideos(query, 41);
          }
          setResults(data);
        }
        catch (error) {
          console.error("Error fetching songs:", error);
          setResults([]);
        }
        finally {
          setIsLoading(false);
        }
      };
      fetchSongs();
    }
  }, [isVisible, genreTitle, channelId]);

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
      playSong(song, results);
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, zIndex: 110, bottom: bottomOffset }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <IconSymbol name="chevron-back" size={28} color="#fff" />
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
            <Text style={styles.emptyStateTitle}>{t('genre.noSongsFound')}</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};
