import express from 'express';
import * as youtubeController from '../controllers/youtubeController.js';

const router = express.Router();

router.get('/search/video', youtubeController.searchVideo);
router.get('/search/channel/videos', youtubeController.searchChannelVideos);
router.get('/audio/download', youtubeController.downloadAudio);
router.get('/video/stream', youtubeController.streamVideo);

export default router;
