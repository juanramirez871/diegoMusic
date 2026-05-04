import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GenreOverlay } from '@/components/GenreOverlay';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';
import { TopBar } from '@/components/TopBar';
import { usePlayer } from '@/context/PlayerContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/interfaces/language';

const SIDEBAR_WIDTH = 76;
const SHOW_LABELS = false;

const NAV_ITEMS = [
  { route: '/',          name: 'house.fill',     labelKey: 'tabs.home'     },
  { route: '/search',    name: 'magnifyingglass', labelKey: 'tabs.search'   },
  { route: '/favorite',  name: 'heart.fill',      labelKey: 'tabs.favorite' },
  { route: '/settings',  name: 'gearshape.fill',  labelKey: 'tabs.settings' },
] as const;

function NavItem({ item, isActive }: { item: typeof NAV_ITEMS[number]; isActive: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const highlighted = isActive || hovered;

  return (
    <Pressable
      onPress={() => router.push(item.route as any)}
      // @ts-ignore — web-only props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={[styles.navItem, highlighted && styles.navItemHighlighted]}
    >
      <IconSymbol
        name={item.name}
        size={24}
        color={highlighted ? '#fff' : '#b3b3b3'}
      />
      {SHOW_LABELS ? (
        <Text style={[styles.navLabel, highlighted && styles.navLabelHighlighted]}>
          {t(item.labelKey as TranslationKey)}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.navCard}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.route === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(item.route);
          return <NavItem key={item.route} item={item} isActive={isActive} />;
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { pendingArtistOverlay, closeArtistOverlay, isMaximized, setIsMaximized } = usePlayer();
  const artistFadeAnim = useRef(new Animated.Value(0)).current;
  const prevArtistRef = useRef<string | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && pendingArtistOverlay) {
      prevPathnameRef.current = pathname;
      Animated.timing(artistFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        prevArtistRef.current = null;
        closeArtistOverlay();
      });
    } else {
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  if (pendingArtistOverlay && prevArtistRef.current !== pendingArtistOverlay.id) {
    prevArtistRef.current = pendingArtistOverlay.id;
    artistFadeAnim.setValue(0);
    Animated.timing(artistFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }

  const handleCloseArtist = () => {
    Animated.timing(artistFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      prevArtistRef.current = null;
      closeArtistOverlay();
    });
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.body}>
        <Sidebar />
        <View style={styles.content}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}
          />
          <MaximazedPlayer visible={isMaximized} onClose={() => setIsMaximized(false)} />
        </View>
      </View>
      {!isMaximized && (
        <MinimizedPlayer
          onPress={() => setIsMaximized(true)}
          style={styles.minimizedPlayer}
        />
      )}
      <GenreOverlay
        isVisible={!!pendingArtistOverlay}
        onClose={handleCloseArtist}
        genreTitle={pendingArtistOverlay?.name ?? ''}
        channelId={pendingArtistOverlay?.id}
        fadeAnim={artistFadeAnim}
        bottomOffset={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 12,
    overflow: 'hidden',
  },
  minimizedPlayer: {
    zIndex: 200,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  navCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  navItemHighlighted: {
    backgroundColor: '#1a1a1a',
  },
  navLabel: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '700',
  },
  navLabelHighlighted: {
    color: '#fff',
  },
});
