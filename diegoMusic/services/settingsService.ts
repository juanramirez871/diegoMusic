import apiFetch from './api';

export interface UserSettings {
  language?: string | null;
  videoQuality?: string | null;
}

export const settingsService = {
  async fetch(): Promise<UserSettings | null> {
    try {
      const data = await apiFetch<{ settings: UserSettings | null }>('/settings');
      return data.settings ?? null;
    }
    catch {
      return null;
    }
  },

  async update(data: UserSettings): Promise<void> {
    try {
      await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    catch (err) {
      console.warn('[Settings] Failed to save to DB:', err);
    }
  },
};
