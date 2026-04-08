import FavoriteArtists from "@/components/FavoriteArtists";
import CarouselPlayer from "@/components/CarouselPlayer";
import MusicArtist from "@/components/MusicArtist";
import RecentPlayed from "@/components/RecentPlayed";
import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FavoritePodcasts from "@/components/FavoritePodcasts";
import Podcasts from "@/components/Podcasts";
import { usePlayer } from "@/context/PlayerContext";
import { GenreOverlay } from "@/components/GenreOverlay";
import { ArtistData } from "@/components/Song";

export default function HomeScreen() {
  
  const [selectedTag, setSelectedTag] = useState("Music");
  const { favoriteArtists } = usePlayer();
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [isArtistOverlayVisible, setIsArtistOverlayVisible] = useState(false);
  const artistFadeAnim = useRef(new Animated.Value(0)).current;

  const handleOpenArtist = (artist: ArtistData) => {
    setSelectedArtist(artist);
    setIsArtistOverlayVisible(true);
    Animated.timing(artistFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseArtist = () => {
    Animated.timing(artistFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsArtistOverlayVisible(false);
      setSelectedArtist(null);
    });
  };

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
                  <CarouselPlayer query="trending music" />
                </View>

                <View style={styles.musicArtistContainer}>
                  {favoriteArtists.map((artist) => (
                    <MusicArtist key={artist.id} artist={artist} />
                  ))}
                </View>

                <View>
                  <FavoriteArtists onArtistPress={handleOpenArtist} />
                </View>

                <View>
                  <Text style={styles.title}>Your most played music</Text>
                  <CarouselPlayer query="most played hits" />
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

      <GenreOverlay 
        isVisible={isArtistOverlayVisible}
        onClose={handleCloseArtist}
        genreTitle={selectedArtist?.name || ""}
        channelId={selectedArtist?.id}
        fadeAnim={artistFadeAnim}
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
    backgroundColor: "#2c5af3ff",
    borderColor: "#2c5af3ff",
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
