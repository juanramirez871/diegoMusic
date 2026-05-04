import express from 'express';
import statusRoutes from './statusRoutes.js';
import youtubeRoutes from './youtubeRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/status', statusRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/auth', authRoutes);

export default router;
