import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { SongOptionsModalProps } from "@/interfaces/Song";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function SongOptionsModal({
  visible,
  onClose,
  song,
}: SongOptionsModalProps) {

  const { toggleFavorite, isFavorite, toggleFavoriteArtist, isFavoriteArtist } = usePlayer();
  const { t } = useLanguage();
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(SCREEN_HEIGHT * 0.4);
  const startOpenAnimation = () => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
    contentTranslateY.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleClose = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    contentTranslateY.value = withTiming(
      SCREEN_HEIGHT * 0.4,
      { duration: 200 },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  };

  const handleToggleFavorite = () => {
    if (song) {
      toggleFavorite(song);
    }
  };

  const handleToggleArtistFavorite = () => {
    if (song?.channel?.id && song?.channel?.name) {
      toggleFavoriteArtist({
        id: song.channel.id,
        name: song.channel.name,
        avatar: song.channel?.avatar ?? (song.channel?.icon ?? "")
      });
    }
  };

  const handleOpenOriginalVideo = () => {
    if (song?.url) {
      Linking.openURL(song.url).catch((err) =>
        console.error("Error opening URL:", err)
      );
    }
  };

  const favoriteStatus = song ? isFavorite(song.id) : false;
  const artistFavoriteStatus = song?.channel?.id ? isFavoriteArtist(song.channel.id) : false;

  useEffect(() => {
    if (!visible) {
      overlayOpacity.value = 0;
      contentTranslateY.value = SCREEN_HEIGHT * 0.4;
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={startOpenAnimation}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
              {song?.title || t('songOptions.untitled')}
              </Text>
            </View>

          <View style={styles.optionsList}>
            <TouchableOpacity 
              style={styles.option} 
              onPress={() => {
                handleToggleFavorite();
                handleClose();
              }}
            >
              <Ionicons 
                name={favoriteStatus ? "heart" : "heart-outline"} 
                size={24} 
                color={favoriteStatus ? "#2c5af3ff" : "#fff"} 
              />
              <Text style={styles.optionText}>
                {favoriteStatus ? t('songOptions.removeFromFavorites') : t('songOptions.addToFavorites')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.option} 
              onPress={() => {
                handleToggleArtistFavorite();
                handleClose();
              }}
            >
              <Ionicons 
                name={artistFavoriteStatus ? "person" : "person-add-outline"} 
                size={24} 
                color={artistFavoriteStatus ? "#2c5af3ff" : "#fff"} 
              />
              <Text style={styles.optionText}>
                {artistFavoriteStatus ? t('songOptions.removeArtistFromFavorites') : t('songOptions.addArtistToFavorites')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.option} 
              onPress={() => {
                handleOpenOriginalVideo();
                handleClose();
              }}
            >
              <Ionicons name="videocam-outline" size={24} color="#fff" />
              <Text style={styles.optionText}>{t('songOptions.openOriginalVideo')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#282828",
    height: SCREEN_HEIGHT * 0.4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#444",
    paddingBottom: 15,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  optionsList: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 15,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});
