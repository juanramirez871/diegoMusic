import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";

const searchVideo = async (search, limit) => {

  let innertube = null;
  const getInnertube = async () => {
    if (!innertube) innertube = await Innertube.create();
    return innertube;
  };

  const yt = await getInnertube();
  const results = await yt.search(search, { type: "video" });

  return results.videos
    .slice(0, Number(limit))
    .map((video) => ({
      id: video.id ?? "",
      title: video.title?.text ?? "",
      thumbnail: {
        url: video.best_thumbnail?.url ?? video.thumbnails?.[0]?.url ?? "",
      },
      channel: {
        name: video.author?.name ?? "Unknown",
        id:   video.author?.id ?? "",
        icon: video.author?.thumbnails?.[0]?.url ?? "",
      },
      duration_formatted: video.duration?.text ?? "00:00",
    }));
};


const searchChannelVideos = async (channelId) => {
  const videos = await ytch.getChannelVideos({
    channelId: channelId,
    sortBy: "popular",
  });

  return videos.items;
};


const downloadAudio = async (url, startSeconds = 0) => {
  try {
    const youtube = await Innertube.create({
      client_type: "IOS",
      generate_session_locally: true,
    });

    let videoId = url;
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/"))
      videoId = url.split("youtu.be/")[1].split("?")[0];

    const stream = await youtube.download(videoId, {
      quality: "best",
      type: "video+audio",
      start: startSeconds,
    });

    return stream;
  } catch (error) {
    console.error("Error in youtubeService.downloadAudio:", error);
    throw error;
  }
};

export { searchVideo, searchChannelVideos, downloadAudio };
