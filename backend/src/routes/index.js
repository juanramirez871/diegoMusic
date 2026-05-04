import express from 'express';
import statusRoutes from './statusRoutes.js';
import youtubeRoutes from './youtubeRoutes.js';
import authRoutes from './authRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import artistsRoutes from './artistsRoutes.js';
import songsRoutes from './songsRoutes.js';

const router = express.Router();

router.use('/status', statusRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/artists', artistsRoutes);
router.use('/songs', songsRoutes);

export default router;
