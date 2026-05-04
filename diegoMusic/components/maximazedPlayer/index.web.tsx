import { usePlayer } from '@/context/PlayerContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { VideoView } from 'expo-video';
import QueueModal from "@/components/QueueModal";
import SleepTimerModal from "@/components/SleepTimerModal";
import SongOptionsModal from "@/components/SongOptionsModal";
import { useLyrics } from '@/hooks/useLyrics';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';
import { useNetwork } from '@/context/NetworkContext';
import { useLanguage } from '@/context/LanguageContext';
import { useThumbnail } from '@/hooks/useThumbnail';
import { MaximazedPlayerProps } from '@/interfaces/player';
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MarqueeText } from "@/components/MarqueeText";

export const MaximazedPlayer = ({ visible, onClose }: MaximazedPlayerProps) => {

  const { isOnline } = useNetwork();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isSleepTimerVisible, setIsSleepTimerVisible] = useState(false);

  useEffect(() => {
    setIsOptionsVisible(false);
    setIsQueueVisible(false);
    setIsSleepTimerVisible(false);
  }, [pathname]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const [showLyricsEdit, setShowLyricsEdit] = useState(false);
  const [lyricsSearchQuery, setLyricsSearchQuery] = useState('');
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const videoViewRef = useRef<VideoView>(null);

  const {
    currentSong,
    toggleFavorite,
    isFavorite,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isPlaying,
    isIntendingToPlay,
    togglePlayPause,
    pause,
    progress,
    duration,
    seekTo,
    isLoading,
    sleepTimer,
    videoQuality,
    openArtistOverlay,
  } = usePlayer();

  const video = useVideoPlayback({
    currentSong,
    isOnline,
    videoOfflineTitle: t('player.videoOfflineTitle'),
    videoOfflineMessage: t('player.videoOfflineMessage'),
    videoQuality,
    audio: { isPlaying, progress, pause, seekTo, togglePlayPause, playNext },
  });

  const activeProgress = video.showVideo ? (video.isVideoReady ? video.videoProgress : progress) : progress;
  const activeDuration = video.showVideo ? (video.isVideoReady && video.videoDuration > 0 ? video.videoDuration : duration) : duration;

  const lyrics = useLyrics(currentSong, isOnline);
  const lyricsDefaultQuery = lyrics.lyricsQuery;
  const thumbnailSource = useThumbnail(currentSong?.id, currentSong?.thumbnail?.url);
  const [thumbError, setThumbError] = useState(false);

  const hiResThumbnailSource = (() => {
    const src = thumbnailSource as any;
    if (!src?.uri) return thumbnailSource;
    const hiResUri = src.uri.replace(/\/[^/]+\.jpg(\?.*)?$/, '/maxresdefault.jpg');
    return hiResUri !== src.uri ? { uri: hiResUri } : thumbnailSource;
  })();
  const lyricsScrollRef = useRef<ScrollView>(null);
  const playTint = useSharedValue(0);

  useEffect(() => {
    playTint.value = withTiming(!video.showVideo && isLoading ? 1 : 0, { duration: 200 });
  }, [isLoading, video.showVideo]);

  useEffect(() => {
    if (video.showVideo) {
      video.player.play();
    }
  }, [video.showVideo]);

  useEffect(() => {
    setSeekProgress(0);
    setIsSeeking(false);
    setShowLyricsEdit(false);
    setThumbError(false);
  }, [currentSong?.id]);

  useEffect(() => {
    setLyricsSearchQuery(lyricsDefaultQuery ?? '');
  }, [lyricsDefaultQuery]);

  useEffect(() => {
    if (lyrics.loading) setShowLyricsEdit(false);
  }, [lyrics.loading]);

  useEffect(() => {
    if (lyrics.syncedLyrics || lyrics.plainLyrics) setShowLyricsEdit(false);
  }, [lyrics.syncedLyrics, lyrics.plainLyrics]);

  useEffect(() => {
    if (!isLoading && !isSeeking) setSeekProgress(progress);
  }, [isLoading, isSeeking, progress]);

  const currentLineIndex = lyrics.getCurrentLineIndex(isSeeking ? seekProgress : progress);
  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsScrollRef.current) {
      lyricsScrollRef.current.scrollTo({ y: currentLineIndex * 48, animated: true });
    }
  }, [currentLineIndex]);

  const playIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - playTint.value * 0.6,
  }));

  const handleSeek = (pct: number) => {
    if (!isFinite(pct) || activeDuration <= 0) return;
    const pos = pct * activeDuration;
    if (!isFinite(pos)) return;
    video.seek(pos);
    setSeekProgress(pos);
    setIsSeeking(true);
    setTimeout(() => setIsSeeking(false), 1500);
  };

  const formatTime = (millis: number) => {
    if (!millis || isNaN(millis)) return '0:00';
    const s = Math.floor(millis / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!visible || !currentSong) return null;

  const displayProgress = isSeeking ? seekProgress : activeProgress;
  const progressPct = activeDuration > 0 ? Math.min(Math.max(displayProgress / activeDuration, 0), 1) : 0;
  const isFav = isFavorite(currentSong.id);
  const isRepeating = repeatMode !== 'off';

  return (
    <>
      <LinearGradient colors={['#1a3a9e', '#0d0d0d', '#080808']} style={styles.dialog}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => { video.closeIfOpen(); onClose(); }} style={styles.headerBtn}>
              <IconSymbol name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('player.nowPlaying')}</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setIsOptionsVisible(true)}>
              <IconSymbol name="ellipsis-horizontal" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.left}>
              <View style={styles.cover}>
                {video.showVideo ? (
                  <>
                    {video.isVideoLoading && (
                      <View style={styles.videoLoading}><LoadingSpinner /></View>
                    )}
                    <VideoView
                      ref={videoViewRef}
                      player={video.player}
                      style={{ width: '100%', height: '100%' } as any}
                      contentFit="cover"
                      nativeControls={false}
                      allowsFullscreen
                      onFullscreenEnter={() => setIsVideoFullscreen(true)}
                      onFullscreenExit={() => setIsVideoFullscreen(false)}
                    />
                    <TouchableOpacity
                      style={styles.fullscreenBtn}
                      onPress={() => {
                        if (isVideoFullscreen) {
                          videoViewRef.current?.exitFullscreen();
                        } else {
                          videoViewRef.current?.enterFullscreen();
                        }
                      }}
                    >
                      <IconSymbol
                        name={isVideoFullscreen ? 'xmark' : 'expand-outline'}
                        size={16}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Image
                    source={thumbError ? thumbnailSource : hiResThumbnailSource}
                    style={styles.coverImage}
                    onError={() => setThumbError(true)}
                  />
                )}
              </View>

              <View style={styles.songInfo}>
                <View style={styles.songInfoText}>
                  <MarqueeText key={`t-${currentSong.id}`} text={currentSong.title} style={styles.title} />
                  <TouchableOpacity onPress={() => currentSong.channel.id && openArtistOverlay({ id: currentSong.channel.id, name: currentSong.channel.name })}>
                    <MarqueeText key={`a-${currentSong.id}`} text={currentSong.channel.name} style={styles.artist} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(currentSong)}>
                  <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={24} color={isFav ? '#2c5af3' : '#fff'} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <TouchableOpacity
                  style={styles.progressTrack}
                  activeOpacity={1}
                  onPress={(e: any) => {
                    const rect = (e.currentTarget as any).getBoundingClientRect?.();
                    if (rect && rect.width > 0) {
                      handleSeek((e.nativeEvent.clientX - rect.left) / rect.width);
                    }
                  }}
                >
                  <View style={styles.progressBg} />
                  <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any }]} />
                  <View style={[styles.progressDot, { left: `${progressPct * 100}%` as any }]} />
                </TouchableOpacity>
                <View style={styles.timeRow}>
                  <Text style={styles.time}>{formatTime(displayProgress)}</Text>
                  <Text style={styles.time}>{formatTime(activeDuration)}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={toggleShuffle}>
                  <IconSymbol name="shuffle" size={24} color={isShuffle ? '#2c5af3' : '#fff'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={playPrevious}>
                  <IconSymbol name="play-skip-back" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={() => { if (!isLoading) togglePlayPause(); }}>
                  <Animated.View style={playIconAnimatedStyle}>
                    <IconSymbol
                      name={isIntendingToPlay ? 'pause' : 'play'}
                      size={32}
                      color="#000"
                    />
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext}>
                  <IconSymbol name="play-skip-forward" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleRepeat}>
                  <IconSymbol name="repeat" size={24} color={isRepeating ? '#2c5af3' : '#fff'} />
                </TouchableOpacity>
              </View>

              {/* Footer actions */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={() => setIsSleepTimerVisible(true)}>
                  <IconSymbol name={sleepTimer ? 'timer' : 'timer-outline'} size={20} color={sleepTimer ? '#2c5af3' : '#b3b3b3'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={video.toggle}>
                  <IconSymbol name="play-video" size={20} color={video.showVideo ? '#2c5af3' : '#b3b3b3'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsQueueVisible(true)}>
                  <IconSymbol name="list" size={20} color="#b3b3b3" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Right: lyrics */}
            <View style={styles.right}>
              <View style={styles.lyricsTitleRow}>
                <Text style={styles.lyricsTitle}>{t('lyrics.title')}</Text>
                <TouchableOpacity
                  onPress={() => setShowLyricsEdit(s => !s)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconSymbol name="pencil-outline" size={16} color={showLyricsEdit ? '#fff' : '#b3b3b3'} />
                </TouchableOpacity>
              </View>

              {(showLyricsEdit || (!lyrics.loading && isOnline && lyrics.notFound)) && lyrics.manualSearch && (
                <View style={styles.lyricsSearchRow}>
                  <TextInput
                    style={styles.lyricsSearchInput}
                    value={lyricsSearchQuery}
                    onChangeText={setLyricsSearchQuery}
                    placeholder={t('lyrics.searchPlaceholder')}
                    placeholderTextColor="#555"
                    onSubmitEditing={() => lyricsSearchQuery.trim() && lyrics.manualSearch!(lyricsSearchQuery.trim())}
                    returnKeyType="search"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    onPress={() => lyricsSearchQuery.trim() && lyrics.manualSearch!(lyricsSearchQuery.trim())}
                    style={styles.lyricsSearchBtn}
                  >
                    <IconSymbol name="search" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {lyrics.loading && (
                <View style={styles.lyricsCenter}>
                  <LoadingSpinner />
                </View>
              )}
              {!lyrics.loading && !isOnline && (
                <View style={styles.lyricsCenter}>
                  <Text style={styles.lyricsEmpty}>{t('lyrics.offline')}</Text>
                </View>
              )}
              {!lyrics.loading && isOnline && lyrics.notFound && (
                <View style={styles.lyricsCenter}>
                  <Text style={styles.lyricsEmpty}>{t('lyrics.notFound')}</Text>
                </View>
              )}
              {!lyrics.loading && lyrics.syncedLyrics && lyrics.syncedLyrics.length > 0 && (
                <ScrollView ref={lyricsScrollRef} style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
                  {lyrics.syncedLyrics.map((line, i) => {
                    const isActive = i === currentLineIndex;
                    return (
                      <TouchableOpacity key={i} onPress={() => handleSeek(line.time / duration)} activeOpacity={0.7}>
                        <Text style={[styles.lyricLine, isActive && styles.lyricLineActive]}>
                          {line.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
              {!lyrics.loading && lyrics.plainLyrics && !lyrics.syncedLyrics && (
                <ScrollView style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.lyricPlain}>{lyrics.plainLyrics}</Text>
                </ScrollView>
              )}
            </View>
          </View>
        </LinearGradient>

      <SongOptionsModal visible={isOptionsVisible} onClose={() => setIsOptionsVisible(false)} song={currentSong} />
      <QueueModal visible={isQueueVisible} onClose={() => setIsQueueVisible(false)} />
      <SleepTimerModal visible={isSleepTimerVisible} onClose={() => setIsSleepTimerVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  dialog: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },

  body: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 32,
  },

  /* Left column */
  left: {
    flex: 3,
    justifyContent: 'flex-start',
    paddingTop: 8,
    gap: 12,
    alignSelf: 'center',
  },
  cover: {
    width: '100%' as any,
    aspectRatio: 16 / 9,
    maxHeight: 340,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%' as any,
    height: '100%' as any,
    resizeMode: 'cover',
  },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songInfoText: { flex: 1, overflow: 'hidden' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  artist: { color: '#b3b3b3', fontSize: 14, marginTop: 2 },

  progressSection: { gap: 6 },
  progressTrack: {
    height: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: -4,
    top: '50%',
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: '#b3b3b3', fontSize: 11 },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },

  /* Right column: lyrics */
  right: {
    flex: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    overflow: 'hidden',
  },
  lyricsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lyricsTitle: {
    color: '#b3b3b3',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lyricsSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 36,
  },
  lyricsSearchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    height: 36,
    // @ts-ignore web-only
    outlineStyle: 'solid',
    // @ts-ignore web-only
    outlineWidth: 0,
  },
  lyricsSearchBtn: {
    padding: 4,
  },
  lyricsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lyricsEmpty: { color: '#b3b3b3', fontSize: 14 },
  lyricsScroll: { flex: 1 },
  lyricLine: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 48,
  },
  lyricLineActive: {
    color: '#fff',
    fontSize: 20,
  },
  lyricPlain: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    lineHeight: 28,
  },
});
