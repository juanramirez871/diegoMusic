import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches: string[];
  setRecentSearches: (searches: string[]) => void;
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
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'left', 'right']}>
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

          <View style={styles.searchContent}>
            {recentSearches.length === 0 ? (
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
                <ScrollView showsVerticalScrollIndicator={false}>
                  {recentSearches.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.recentSearchItem}>
                      <Ionicons name="time-outline" size={20} color="#b3b3b3" style={styles.recentSearchIcon} />
                      <Text style={styles.recentSearchText}>{item}</Text>
                      <Ionicons name="close" size={18} color="#b3b3b3" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  modalSafeArea: {
    flex: 1,
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
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
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
