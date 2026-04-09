import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";
import { spawn } from "child_process";


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


const downloadAudio = (url, startSeconds = 0) => {

  const videoId = extractVideoId(url);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const args = [
    videoUrl,
    "-f", "bestaudio",
    "-o", "-",
    "--no-playlist",
    ...(startSeconds > 0 ? ["--download-sections", `*${startSeconds}-inf`] : []),
  ];

  const process = spawn("yt-dlp", args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  process.stderr.on("data", (data) => {
    console.log("[yt-dlp]", data.toString().trim());
  });

  process.on("error", (err) => {
    console.error("[yt-dlp] spawn error:", err.message);
  });

  return process.stdout;
};

const extractVideoId = (url) => {
  if (url.includes("v="))        return url.split("v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  return url;
};


export { searchVideo, searchChannelVideos, downloadAudio };
