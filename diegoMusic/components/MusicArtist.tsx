import { View, Text, StyleSheet, Image } from "react-native";
import CarouselPlayer from "./CarouselPlayer";



export default function MusicArtist() {
  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <View>
            <Image
                source={{
                    uri: "https://i.pinimg.com/736x/47/cb/be/47cbbee4df2bc1fccc63c3b0f9af46aa.jpg",
                }}
                style={styles.image}
            />
        </View>
        <View>
            <Text style={styles.title}>For fans of</Text>
            <Text style={styles.author}>Maná</Text>
        </View>
      </View>

      <View>
        <CarouselPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
  },
  title: {
    color: "#b3b3b3",
    fontSize: 14,
    fontWeight: "bold",
  },
  author: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: "50%",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
});
