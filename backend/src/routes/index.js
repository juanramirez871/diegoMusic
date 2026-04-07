import express from 'express';
import statusRoutes from './statusRoutes.js';
import youtubeRoutes from './youtubeRoutes.js';

const router = express.Router();

router.use('/status', statusRoutes);
router.use('/youtube', youtubeRoutes);

export default router;
