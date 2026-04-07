import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage: Record<string, string> = {};
export const storage = {

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (!AsyncStorage) return memoryStorage[key] || null;
      return await AsyncStorage.getItem(key);
    }
    catch (error) {
      console.warn(`[Storage] getItem failed for key "${key}", using memory fallback.`, error);
      return memoryStorage[key] || null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (!AsyncStorage) {
        memoryStorage[key] = value;
        return;
      }
      await AsyncStorage.setItem(key, value);
    }
    catch (error) {
      console.warn(`[Storage] setItem failed for key "${key}", using memory fallback.`, error);
      memoryStorage[key] = value;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (!AsyncStorage) {
        delete memoryStorage[key];
        return;
      }
      await AsyncStorage.removeItem(key);
    }
    catch (error) {
      console.warn(`[Storage] removeItem failed for key "${key}".`, error);
      delete memoryStorage[key];
    }
  }
};

export default storage;
