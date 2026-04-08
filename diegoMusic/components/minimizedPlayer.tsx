import { View, StyleSheet, Image, Text, Platform, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "@/context/PlayerContext";
import { LoadingSpinner } from "./LoadingSpinner";

interface MinimizedPlayerProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const MinimizedPlayer = ({ onPress, style }: MinimizedPlayerProps) => {

  const { currentSong, isPlaying, togglePlayPause, progress, duration, isLoading } = usePlayer();
  if (!currentSong) return null;
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={onPress} 
      style={[styles.container, style]}
    >
      <Image
        source={{ uri: currentSong.thumbnail.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg" }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.channel.name}</Text>
      </View>

      <TouchableOpacity 
        style={styles.controls} 
        onPress={(e) => {
          e.stopPropagation();
          if (!isLoading) togglePlayPause();
        }}
      >
        {isLoading ? (
          <View style={{ marginRight: 10 }}>
            <LoadingSpinner size={30} />
          </View>
        ) : (
          <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={40} color="#fff" />
        )}
      </TouchableOpacity>
      <View style={styles.progressContainer}>
        <View style={[styles.bgBar, { width: '100%' }]} />
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414ff',
        padding: 8,
        borderRadius: 8,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 65 : 75,
        zIndex: 1000,
        width: '100%',
    },
    cover: {
        width: 48,
        height: 48,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
    artist: {
        fontSize: 12,
        color: "#b3b3b3",
    },
    controls: {
        paddingHorizontal: 8,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    bgBar: {
        height: '100%',
        backgroundColor: '#8a8a8aff',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        zIndex: 1000,
        backgroundColor: '#fff',
    }
    
});
