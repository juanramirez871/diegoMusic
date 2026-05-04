import {
  Platform,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Song from "@/components/Song";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import React, { useState, useMemo } from "react";
import { styles } from "@/styles/FavoriteScreen.styles";
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
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavorites = useMemo(() => {
    return [...favorites].reverse().filter(
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
            colors={["#2c5af3ff", Platform.OS === 'web' ? '#121212' : '#252424ff']}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        <Animated.View
          style={[
            styles.headerTitleContainer,
            headerTitleAnimatedStyle,
            { paddingTop: insets.top },
          ]}
        >
          <Text style={styles.headerTitle}>{t('favorite.title')}</Text>
        </Animated.View>
        <View
          style={[styles.contentContainer, { paddingTop: insets.top + 10 }]}
        >
          <Animated.View style={[styles.containerSearch, searchAnimatedStyle]}>
            <View style={styles.inputWrapper}>
              <IconSymbol
                name="search"
                size={20}
                color="#b3b3b3"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('favorite.findIn')}
                placeholderTextColor="#b3b3b3"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <IconSymbol name="close-circle" size={18} color="#b3b3b3" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <Text style={styles.title}>{t('favorite.title')}</Text>
            <Text style={styles.count}>{t('favorite.songCount', { count: favorites.length })}</Text>
          </Animated.View>
        </View>
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
                onPress={() => playSong(song, filteredFavorites, 'favorites')} 
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="heart-outline" size={60} color="#333" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? t('favorite.noResults') : t('favorite.noSongs')}
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.containerIcons, iconsAnimatedStyle]}>
        <Animated.View style={shuffleAnimatedStyle}>
          <TouchableOpacity onPress={toggleShuffle}>
            <IconSymbol name="shuffle" size={35} color={isShuffle ? "#2c5af3ff" : "#fff"} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          style={Platform.OS === 'web' ? styles.webPlayBtn : undefined}
          onPress={() => {
            if (filteredFavorites.length === 0) return;
            const randomIndex = Math.floor(Math.random() * filteredFavorites.length);
            const startSong = isShuffle ? filteredFavorites[randomIndex] : filteredFavorites[0];
            playSong(startSong, filteredFavorites, 'favorites');
          }}
        >
          <IconSymbol name={Platform.OS === 'web' ? 'play' : 'play-circle'} size={Platform.OS === 'web' ? 28 : 55} color={Platform.OS === 'web' ? '#000' : '#fff'} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
