import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import os from "os";
import path from "path";

let innertube = null;
const downloadCache = new Map();

const getInnertube = async () => {
  if (!innertube) innertube = await Innertube.create();
  return innertube;
};

const searchVideo = async (search, limit) => {
  const yt = await getInnertube();
  const results = await yt.search(search, { type: "video" });

  return results.videos.slice(0, Number(limit)).map((video) => ({
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
  const videos = await ytch.getChannelVideos({ channelId, sortBy: "popular" });
  return videos.items;
};


const extractVideoId = (url) => {
  if (url.includes("v="))        return url.split("v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  return url;
};


export const downloadAudio = (url, startSeconds = 0) => {

  const videoId = extractVideoId(url);
  const cacheKey = `${videoId}-${startSeconds}`;

  if (downloadCache.has(cacheKey)) {
    console.log(`[yt-dlp] Cache hit: ${cacheKey}`);
    return downloadCache.get(cacheKey);
  }

  const tempFile = path.join(os.tmpdir(), `ytdlp-${cacheKey}.m4a`);
  const promise = new Promise((resolve, reject) => {
    if (existsSync(tempFile)) {
      console.log(`[yt-dlp] Archivo en disco: ${tempFile}`);
      return resolve(tempFile);
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const args = [
      videoUrl,
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "-o", tempFile,
      "--no-playlist",
      "--no-part",
      ...(startSeconds > 0 ? ["--download-sections", `*${startSeconds}-inf`] : []),
    ];

    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });

    proc.stdout.on("data", (d) => console.log("[yt-dlp]", d.toString().trim()));
    proc.stderr.on("data", (d) => console.log("[yt-dlp]", d.toString().trim()));

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`[yt-dlp] Descarga completa: ${tempFile}`);
        resolve(tempFile);
      }
      else {
        downloadCache.delete(cacheKey);
        reject(new Error(`yt-dlp salió con código ${code}`));
      }
    });

    proc.on("error", (err) => {
      downloadCache.delete(cacheKey);
      reject(err);
    });
  });

  promise.then((filePath) => {
    setTimeout(async () => {
      downloadCache.delete(cacheKey);
      try { await unlink(filePath); } catch {}
    }, 10 * 60 * 1000);
  });

  downloadCache.set(cacheKey, promise);
  return promise;
};

export { searchVideo, searchChannelVideos };