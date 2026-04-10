import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import os from "os";
import path from "path";
import fetch from "node-fetch";

let innertube = null;
const downloadCache = new Map();

const getInnertube = async () => {
  if (!innertube) innertube = await Innertube.create();
  return innertube;
};

const extractChannelIdFromInput = (input) => {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const ucMatch = raw.match(/UC[a-zA-Z0-9_-]{22}/);
  if (ucMatch) return ucMatch[0];

  return "";
};

const extractHandleFromInput = (input) => {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const handleMatch = raw.match(/@[\w.-]+/);
  if (handleMatch) return handleMatch[0];

  return "";
};

const resolveChannelId = async (input) => {
  const directId = extractChannelIdFromInput(input);
  if (directId) return directId;

  const yt = await getInnertube();
  const raw = String(input ?? "").trim();
  if (!raw) throw new Error("channelId es requerido");

  const handle = extractHandleFromInput(raw);
  let urlToResolve = raw;

  if (handle) urlToResolve = `https://www.youtube.com/${handle}`;
  else if (!/^https?:\/\//i.test(urlToResolve)) urlToResolve = `https://www.youtube.com/${urlToResolve}`;

  const endpoint = await yt.resolveURL(urlToResolve);
  const browseId = endpoint?.payload?.browseId;

  if (typeof browseId === "string" && browseId.startsWith("UC")) return browseId;

  throw new Error("No se pudo resolver el channelId");
};

const pickPopularSortFilter = (sortFilters) => {
  if (!Array.isArray(sortFilters)) return undefined;
  return sortFilters.find((f) => String(f).toLowerCase().includes("popular"));
};

const mapInnertubeVideoToChannelItem = (video) => {
  const thumbs = Array.isArray(video?.thumbnails) ? video.thumbnails : [];

  return {
    videoId: video?.id ?? "",
    title: video?.title?.text ?? "",
    author: video?.author?.name ?? "",
    authorId: video?.author?.id ?? "",
    durationText: video?.duration?.text ?? "",
    videoThumbnails: thumbs.map((t) => ({
      url: t?.url ?? "",
      width: t?.width ?? 0,
      height: t?.height ?? 0,
    })),
  };
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
  const resolvedChannelId = await resolveChannelId(channelId);

  try {
    const yt = await getInnertube();
    const channel = await yt.getChannel(resolvedChannelId);
    const videosTab = channel.has_videos ? await channel.getVideos() : channel;

    const popularFilter = pickPopularSortFilter(videosTab.sort_filters);
    const sortedFeed = popularFilter ? await videosTab.applySort(popularFilter) : videosTab;

    const items = sortedFeed.videos.slice(0, 40).map(mapInnertubeVideoToChannelItem);
    if (items.length) return items;
  } catch {}

  const videos = await ytch.getChannelVideos({ channelId: resolvedChannelId, sortBy: "popular" });
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

export const getVideoDirectSource = async (url) => {
  
  const videoId = extractVideoId(url);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const args = [
    "-f",
    "18/22/best[ext=mp4][vcodec^=avc1][acodec!=none]/best",
    "-g",
    videoUrl,
  ];

  const directUrl = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) {
        const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const firstUrl = lines.find((l) => /^https?:\/\//i.test(l));
        if (!firstUrl) return reject(new Error("No se obtuvo URL directa del video"));
        resolve(firstUrl);
      } else {
        reject(new Error(stderr || `yt-dlp salió con código ${code}`));
      }
    });
    proc.on("error", (err) => reject(err));
  });

  const lower = String(directUrl).toLowerCase();
  const mimeType =
    lower.includes(".webm") || lower.includes("mime=video%2Fwebm")
      ? "video/webm"
      : "video/mp4";

  return { directUrl, mimeType };
};

export const proxyVideoStream = async (res, sourceUrl, mimeType, rangeHeader) => {
  const headers = {};
  if (rangeHeader) headers.Range = rangeHeader;
  const upstream = await fetch(sourceUrl, { headers });

  const status = upstream.status === 206 ? 206 : upstream.status;
  const upstreamHeaders = {
    "Content-Type": mimeType,
    "Accept-Ranges": upstream.headers.get("accept-ranges") || "bytes",
    "Content-Length": upstream.headers.get("content-length") || undefined,
    "Content-Range": upstream.headers.get("content-range") || undefined,
    "Cache-Control": "no-store",
  };

  Object.entries(upstreamHeaders).forEach(([k, v]) => {
    if (v !== undefined && v !== null) res.setHeader(k, v);
  });
  res.statusCode = status;

  if (!upstream.body) {
    res.end();
    return;
  }
  upstream.body.on("error", () => {
    try { res.end(); } catch {}
  });
  upstream.body.pipe(res);
};

export { searchVideo, searchChannelVideos };
