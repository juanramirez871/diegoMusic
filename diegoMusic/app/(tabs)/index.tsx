import ListPlayer from "@/components/ListPlayer";
import FavoriteArtists from "@/components/FavoriteArtists";
import { GenreOverlay } from "@/components/GenreOverlay";
import MusicArtist from "@/components/MusicArtist";
import { OfflineView } from "@/components/OfflineView";
import RecentPlayed from "@/components/RecentPlayed";
import { StatsOverlay } from "@/components/StatsOverlay";
import { useNetwork } from "@/context/NetworkContext";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArtistData, SongData } from "@/interfaces/Song";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/HomeScreen.styles";


export default function HomeScreen() {
  
  const [selectedTag, setSelectedTag] = useState('music');
  const { t } = useLanguage();
  const { favoriteArtists, songPlays } = usePlayer();
  const mostPlayed = useMemo(
    () =>
      (Object.values(songPlays) as unknown as SongData[])
        .sort((a, b) => ((b as any).timesPlayed || 0) - ((a as any).timesPlayed || 0))
        .slice(0, 10),
    [songPlays]
  );
  const [selectedArtist, setSelectedArtist] = useState<ArtistData | null>(null);
  const [isArtistOverlayVisible, setIsArtistOverlayVisible] = useState(false);
  const artistFadeAnim = useRef(new Animated.Value(0)).current;
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const statsFadeAnim = useRef(new Animated.Value(0)).current;
  const { isOnline, isNetworkChecked } = useNetwork();
  const handleOpenStats = () => {
    setIsStatsVisible(true);
    Animated.timing(statsFadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseStats = () => {
    Animated.timing(statsFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsStatsVisible(false));
  };

  const displayArtists = useMemo(() => {
    if (favoriteArtists.length <= 3) return favoriteArtists;
    const shuffled = [...favoriteArtists].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);

  }, [favoriteArtists]);

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
                  selectedTag === 'music' && styles.selectedTag,
                ]}
                onPress={() => setSelectedTag('music')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === 'music' && styles.selectedTagText,
                  ]}
                >
                  {t('home.musicTag')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statsButton}
                onPress={handleOpenStats}
                activeOpacity={0.7}
              >
                <Ionicons name="trophy-outline" size={18} color="#E0E0E0" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {selectedTag === 'music' && (
              <View style={styles.recentPlayedWrapper}>
                <View>
                  <RecentPlayed />
                </View>
                
                {/* Todo: Add music you might like for V.4 DiegoMusic */}
                {/* <View>
                  <Text style={styles.title}>Music you might like</Text>
                  <CarouselPlayer />
                </View> */}

                <View style={styles.musicArtistContainer}>
                  {displayArtists.map((artist) => (
                    <MusicArtist key={artist.id} artist={artist} />
                  ))}
                </View>

                <View>
                  <FavoriteArtists onArtistPress={handleOpenArtist} />
                </View>

                <View>
                  <Text style={styles.title}>{t('home.mostPlayedTitle')}</Text>
                  {mostPlayed.length > 0 ? (
                    <ListPlayer data={mostPlayed} />
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>{t('home.noMostPlayed')}</Text>
                    </View>
                  )}
                </View>

                <View style={{ width: "100%", alignItems: "center" }}>
                  <Image
                    source={require("@/assets/images/footer.png")}
                    style={{
                      width: 200,
                      height: 100,
                      transform: [{ translateY: 35 }],
                    }}
                  />
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

      <StatsOverlay
        isVisible={isStatsVisible}
        onClose={handleCloseStats}
        fadeAnim={statsFadeAnim}
      />
    </SafeAreaView>
  );
}
