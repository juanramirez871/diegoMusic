import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { usePlayer } from "@/context/PlayerContext";
import { SongData } from "./Song";

export default function RecentPlayed() {

  const { recentPlayed, playSong } = usePlayer();
  const leftColumn = recentPlayed.slice(0, 4);
  const rightColumn = recentPlayed.slice(4, 8);

  const renderSkeleton = (key: string) => (
    <View style={[styles.containerItem, styles.skeletonItem]} key={key}>
      <View style={styles.skeletonImage} />
      <View style={styles.textContainer}>
        <View style={styles.skeletonText} />
      </View>
    </View>
  );

  const renderItem = (item: SongData) => {
    const thumbnailSource = item.thumbnail?.url ? { uri: item.thumbnail.url } : require("@/assets/images/cover.jpg");
    return (
      <TouchableOpacity 
        style={styles.containerItem} 
        key={item.id}
        onPress={() => playSong(item, recentPlayed)}
        activeOpacity={0.7}
      >
        <Image
          source={thumbnailSource}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderColumn = (items: SongData[], startIndex: number) => {

    const columnItems = [];
    for (let i = 0; i < items.length; i++) {
      columnItems.push(renderItem(items[i]));
    }

    for (let i = items.length; i < 4; i++) {
      columnItems.push(renderSkeleton(`skeleton-${startIndex + i}`));
    }

    return columnItems;
  };

  return (
    <View style={styles.gridContainer}>
      <View style={styles.column}>
        {renderColumn(leftColumn, 0)}
      </View>
      <View style={styles.column}>
        {renderColumn(rightColumn, 4)}
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
  skeletonItem: {
    backgroundColor: "#2a2a2aff",
    opacity: 0.5,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    backgroundColor: "#3c3b3bff",
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#3c3b3bff",
    borderRadius: 4,
    width: '80%',
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

