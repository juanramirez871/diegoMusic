import * as youtubeService from '../services/youtubeService.js';


const searchVideo = async (req, res) => {
  try {
    const videos = await youtubeService.searchVideo(req.query.search);
    res.status(200).json(videos);
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export {
  searchVideo
};
