import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from '@/components/IconSymbol';
import Song from "@/components/Song";
import { youtubeService } from "@/services/api";
import { Skeleton } from "@/components/Skeleton";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { DownloadBanner } from "@/components/DownloadBanner";
import { SongData } from "@/interfaces/Song";
import type { HistoryItem, SearchOverlayProps } from '@/interfaces/ui';
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

const SearchLoadingIndicator = () => {

  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  
  }, [animatedValue]);

  return (
    <Animated.View 
      style={[
        styles.searchLoadingBar, 
        { 
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          })
        }
      ]} 
    />
  );
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isVisible,
  onClose,
  fadeAnim,
  searchQuery,
  setSearchQuery,
  recentSearches,
  setRecentSearches,
}) => {

  const { playSong } = usePlayer();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

  const fetchResults = async (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length <= 3) {
      setResults([]);
      setLastSearchedQuery("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await youtubeService.searchVideos(trimmedQuery, 21);
      setResults(data);
      setLastSearchedQuery(trimmedQuery);
    }
    catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
      setLastSearchedQuery(trimmedQuery);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length <= 3) {
      setResults([]);
      setLastSearchedQuery("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      fetchResults(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSong = async (song: SongData) => {
    const isAlreadyInHistory = recentSearches.some(item => item.text === song.title);

    if (!isAlreadyInHistory) {
      const newHistoryItem: HistoryItem = {
        id: song.id,
        text: song.title,
      };
      setRecentSearches([newHistoryItem, ...recentSearches].slice(0, 10));
    }

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

  const removeHistoryItem = (id: string) => {
    setRecentSearches(recentSearches.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
    setRecentSearches([]);
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, zIndex: 100 }]}>
      <DownloadBanner />
      <View style={{ backgroundColor: "#282828", paddingTop: insets.top }}>
        <View style={styles.modalHeader}>
          <View style={styles.activeSearchWrapper}>
            <TextInput
              autoFocus
              style={styles.activeSearchInput}
              placeholder={t('searchOverlay.placeholder')}
              placeholderTextColor="#b3b3b3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {isLoading && <SearchLoadingIndicator />}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButtonWrapper}>
            <Text style={styles.cancelButton}>{t('searchOverlay.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContent}>
        {searchQuery.trim().length > 3 ? (
          isLoading && results.length === 0 ? (
            <View style={styles.resultsContainer}>
              {[...Array(10)].map((_, i) => (
                <SongSkeleton key={i} />
              ))}
            </View>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.resultsContainer}
            >
              {results.map((item, index) => (
                <Song 
                  key={`${item.id}-${index}`} 
                  data={item} 
                  onPress={handleSelectSong}
                />
              ))}
              {!isLoading && results.length === 0 && searchQuery.trim() === lastSearchedQuery && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>{t('searchOverlay.noResults')}</Text>
                  <Text style={styles.emptyStateSub}>{t('searchOverlay.noResultsSub')}</Text>
                </View>
              )}
            </ScrollView>
          )
        ) : recentSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>{t('searchOverlay.emptyTitle')}</Text>
            <Text style={styles.emptyStateSub}>{t('searchOverlay.emptySub')}</Text>
          </View>
        ) : (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={styles.recentSearchesTitle}>{t('searchOverlay.recentSearches')}</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={styles.clearRecentText}>{t('searchOverlay.clearAll')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {recentSearches.map((item, index) => (
                <TouchableOpacity 
                  key={`${item.id}-${index}`} 
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(item.text)}
                >
                  <IconSymbol name="time-outline" size={20} color="#b3b3b3" style={styles.recentSearchIcon} />
                  <Text style={styles.recentSearchText}>{item.text}</Text>
                  <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
                    <IconSymbol name="close" size={18} color="#b3b3b3" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
