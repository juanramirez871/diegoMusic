import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import { useState } from "react";
import SongOptionsModal from "./SongOptionsModal";

export interface ArtistData {
  id: string;
  name: string;
  avatar: string;
}

export interface SongData {
  id: string;
  url: string;
  title: string;
  thumbnail: {
    url: string;
  };
  channel: {
    name: string;
    id?: string;
    avatar?: string;
    icon?: string;
  };
  duration_formatted: string;
  timesPlayed?: number;
}

interface SongProps {
  data?: SongData;
  onPress?: (song: SongData) => void;
}

export default function Song({ data, onPress }: SongProps) {

  const [modalVisible, setModalVisible] = useState(false);
  const title = data?.title || "Sin título";
  const artist = data?.channel?.name || "Sin artista";
  const thumbnail = data?.thumbnail?.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg";

  const handlePress = () => {
    if (onPress && data) {
      onPress(data);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.songContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: thumbnail }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.metadataContainer}>
            <View style={styles.videoBadge}>
              <Foundation name="play-video" size={16} color="#b3b3b3" />
            </View>
            <Text style={styles.artist} numberOfLines={1}>
              {artist} {data?.duration_formatted ? `• ${data.duration_formatted}` : ""}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation();
            setModalVisible(true);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#b3b3b3" />
        </TouchableOpacity>
      </TouchableOpacity>

      <SongOptionsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        song={data}
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
