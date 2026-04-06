import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Song from "./Song";

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches: { id: number; text: string }[];
  setRecentSearches: (searches: { id: number; text: string }[]) => void;
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
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButtonWrapper}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContent}>
        {searchQuery.length > 3 ? (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.resultsContainer}
          >
            
            {
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((item, index) => (
                <Song key={item} />
              ))
            }
            
          </ScrollView>
        ) : recentSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Play what you love</Text>
            <Text style={styles.emptyStateSub}>Search for artists, songs, podcasts, and more.</Text>
          </View>
        ) : (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text style={styles.recentSearchesTitle}>Recent searches</Text>
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearRecentText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {recentSearches.map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.recentSearchItem}>
                  <Ionicons name="time-outline" size={20} color="#b3b3b3" style={styles.recentSearchIcon} />
                  <Text style={styles.recentSearchText}>{item.text}</Text>
                  <Ionicons name="close" size={18} color="#b3b3b3" />
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
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
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
