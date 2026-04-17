import { GenreOverlay } from "@/components/GenreOverlay";
import { OfflineView } from "@/components/OfflineView";
import { HistoryItem, SearchOverlay } from "@/components/SearchOverlay";
import CATEGORIES from "@/constants/categories";
import { useNetwork } from "@/context/NetworkContext";
import storage from '@/services/storage';
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 44) / 2;
const RECENT_SEARCHES_KEY = '@recent_searches';

export default function TabTwoScreen() {

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGenreVisible, setIsGenreVisible] = useState(false);
  const { isOnline, isNetworkChecked, isApiReachable } = useNetwork();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await storage.getItem(RECENT_SEARCHES_KEY);
        if (savedHistory) {
          setRecentSearches(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  const handleUpdateHistory = async (newHistory: HistoryItem[]) => {
    setRecentSearches(newHistory);
    try {
      await storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
    }
    catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const genreFadeAnim = useRef(new Animated.Value(0)).current;

  const handleOpenSearch = () => {
    setIsSearching(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleOpenGenre = (genreTitle: string) => {
    setSelectedGenre(genreTitle);
    setIsGenreVisible(true);
    Animated.timing(genreFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseGenre = () => {
    Animated.timing(genreFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsGenreVisible(false);
      setSelectedGenre(null);
    });
  };

  const handleCloseSearch = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsSearching(false);
      setSearchQuery("");
    });
  };

  const isDisabled = (isNetworkChecked && !isOnline) || !isApiReachable;

  if (isNetworkChecked && !isOnline) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <OfflineView />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          <View style={styles.containerHeader}>
            <Image
              source={require("@/assets/images/avatar.jpg")}
              style={styles.avatar}
            />
            <Text style={styles.headerTitle}>Search</Text>
          </View>

          <View style={styles.searchSection}>
            <TouchableOpacity
              activeOpacity={isDisabled ? 1 : 0.9}
              style={[styles.inputWrapper, isDisabled && styles.inputWrapperDisabled]}
              onPress={isDisabled ? undefined : handleOpenSearch}
              disabled={isDisabled}
            >
              <Ionicons
                name="search"
                size={22}
                color={isDisabled ? "#aaa" : "#252424"}
                style={styles.searchIcon}
              />
              <Text style={[styles.placeholderText, isDisabled && styles.placeholderDisabled]}>
                {isDisabled ? "Not available offline" : "What do you want to listen to?"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.browseAllSection}>
            <Text style={styles.sectionTitle}>Browse all</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: category.color }, isDisabled && styles.categoryCardDisabled]}
                  onPress={isDisabled ? undefined : () => handleOpenGenre(category.title)}
                  disabled={isDisabled}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Image
                    source={category.image}
                    style={[styles.categoryIcon, isDisabled && styles.categoryIconDisabled]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <SearchOverlay 
        isVisible={isSearching}
        onClose={handleCloseSearch}
        fadeAnim={fadeAnim}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        recentSearches={recentSearches}
        setRecentSearches={handleUpdateHistory}
      />

      <GenreOverlay 
        isVisible={isGenreVisible}
        onClose={handleCloseGenre}
        genreTitle={selectedGenre || ""}
        fadeAnim={genreFadeAnim}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#252424ff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  containerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  searchSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  placeholderDisabled: {
    color: "#999",
  },
  categoryCardDisabled: {
    opacity: 0.4,
  },
  categoryIconDisabled: {
    opacity: 0.4,
  },
  browseAllSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: ITEM_WIDTH,
    height: 100,
    borderRadius: 8,
    padding: 12,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  categoryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 8,
    right: 3,
    bottom: 3,
    position: "absolute",
  },
});
