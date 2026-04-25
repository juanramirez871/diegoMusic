import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Foundation from '@expo/vector-icons/Foundation';
import { useState } from "react";
import SongOptionsModal from "./SongOptionsModal";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { useThumbnail } from "@/hooks/useThumbnail";
import { SongProps } from "@/interfaces/Song";


export default function Song({ data, onPress }: SongProps) {

  const { currentSong, isPlaying, isLoading } = usePlayer();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const thumbnailSource = useThumbnail(data?.id, data?.thumbnail?.url);
  
  const isCurrentSong = currentSong?.id === data?.id;
  const title = data?.title || t('song.untitled');
  const artist = data?.channel?.name || t('song.unknownArtist');

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
        <View style={styles.imageWrapper}>
          <Image
            source={thumbnailSource}
            style={[styles.image, isCurrentSong && { opacity: 0.6 }]}
          />
          {/* {isCurrentSong && (
            <View style={styles.playingOverlay}>
              {isLoading ? (
                <LoadingSpinner size={20} color="#2c5af3" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={20} 
                  color="#2c5af3" 
                />
              )}
            </View>
          )} */}
        </View>
        <View style={styles.infoContainer}>
          <Text 
            style={[styles.title, isCurrentSong && { color: "#2c5af3" }]} 
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.metadataContainer}>
            <View style={styles.videoBadge}>
              <Foundation 
                name="play-video" 
                size={16} 
                color={isCurrentSong ? "#2c5af3" : "#b3b3b3"} 
              />
            </View>
            <Text 
              style={[styles.artist, isCurrentSong && { color: "rgba(44, 90, 243, 0.7)" }]} 
              numberOfLines={1}
            >
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
  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
