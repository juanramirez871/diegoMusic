import express from 'express';
import * as youtubeController from '../controllers/youtubeController.js';

const router = express.Router();

router.get('/search/video', youtubeController.searchVideo);
router.get('/search/channel/videos', youtubeController.searchChannelVideos);

export default router;
