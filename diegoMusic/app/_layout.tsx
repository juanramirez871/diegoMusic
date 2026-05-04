import '@/utils/webPolyfills';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NetworkProvider } from '@/context/NetworkContext';
import { DownloadBanner } from '@/components/DownloadBanner';
import { requestNotificationPermission } from '@/services/notifications';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/components/LoginScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isLoggedIn } = useAuth();
  const { isMaximized, setIsMaximized } = usePlayer();

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
