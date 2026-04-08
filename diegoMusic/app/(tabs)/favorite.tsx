import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Song from "@/components/Song";
import { usePlayer } from "@/context/PlayerContext";
import React, { useState, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

export default function FavoriteScreen() {

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { favorites, playSong, isShuffle, toggleShuffle } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavorites = useMemo(() => {
    return favorites.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [favorites, searchQuery]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 60],
      [0, -20],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 60],
      [0, -20],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const iconsAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 180],
      [0, -125],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }],
    };
  });

  const shuffleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [120, 150],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  const headerGradientStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 180],
      [insets.top + 180, insets.top + 65],
      Extrapolation.CLAMP,
    );
    return {
      height,
    };
  });

  const headerTitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [150, 180],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>

      <StatusBar style="light" translucent />
      <Animated.View style={[styles.headerContainer, headerGradientStyle]}>
        <LinearGradient
          colors={["#2c5af3ff", "#252424ff"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.headerTitleContainer,
            headerTitleAnimatedStyle,
            { paddingTop: insets.top },
          ]}
        >
          <Text style={styles.headerTitle}>Liked Songs</Text>
        </Animated.View>
        <View
          style={[styles.contentContainer, { paddingTop: insets.top + 10 }]}
        >
          <Animated.View style={[styles.containerSearch, searchAnimatedStyle]}>
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
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#b3b3b3" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.title}>Liked Songs</Text>
            <Text style={styles.count}>{favorites.length} songs</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.containerIcons, iconsAnimatedStyle]}>
        <Animated.View style={shuffleAnimatedStyle}>
          <TouchableOpacity onPress={toggleShuffle}>
            <Ionicons name="shuffle" size={35} color={isShuffle ? "#2c5af3ff" : "#fff"} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={() => filteredFavorites.length > 0 && playSong(filteredFavorites[0], filteredFavorites)}>
          <Ionicons name="play-circle" size={55} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 200,
          paddingBottom: 120,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.songContainer}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map((song) => (
              <Song 
                key={song.id} 
                data={song} 
                onPress={() => playSong(song, filteredFavorites)} 
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={60} color="#333" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? "No results found" : "No liked songs yet"}
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252424ff",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 20,
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
    position: "absolute",
    top: 190,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    zIndex: 20,
  },
  scrollView: {
    flex: 1,
  },
  songContainer: {
    gap: 5,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyStateText: {
    color: "#b3b3b3",
    fontSize: 16,
    marginTop: 15,
  },
});
