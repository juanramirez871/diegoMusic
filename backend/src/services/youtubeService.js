import YouTube from "youtube-sr";
import ytch from "yt-channel-info";

const searchVideo = async (search) => {

  console.log(YouTube.default.search)
  const videos = await YouTube.default.search(search, {
    limit: 21,
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



export {
  searchVideo,
  searchChannelVideos
};
