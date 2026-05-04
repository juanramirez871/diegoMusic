import apiFetch from './api';

export interface UserSettings {
  language?: string | null;
  videoQuality?: string | null;
}

export const settingsService = {
  async fetch(userId: string): Promise<UserSettings | null> {
    try {
      const data = await apiFetch<{ settings: UserSettings | null }>(`/settings/${userId}`);
      return data.settings ?? null;
    } catch {
      return null;
    }
  },

  async update(userId: string, data: UserSettings): Promise<void> {
    try {
      await apiFetch(`/settings/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('[Settings] Failed to save to DB:', err);
    }
  },
};
