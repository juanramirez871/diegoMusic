const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export interface UserSettings {
  language?: string | null;
  videoQuality?: string | null;
}

export const settingsService = {
  async fetch(userId: string): Promise<UserSettings | null> {
    try {
      const res = await fetch(`${BASE_URL}/settings/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.settings ?? null;
    } catch {
      return null;
    }
  },

  async update(userId: string, data: UserSettings): Promise<void> {
    try {
      await fetch(`${BASE_URL}/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('[Settings] Failed to save to DB:', err);
    }
  },
};
