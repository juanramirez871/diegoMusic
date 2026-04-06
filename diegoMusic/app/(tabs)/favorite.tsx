import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Song from "@/components/Song";

export default function FavoriteScreen() {

  const insets = useSafeAreaInsets();
  const songs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <LinearGradient
        colors={["#2c5af3ff", "#252424ff"]}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.containerSearch}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="search"
                size={20}
                color="#b3b3b3"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Find in liked songs"
                placeholderTextColor="#b3b3b3"
              />
            </View>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.buttonText}>Sort</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Liked Songs</Text>
            <Text style={styles.count}>281 songs</Text>
          </View>
        </View>
        <View style={styles.containerIcons}>
          <Ionicons name="shuffle" size={35} color="#fff" />
          <Ionicons name="play-circle" size={55} color="#fff" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.songContainer}>
          {songs.map((_, index) => (
            <Song key={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252424ff",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  contentContainer: {
    gap: 25,
  },
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    height: "100%",
  },
  sortButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 45,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  titleContainer: {
    marginTop: 10,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  count: {
    color: "#b3b3b3",
    fontSize: 14,
    marginTop: 4,
  },
  containerIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  songContainer: {
    gap: 5,
    paddingBottom: 20,
  },
});
