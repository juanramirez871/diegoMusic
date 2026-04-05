import { View, Text, StyleSheet, Image } from "react-native";

export default function RecentPlayed() {

  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const leftColumn = items.slice(0, 4);
  const rightColumn = items.slice(4, 8);

  const renderItem = (item: number, index: number) => (
    <View style={styles.containerItem} key={index}>
      <Image
        source={{
          uri: "https://i0.wp.com/codigoespagueti.com/wp-content/uploads/2024/05/imagen_2024-05-07_215034139.jpg?resize=1280%2C1600&ssl=1",
        }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          Cigarettes After Sex
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.gridContainer}>
      <View style={styles.column}>
        {leftColumn.map((item, index) => renderItem(item, index))}
      </View>
      <View style={styles.column}>
        {rightColumn.map((item, index) => renderItem(item, index + 4))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  containerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3c3b3bff",
    borderRadius: 8,
    overflow: "hidden",
    height: 50,
  },
  image: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
});


