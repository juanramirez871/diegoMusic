import { useState, useRef } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 44) / 2;
import CATEGORIES from "@/constants/categories";
import { SearchOverlay } from "@/components/SearchOverlay";

export default function TabTwoScreen() {

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<{id: number, text: string}[]>([
    {
      id: 1,
      text: "Enamorado tuyo"
    },
    {
      id: 2,
      text: "El fantasma de la opera"
    },
    {
      id: 3,
      text: "Esto es amor"
    }
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const handleOpenSearch = () => {
    setIsSearching(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
              activeOpacity={0.9} 
              style={styles.inputWrapper}
              onPress={handleOpenSearch}
            >
              <Ionicons
                name="search"
                size={22}
                color="#252424"
                style={styles.searchIcon}
              />
              <Text style={styles.placeholderText}>What do you want to listen to?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.browseAllSection}>
            <Text style={styles.sectionTitle}>Browse all</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: category.color }]}
                >
                  <Text style={styles.categoryTitle}>{category.title}</Text>
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
        setRecentSearches={setRecentSearches}
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
    paddingBottom: 100,
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
    justifyContent: "flex-start",
  },
  categoryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
