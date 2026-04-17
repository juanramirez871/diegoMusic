import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, Animated, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { GenreOverlay } from '@/components/GenreOverlay';
import { usePlayer } from '@/context/PlayerContext';

export default function TabLayout() {

  const { pendingArtistOverlay, closeArtistOverlay } = usePlayer();
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
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingTop: 5,
          elevation: 0,
          height: Platform.OS === 'ios' ? 65 : 55,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Favorite',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
      <GenreOverlay
        isVisible={!!pendingArtistOverlay}
        onClose={handleCloseArtist}
        genreTitle={pendingArtistOverlay?.name ?? ''}
        channelId={pendingArtistOverlay?.id}
        fadeAnim={artistFadeAnim}
        bottomOffset={Platform.OS === 'ios' ? 65 : 55}
      />
    </View>
  );
}

