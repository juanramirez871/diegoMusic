import YouTube from "youtube-sr";
import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";

const searchVideo = async (search, limit) => {

  const videos = await YouTube.default.search(search, {
    limit: Number(limit),
    safeSearch: true,
  });
  
  return videos;
};

const searchChannelVideos = async (channelId) => {
  const videos = await ytch.getChannelVideos({
    channelId: channelId,
    sortBy: 'popular',
  });

  return videos.items;
};

const downloadAudio = async (url) => {
  try {
    const youtube = await Innertube.create({
      client_type: "ANDROID",
      generate_session_locally: true
    });

    let videoId = url;
    if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];

    const stream = await youtube.download(videoId, {
      quality: "best",
      type: "video+audio"
    });

    return stream;
  }
  catch (error) {
    console.error("Error in youtubeService.downloadAudio:", error);
    throw error;
  }
};



export {
  searchVideo,
  searchChannelVideos,
  downloadAudio
};
