import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { usePlayer } from "@/context/PlayerContext";
import { FavoriteArtistsProps } from "@/interfaces/artists";
import { useLanguage } from "@/context/LanguageContext";
import { styles } from './styles';


export default function FavoriteArtists({ onArtistPress }: FavoriteArtistsProps) {

  const { favoriteArtists } = usePlayer();
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('favoriteArtists.title')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {favoriteArtists.map((artist) => (
          <TouchableOpacity 
            key={artist.id} 
            style={styles.artistItem}
            activeOpacity={0.7}
            onPress={() => onArtistPress?.(artist)}
          >
            <Image
              source={{
                uri: artist.avatar || "https://i.pinimg.com/736x/47/cb/be/47cbbee4df2bc1fccc63c3b0f9af46aa.jpg",
              }}
              style={styles.artistImage}
            />
            <Text style={styles.artistName} numberOfLines={1}>
              {artist.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {favoriteArtists.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('favoriteArtists.empty')}</Text>
          </View>
      )}
    </View>
  );
}
