import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { usePlayer } from "@/context/PlayerContext";
import { FavoriteArtistsProps } from "@/interfaces/artists";


export default function FavoriteArtists({ onArtistPress }: FavoriteArtistsProps) {
  const { favoriteArtists } = usePlayer();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Artists</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {favoriteArtists.map((artist) => (
          <TouchableOpacity 
            key={artist.id} 
            style={styles.artistItem}
            activeOpacity={0.7}
            onPress={() => onArtistPress?.(artist)}
          >
            <Image
              source={{
                uri: artist.avatar || "https://i.pinimg.com/736x/47/cb/be/47cbbee4df2bc1fccc63c3b0f9af46aa.jpg",
              }}
              style={styles.artistImage}
            />
            <Text style={styles.artistName} numberOfLines={1}>
              {artist.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {favoriteArtists.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorite artists yet (ㆆ_ㆆ)</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 16,
  },
  artistItem: {
    alignItems: "center",
    width: 100,
    gap: 8,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  artistName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  emptyContainer: {
    width: "100%",
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 12,
  }
});

