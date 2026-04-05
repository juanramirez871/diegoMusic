import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function MightLike() {
  const songs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music you might like</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {songs.map((item, index) => (
          <View key={index} style={styles.songItem}>
            <Image
              source={{
                uri: "https://images7.alphacoders.com/121/thumb-1920-1210002.png",
              }}
              style={styles.image}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.titleSong} numberOfLines={1}>
                Enamorado tuyo
              </Text>
              <Text style={styles.subtitleSong} numberOfLines={1}>
                Cuarteto de nos
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 16,
  },
  songItem: {
    width: 140,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  infoContainer: {
    marginTop: 8,
  },
  titleSong: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitleSong: {
    fontSize: 12,
    marginTop: 2,
    color: "#b3b3b3",
  },
});
