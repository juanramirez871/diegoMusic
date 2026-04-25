import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS === 'android') return;
  await Notifications.requestPermissionsAsync();
}

export async function sendDownloadCompleteNotification(songTitle: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Descarga completada',
        body: `"${songTitle}" ya está disponible`,
        sound: false,
      },
      trigger: null,
    });
  }
  catch {}
}
