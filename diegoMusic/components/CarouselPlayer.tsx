import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { youtubeService } from "@/services/api";
import { SongData } from "./Song";
import { usePlayer } from "@/context/PlayerContext";
import { Skeleton } from "./Skeleton";

interface CarouselPlayerProps {
  channelId?: string;
  query?: string;
  data?: SongData[];
}

export default function CarouselPlayer({ channelId, query, data }: CarouselPlayerProps) {

  const [songs, setSongs] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (data) {
      setSongs(data);
      setLoading(false);
      return;
    }

    const fetchSongs = async () => {
      setLoading(true);
      try {
        let fetchedData: SongData[] = [];
        if (channelId) fetchedData = await youtubeService.getChannelVideos(channelId);
        else if (query) fetchedData = await youtubeService.searchVideos(query, 10);

        setSongs(fetchedData);
      }
      catch (error) {
        console.error("Error fetching carousel songs:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [channelId, query, data]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.songItem}>
              <Skeleton width={140} height={140} borderRadius={8} />
              <View style={styles.infoContainer}>
                <Skeleton width={100} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width={80} height={12} borderRadius={4} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {songs.map((item, index) => {
          const thumbnailSource = item.thumbnail?.url ? { uri: item.thumbnail.url } : require("@/assets/images/cover.jpg");
          return (
            <TouchableOpacity 
              key={item.id + index} 
              style={styles.songItem}
              onPress={() => playSong(item, songs)}
              activeOpacity={0.8}
            >
              <Image
                source={thumbnailSource}
                style={styles.image}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.titleSong} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subtitleSong} numberOfLines={1}>
                  {item.channel.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
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
