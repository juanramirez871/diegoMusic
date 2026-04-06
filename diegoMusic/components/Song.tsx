import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import { useState } from "react";
import SongOptionsModal from "./SongOptionsModal";

export default function Song() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.songContainer}>
        <Image
          source={{
            uri: "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg",
          }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Esto es amor
          </Text>
          <View style={styles.metadataContainer}>
            <View style={styles.videoBadge}>
              <Foundation name="play-video" size={16} color="#b3b3b3" />
            </View>
            <Text style={styles.artist} numberOfLines={1}>
              Mon Laferta, Conociendo Rusia
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#b3b3b3" />
        </TouchableOpacity>
      </View>

      <SongOptionsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        songTitle="Esto es amor"
      />
    </>
  );
}

const styles = StyleSheet.create({
  songContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  videoBadge: {
    flexDirection: "row",
    alignItems: "center",
    color: "#b3b3b3",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    gap: 2,
  },
  artist: {
    color: "#b3b3b3",
    fontSize: 13,
    flex: 1,
  },
  menuButton: {
    padding: 10,
  },
});
