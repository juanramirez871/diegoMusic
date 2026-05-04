import express from 'express';
import { getFavoriteArtists, addFavoriteArtist, removeFavoriteArtist } from '../controllers/favoriteArtistsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/favorites', requireAuth, getFavoriteArtists);
router.post('/favorites', requireAuth, addFavoriteArtist);
router.delete('/favorites/:channelId', requireAuth, removeFavoriteArtist);

export default router;
