import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { IconSymbol } from "./IconSymbol";

export default function Artists() {
  const artists = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Artists</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {artists.map((item, index) => (
          <View key={index} style={styles.artistItem}>
            <Image
              source={{
                uri: "https://static.wikia.nocookie.net/5toubun-no-hanayome/images/4/4d/Quintuplets_color_art_-_volume_6_release.jpg/revision/latest?cb=20190122040542",
              }}
              style={styles.artistImage}
            />
            <Text style={styles.artistName} numberOfLines={1}>
              Mon Laferte
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.artistItem} activeOpacity={0.7}>
          <View style={styles.addButton}>
            <IconSymbol name="plus" size={30} color="#fff" />
          </View>
          <Text style={styles.artistName}>Add Artist</Text>
        </TouchableOpacity>
      </ScrollView>
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
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
  },
  artistName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

