import * as youtubeService from '../services/youtubeService.js';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const searchVideo = async (req, res) => {
  try {
    const videos = await youtubeService.searchVideo(req.query.search, req.query.limit);
    res.status(200).json(videos);
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchChannelVideos = async (req, res) => {
  try {
    const videos = await youtubeService.searchChannelVideos(req.query.channelId);
    res.status(200).json(videos);
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const downloadAudio = async (req, res) => {
  try {
    const { url, bitrate = '192', start = '0' } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const startSeconds = parseInt(start, 10) || 0;
    const stream = await youtubeService.downloadAudio(url, startSeconds);
    const nodeStream = Readable.from(stream);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    ffmpeg(nodeStream)
      .seekInput(startSeconds)
      .outputOptions(['-vn'])
      .audioBitrate(bitrate)
      .toFormat('mp3')
      .on('error', (err) => {
        if (err.message.includes('Output stream closed') || err.message.includes('EPIPE')) {
          return;
        }
        console.error('FFmpeg error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'FFmpeg conversion failed' });
        }
      })
      .pipe(res, { end: true });

  }
  catch (error) {
    console.error('Error in downloadAudio controller:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};



export {
  searchVideo,
  searchChannelVideos,
  downloadAudio
};
