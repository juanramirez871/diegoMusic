import React, { useEffect, useRef } from "react";
import { Animated, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from '@/components/IconSymbol';
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { SongOptionsModalProps } from "@/interfaces/Song";

const SHEET_HEIGHT = 320;

export default function SongOptionsModal({ visible, onClose, song }: SongOptionsModalProps) {
  const { toggleFavorite, isFavorite, toggleFavoriteArtist, isFavoriteArtist } = usePlayer();
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

  return (
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'fixed' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    height: SHEET_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
    paddingBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
});
