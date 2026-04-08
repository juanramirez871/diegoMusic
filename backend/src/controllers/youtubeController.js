import * as youtubeService from '../services/youtubeService.js';


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


export {
  searchVideo,
  searchChannelVideos
};
