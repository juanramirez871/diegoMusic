import * as youtubeService from '../services/youtubeService.js';
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
    const { url, start = 0 } = req.query;
    const nodeStream = await youtubeService.downloadAudio(url, Number(start));

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    ffmpeg(nodeStream)
      .audioBitrate(128)
      .format("mp3")
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        if (!res.headersSent) res.status(500).json({ error: err.message });
      })
      .pipe(res, { end: true });

  }
  catch (error) {
    console.error("Error in downloadAudio controller:", error);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};



export {
  searchVideo,
  searchChannelVideos,
  downloadAudio
};
