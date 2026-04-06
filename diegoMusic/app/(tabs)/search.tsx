import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 44) / 2;
import CATEGORIES from "@/constants/categories";


export default function TabTwoScreen() {
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
            <View style={styles.inputWrapper}>
              <Ionicons
                name="search"
                size={22}
                color="#252424"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.inputInput}
                placeholder="What do you want to listen to?"
                placeholderTextColor="#666"
              />
            </View>
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
  inputInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#000",
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
