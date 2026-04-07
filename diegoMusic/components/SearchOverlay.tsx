import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Song, { SongData } from "./Song";

export interface HistoryItem {
  id: string;
  text: string;
}

export interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches: HistoryItem[];
  setRecentSearches: (searches: HistoryItem[]) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isVisible,
  onClose,
  fadeAnim,
  searchQuery,
  setSearchQuery,
  recentSearches,
  setRecentSearches,
}) => {

  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = async (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/youtube/search/video?search=${encodeURIComponent(trimmedQuery)}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    }
    catch (error) {
      console.error("Error fetching search results:", error);
      setResults([]);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchResults(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSong = (song: SongData) => {

    const isAlreadyInHistory = recentSearches.some(item => item.text === song.title);
    if (!isAlreadyInHistory) {
      const newHistoryItem: HistoryItem = {
        id: song.id,
        text: song.title,
      };

      setRecentSearches([newHistoryItem, ...recentSearches].slice(0, 10));
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
      <View style={{ backgroundColor: "#282828", paddingTop: insets.top }}>
        <View style={styles.modalHeader}>
          <View style={styles.activeSearchWrapper}>
            <TextInput
              autoFocus
              style={styles.activeSearchInput}
              placeholder="What do you want to listen to?"
              placeholderTextColor="#b3b3b3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {isLoading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButtonWrapper}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContent}>
        {searchQuery.trim().length > 3 ? (
          isLoading && results.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#2c5af3ff" />
            </View>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.resultsContainer}
            >
              {results.map((item) => (
                <Song 
                  key={item.id} 
                  data={item} 
                  onPress={handleSelectSong}
                />
              ))}
              {!isLoading && results.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>No results found</Text>
                  <Text style={styles.emptyStateSub}>Try searching for something else.</Text>
                </View>
              )}
            </ScrollView>
          )
        ) : recentSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Play what you love</Text>
            <Text style={styles.emptyStateSub}>Search for artists, songs, podcasts, and more.</Text>
          </View>
        ) : (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={styles.recentSearchesTitle}>Recent searches</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={styles.clearRecentText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {recentSearches.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(item.text)}
                >
                  <Ionicons name="time-outline" size={20} color="#b3b3b3" style={styles.recentSearchIcon} />
                  <Text style={styles.recentSearchText}>{item.text}</Text>
                  <TouchableOpacity onPress={() => removeHistoryItem(item.id)}>
                    <Ionicons name="close" size={18} color="#b3b3b3" />
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

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#282828",
  },
  activeSearchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  activeSearchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: "100%",
  },
  cancelButtonWrapper: {
    paddingLeft: 4,
  },
  cancelButton: {
    color: "#fff",
    fontSize: 14,
  },
  searchContent: {
    flex: 1,
  },
  resultsContainer: {
    paddingTop: 10,
    paddingBottom: 150,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateSub: {
    color: "#b3b3b3",
    fontSize: 14,
    textAlign: "center",
  },
  recentSearchesContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentSearchesTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearRecentText: {
    color: "#b3b3b3",
    fontSize: 14,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
});
