import { Settings } from '../models/index.js';

export async function getSettings(req, res) {
  const userId = req.user.id;
  try {
    const settings = await Settings.findOne({ where: { userId } });
    res.json({
      settings: settings
        ? { language: settings.language, videoQuality: settings.videoQuality }
        : null,
    });
  }
  catch (err) {
    console.error('[Settings] Get error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req, res) {
  const userId = req.user.id;
  const { language, videoQuality } = req.body;
  try {
    const [settings] = await Settings.findOrCreate({
      where: { userId },
      defaults: { language: language ?? 'es', videoQuality: videoQuality ?? 'low' },
    });

    const updates = {};
    if (language !== undefined) updates.language = language;
    if (videoQuality !== undefined) updates.videoQuality = videoQuality;
    if (Object.keys(updates).length > 0) await settings.update(updates);

    res.json({
      settings: { language: settings.language, videoQuality: settings.videoQuality },
    });
  }
  catch (err) {
    console.error('[Settings] Update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
