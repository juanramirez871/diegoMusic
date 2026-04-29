import * as youtubeService from "../services/youtubeService.js";
import { createReadStream, statSync } from "fs";

const searchVideo = async (req, res) => {
  try {
    const videos = await youtubeService.searchVideo(req.query.search, req.query.limit);
    res.status(200).json(videos);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const searchChannelVideos = async (req, res) => {
  try {
    const videos = await youtubeService.searchChannelVideos(req.query.channelId);
    res.status(200).json(videos);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const downloadAudio = async (req, res) => {
  try {

    const { url, start = 0 } = req.query;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const filePath = await youtubeService.downloadAudio(url, Number(start));
    const fileSize = statSync(filePath).size;
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const [startByte, endByte] = rangeHeader
        .replace("bytes=", "")
        .split("-")
        .map(Number);

      const start = startByte || 0;
      const end   = endByte   || fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Type":   "audio/mp4",
        "Accept-Ranges":  "bytes",
        "Content-Range":  `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunkSize,
      });

      createReadStream(filePath, { start, end }).pipe(res);

    }
    else {
      res.writeHead(200, {
        "Content-Type": "audio/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize,
      });

      createReadStream(filePath).pipe(res);
    }

  }
  catch (error) {
    console.error("Error in downloadAudio:", error);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

const streamVideo = async (req, res) => {
  try {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "url es requerido" });
    const rangeHeader = req.headers.range;
    const safeQuality = ['low', 'medium', 'high'].includes(quality) ? quality : 'low';

    const { directUrl, mimeType } = await youtubeService.getVideoDirectSource(url, safeQuality);
    if (mimeType === 'application/vnd.apple.mpegurl') {
      return res.redirect(302, directUrl);
    }
    await youtubeService.proxyVideoStream(res, directUrl, mimeType, rangeHeader);
  }
  catch (error) {
    console.error("Error in streamVideo:", error);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

const getAudioUrl = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const result = await youtubeService.getAudioDirectUrl(url);
    res.json(result);
  } catch (error) {
    console.error('Error in getAudioUrl:', error);
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

const prefetchAudio = (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });
  res.status(202).end();
  youtubeService.getAudioDirectUrl(url).catch((err) =>
    console.warn('[prefetch] Error warming audio cache:', err.message)
  );
};

export { searchVideo, searchChannelVideos, downloadAudio, streamVideo, getAudioUrl, prefetchAudio };
