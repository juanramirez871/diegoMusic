import { Platform } from 'react-native';

const WEB_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.diegomusic.com:47821/api';
const NATIVE_API_URL = process.env.EXPO_PUBLIC_API_URL_NATIVE || 'http://192.168.1.13:47823/api';

export const API_URL = Platform.OS === 'web' ? WEB_API_URL : NATIVE_API_URL;
