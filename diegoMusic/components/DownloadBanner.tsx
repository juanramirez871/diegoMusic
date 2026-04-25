import { usePlayer } from '@/context/PlayerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

export function DownloadBanner() {
  
  const { showDownloadBanner } = usePlayer();
  const { t } = useLanguage();
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showDownloadBanner) {
      opacity.value = withTiming(1, { duration: 200 });
    }
    else {
      opacity.value = withDelay(0, withTiming(0, { duration: 300 }));
    }
  }, [showDownloadBanner]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.banner, animStyle]} pointerEvents="none">
      <Text style={styles.bannerText}>{t('download.songDownloaded')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#138e3eff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
