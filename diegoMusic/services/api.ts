import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
const API_TIMEOUT_MS = 8000;

const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  }
  catch {
    return null;
  }
};

const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error((data as any).error || `HTTP ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export default apiFetch;
