import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayer } from "@/context/PlayerContext";
import { parseDuration } from "@/context/player/utils";

interface StatsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
  isVisible,
  onClose,
  fadeAnim,
}) => {
  const insets = useSafeAreaInsets();
  const { favorites, streak, artistPlays, songPlays } = usePlayer();

  if (!isVisible) return null;

  const allSongs = Object.values(songPlays).sort((a, b) => b.timesPlayed - a.timesPlayed);
  const totalPlays = allSongs.reduce((acc, s) => acc + s.timesPlayed, 0);
  const totalMinutes = allSongs.reduce((acc, song) => {
    const durationMs = parseDuration(song.duration_formatted || '');
    return acc + (durationMs * song.timesPlayed) / 60000;
  }, 0);

  const topArtists = Object.values(artistPlays)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const topSongs = allSongs.slice(0, 5);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Stats</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Ionicons name="musical-notes" size={24} color="#2c5af3ff" />
            <Text style={styles.cardNumber}>{totalPlays}</Text>
            <Text style={styles.cardLabel}>Total plays</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="time" size={24} color="#2c5af3ff" />
            <Text style={styles.cardNumber}>{Math.round(totalMinutes)}</Text>
            <Text style={styles.cardLabel}>Minutes</Text>
          </View>
          <View style={styles.card}>
            <Ionicons name="heart" size={24} color="#2c5af3ff" />
            <Text style={styles.cardNumber}>{favorites.length}</Text>
            <Text style={styles.cardLabel}>Liked</Text>
          </View>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Text style={styles.streakFlame}>🔥</Text>
            <View>
              <Text style={styles.streakLabel}>Day streak</Text>
              <Text style={styles.streakSub}>
                {streak > 0 ? "Keep it going!" : "Play today to start a streak"}
              </Text>
            </View>
          </View>
          <Text style={styles.streakNumber}>{streak}</Text>
        </View>

        {topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top artists</Text>
            <View style={styles.artistsRow}>
              {topArtists.map((artist, i) => {
                const thumb = artist.avatar ? { uri: artist.avatar } : { uri: "https://i.pinimg.com/736x/47/cb/be/47cbbee4df2bc1fccc63c3b0f9af46aa.jpg" };
                return (
                  <View key={artist.name} style={styles.artistItem}>
                    {i === 0 && <View style={styles.crownBadge}><Text style={styles.crownText}>👑</Text></View>}
                    <Image source={thumb} style={styles.artistAvatar} />
                    <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
                    <Text style={styles.artistPlays}>{artist.count} plays</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {topSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most played</Text>
            {topSongs.map((song, i) => {
              const thumb = song.thumbnail?.url ? { uri: song.thumbnail.url } : require("@/assets/images/cover.jpg");
              return (
                <View key={song.id} style={styles.songRow}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Image source={thumb} style={styles.songThumb} />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{song.channel.name}</Text>
                  </View>
                  <View style={styles.playsBadge}>
                    <Text style={styles.playsText}>{song.timesPlayed || 1}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {totalPlays === 0 && favorites.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Play some music to see your stats</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
    zIndex: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 24,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  cardNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  cardLabel: {
    color: "#b3b3b3",
    fontSize: 12,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rank: {
    color: "#b3b3b3",
    fontSize: 16,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  songThumb: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  songArtist: {
    color: "#b3b3b3",
    fontSize: 12,
    marginTop: 2,
  },
  playsBadge: {
    backgroundColor: "#2c5af3ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  playsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  artistsRow: {
    flexDirection: "row",
    gap: 12,
  },
  artistItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  crownBadge: {
    position: "absolute",
    top: -10,
    zIndex: 1,
  },
  crownText: {
    fontSize: 16,
  },
  artistAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
  },
  artistName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  artistPlays: {
    color: "#b3b3b3",
    fontSize: 11,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 18,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  streakFlame: {
    fontSize: 32,
  },
  streakLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  streakSub: {
    color: "#b3b3b3",
    fontSize: 12,
    marginTop: 2,
  },
  streakNumber: {
    color: "#2c5af3ff",
    fontSize: 40,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    color: "#b3b3b3",
    fontSize: 14,
    textAlign: "center",
  },
});
