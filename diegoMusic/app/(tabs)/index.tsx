import FavoriteArtists from "@/components/FavoriteArtists";
import CarouselPlayer from "@/components/CarouselPlayer";
import MusicArtist from "@/components/MusicArtist";
import RecentPlayed from "@/components/RecentPlayed";
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FavoritePodcasts from "@/components/FavoritePodcasts";
import Podcasts from "@/components/Podcasts";

export default function HomeScreen() {
  const [selectedTag, setSelectedTag] = useState("Music");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Image
                source={require("@/assets/images/avatar.jpg")}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            <View style={styles.tagsContainer}>
              <TouchableOpacity
                style={[
                  styles.tag,
                  selectedTag === "Music" && styles.selectedTag,
                ]}
                onPress={() => setSelectedTag("Music")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === "Music" && styles.selectedTagText,
                  ]}
                >
                  Music
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tag,
                  selectedTag === "Podcasts" && styles.selectedTag,
                ]}
                onPress={() => setSelectedTag("Podcasts")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === "Podcasts" && styles.selectedTagText,
                  ]}
                >
                  Podcasts
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {selectedTag === "Music" && (
              <View style={styles.recentPlayedWrapper}>
                <View>
                  <RecentPlayed />
                </View>
                
                <View>
                  <Text style={styles.title}>Music you might like</Text>
                  <CarouselPlayer />
                </View>

                <View style={styles.musicArtistContainer}>
                  <MusicArtist />
                  <MusicArtist />
                  <MusicArtist />
                </View>

                <View>
                  <FavoriteArtists />
                </View>

                <View>
                  <Text style={styles.title}>Your most played music</Text>
                  <CarouselPlayer />
                </View>
              </View>
            )}

            {selectedTag === "Podcasts" && (
              <View style={styles.podcastsWrapper}>
                <View>
                  <FavoritePodcasts />
                </View>
                
                <View>
                  <Podcasts />
                </View>
              </View>
            )}
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
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTag: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  tagText: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  selectedTagText: {
    color: "#FFFFFF",
  },
  content: {
    marginTop: 20,
  },
  recentPlayedWrapper: {
    width: "100%",
    gap: 20,
  },
  podcastsWrapper: {
    width: "100%",
    gap: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
    paddingHorizontal: 4,
  },
  musicArtistContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 12,
  },
});
