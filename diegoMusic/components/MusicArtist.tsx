import { View, Text, Image } from "react-native";
import CarouselPlayer from "./ListPlayer";
import { MusicArtistProps } from "@/interfaces/artists";
import { useLanguage } from "@/context/LanguageContext";
import { styles } from './styles/MusicArtist.styles';


export default function MusicArtist({ artist }: MusicArtistProps) {
  
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <View>
            <Image
                source={{
                    uri: artist.avatar || "https://i.pinimg.com/736x/47/cb/be/47cbbee4df2bc1fccc63c3b0f9af46aa.jpg",
                }}
                style={styles.image}
            />
        </View>
        <View>
            <Text style={styles.title}>{t('musicArtist.forFansOf')}</Text>
            <Text style={styles.author}>{artist.name}</Text>
        </View>
      </View>

      <View>
        <CarouselPlayer channelId={artist.id} />
      </View>
    </View>
  );
}
