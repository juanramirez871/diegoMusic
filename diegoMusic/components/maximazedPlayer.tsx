import { View, StyleSheet, Text, Image, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import SongOptionsModal from './SongOptionsModal';
import { usePlayer } from '@/context/PlayerContext';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MaximazedPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export const MaximazedPlayer = ({ visible, onClose }: MaximazedPlayerProps) => {

  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const { currentSong, toggleFavorite, isFavorite, playNext, playPrevious } = usePlayer();
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -100) runOnJS(playNext)();
      else if (event.translationX > 100) runOnJS(playPrevious)();
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!currentSong) return null;
  const favoriteStatus = isFavorite(currentSong.id);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#2c5af3ff', '#141414', '#101010ff']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>REPRODUCIENDO</Text>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsOptionsVisible(true)}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.imageContainer, animatedStyle]}>
                <Image
                  source={{ uri: currentSong.thumbnail.url || "https://cdn.rafled.com/anime-icons/images/0c4ea0cc5346ae427bd7ce86928f0faefa0f07c373a110bb080c0a81ce8efa1a.jpg" }}
                  style={styles.cover}
                />
              </Animated.View>
            </GestureDetector>

            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <View style={styles.textWrapper}>
                  <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                  <Text style={styles.artist} numberOfLines={1}>{currentSong.channel.name}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
                  <Ionicons 
                    name={favoriteStatus ? "heart" : "heart-outline"} 
                    size={28} 
                    color={favoriteStatus ? "#2c5af3ff" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressContainer}>
                <View style={styles.bgBar} />
                <View style={[styles.progressBar, { width: '0%' }]} />
                <View style={[styles.progressDot, { left: '0%' }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>00:00</Text>
                <Text style={styles.timeText}>{currentSong.duration_formatted || "00:00"}</Text>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity>
                <Ionicons name="shuffle" size={28} color="#2c5af3ff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={playPrevious}>
                <Ionicons name="play-skip-back" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="pause-circle" size={80} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={playNext}>
                <Ionicons name="play-skip-forward" size={36} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons name="timer-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity>
                <Ionicons name="share-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity>
                <Ionicons name="list" size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      <SongOptionsModal 
        visible={isOptionsVisible} 
        onClose={() => setIsOptionsVisible(false)}
        song={currentSong}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  imageContainer: {
    width: width - 48,
    height: width - 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  infoContainer: {
    marginTop: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    marginRight: 16,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 18,
    marginTop: 4,
  },
  scrollingTextContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollingTextWrapper: {
    flexDirection: 'row',
  },
  progressSection: {
    marginTop: 30,
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  bgBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    paddingHorizontal: 10,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
});
