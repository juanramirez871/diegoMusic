import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Animated, Linking, Pressable, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from '@/components/IconSymbol';
import { useLibrary } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { SongOptionsModalProps } from "@/interfaces/Song";
import { styles, SHEET_HEIGHT } from "./styles.web";

export default function SongOptionsModal({ visible, onClose, song }: SongOptionsModalProps) {
  const { toggleFavorite, isFavorite, toggleFavoriteArtist, isFavoriteArtist } = useLibrary();
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!visible) return null;

  const favoriteStatus = song ? isFavorite(song.id) : false;
  const artistFavoriteStatus = song?.channel?.id ? isFavoriteArtist(song.channel.id) : false;

  return createPortal(
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{song?.title || t('songOptions.untitled')}</Text>
        </View>
        <View style={styles.optionsList}>
          <TouchableOpacity style={styles.option} onPress={() => { if (song) toggleFavorite(song); handleClose(); }}>
            <IconSymbol name={favoriteStatus ? "heart" : "heart-outline"} size={24} color={favoriteStatus ? "#2c5af3" : "#fff"} />
            <Text style={styles.optionText}>{favoriteStatus ? t('songOptions.removeFromFavorites') : t('songOptions.addToFavorites')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => {
            if (song?.channel?.id) toggleFavoriteArtist({ id: song.channel.id, name: song.channel.name, avatar: song.channel?.avatar ?? (song.channel?.icon ?? "") });
            handleClose();
          }}>
            <IconSymbol name={artistFavoriteStatus ? "person" : "person-add-outline"} size={24} color={artistFavoriteStatus ? "#2c5af3" : "#fff"} />
            <Text style={styles.optionText}>{artistFavoriteStatus ? t('songOptions.removeArtistFromFavorites') : t('songOptions.addArtistToFavorites')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => {
            if (song?.url) Linking.openURL(song.url).catch(console.error);
            handleClose();
          }}>
            <IconSymbol name="videocam-outline" size={24} color="#fff" />
            <Text style={styles.optionText}>{t('songOptions.openOriginalVideo')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>,
    document.body
  );
}
