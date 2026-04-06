import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isMaximized, setIsMaximized } = usePlayer();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {!isMaximized && <MinimizedPlayer onPress={() => setIsMaximized(true)} />}
      <MaximazedPlayer visible={isMaximized} onClose={() => setIsMaximized(false)} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PlayerProvider>
      <RootLayoutContent />
    </PlayerProvider>
  );
}
