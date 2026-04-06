import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState } from 'react';
import { MinimizedPlayer } from '@/components/minimizedPlayer';
import { MaximazedPlayer } from '@/components/maximazedPlayer';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  const [isMaximized, setIsMaximized] = useState(false);

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
