import '@/utils/webPolyfills';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NetworkProvider } from '@/context/NetworkContext';
import { DownloadBanner } from '@/components/DownloadBanner';
import { requestNotificationPermission } from '@/services/notifications';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/components/LoginScreen';
import { settingsService } from '@/services/settingsService';
import type { Locale } from '@/interfaces/language';
import type { VideoQuality } from '@/context/player/types';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isLoggedIn, loading, user } = useAuth();
  const { isMaximized, setIsMaximized, setVideoQuality } = usePlayer();
  const { setLocale } = useLanguage();
  const settingsApplied = useRef(false);

  useEffect(() => {
    if (!user) { settingsApplied.current = false; return; }
    if (settingsApplied.current) return;
    settingsApplied.current = true;
    settingsService.fetch(String(user.id)).then((settings) => {
      if (settings?.language && ['en', 'es', 'ja'].includes(settings.language)) {
        setLocale(settings.language as Locale);
      }
      if (settings?.videoQuality && ['low', 'medium', 'high'].includes(settings.videoQuality)) {
        setVideoQuality(settings.videoQuality as VideoQuality);
      }
    });
  }, [user?.id]);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#252424' }} />
      </GestureHandlerRootView>
    );
  }

  if (!isLoggedIn) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#252424' }}>
        <StatusBar style="light" />
        <LoginScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {!isMaximized && Platform.OS !== 'web' && <MinimizedPlayer onPress={() => setIsMaximized(true)} />}
        {Platform.OS !== 'web' && <MaximazedPlayer visible={isMaximized} onClose={() => setIsMaximized(false)} />}
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <PlayerProvider>
            <RootLayoutContent />
            <DownloadBanner />
          </PlayerProvider>
        </AuthProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
