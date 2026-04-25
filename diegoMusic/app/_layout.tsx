import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NetworkProvider } from '@/context/NetworkContext';
import { DownloadBanner } from '@/components/DownloadBanner';
import { requestNotificationPermission } from '@/services/notifications';
import { LanguageProvider } from '@/context/LanguageContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isMaximized, setIsMaximized } = usePlayer();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {!isMaximized && <MinimizedPlayer onPress={() => setIsMaximized(true)} />}
        <MaximazedPlayer visible={isMaximized} onClose={() => setIsMaximized(false)} />
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
        <PlayerProvider>
          <RootLayoutContent />
          <DownloadBanner />
        </PlayerProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
