import express from 'express';
import { getFavoriteSongs, addFavoriteSong, removeFavoriteSong } from '../controllers/favoriteSongsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/favorites', requireAuth, getFavoriteSongs);
router.post('/favorites', requireAuth, addFavoriteSong);
router.delete('/favorites/:youtubeId', requireAuth, removeFavoriteSong);

export default router;
