import ytch from "yt-channel-info";
import { Innertube } from "youtubei.js";
import { spawn } from "child_process";
import { unlink } from "fs/promises";
import os from "os";
import fetch from "node-fetch";
import path from "path";
import {
  extractVideoId,
  pickPopularSortFilter,
  mapInnertubeVideoToChannelItem,
  resolveChannelId
} from "../utils/youtubeUtils.js";
import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";


let innertube = null;
const downloadCache = new Map();

const getInnertube = async () => {
  if (!innertube) {
    innertube = await Innertube.create();
  }
  return innertube;
};


const getYtdlpBaseArgs = () => {

  const cookiesPath = path.join(process.cwd(), "cookies.txt");
  const hasCookies = existsSync(cookiesPath);
  const denoPath = "/home/ubuntu/.deno/bin/deno";

  const args = [
    "--no-playlist",
    "--no-part",
    "--js-runtimes", `deno:${denoPath}`,
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "--extractor-args", "youtube:player_client=web_safari,tv_embedded,web",
  ];

  if (hasCookies) {
    console.log("[yt-dlp] Usando cookies");
    args.push("--cookies", cookiesPath);
  }

  return args;
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
  let channelInfo = { name: "N/A", id: resolvedChannelId };

  try {
    const yt = await getInnertube();
    const channel = await yt.getChannel(resolvedChannelId);
    channelInfo.name = channel.metadata?.title || channel.header?.author?.name || "N/A";
    channelInfo.id = channel.metadata?.id || resolvedChannelId;

    const videosTab = channel.has_videos ? await channel.getVideos() : channel;
    const popularFilter = pickPopularSortFilter(videosTab.sort_filters);
    const sortedFeed = popularFilter ? await videosTab.applySort(popularFilter) : videosTab;

    const items = sortedFeed.videos.slice(0, 40).map((video) => {
      const mapped = mapInnertubeVideoToChannelItem(video);
      if (!mapped.author || mapped.author === "N/A") mapped.author = channelInfo.name;
      if (!mapped.authorId || mapped.authorId === "N/A") mapped.authorId = channelInfo.id;
      return mapped;
    });

    if (items.length) return items;
  }
  catch (error) {
    console.warn("[searchChannelVideos] Falló Innertube:", error.message);
  }

  const videos = await ytch.getChannelVideos({ channelId: resolvedChannelId, sortBy: "popular" });
  return (videos.items || []).map(v => ({
    ...v,
    author: (!v.author || v.author === "N/A") ? channelInfo.name : v.author,
    authorId: (!v.authorId || v.authorId === "N/A") ? channelInfo.id : v.authorId
  }));
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
      ...getYtdlpBaseArgs(),
      videoUrl,
      "-f", "ba[ext=m4a]/ba/best",
      "-o", tempFile,
      ...(startSeconds > 0 ? ["--download-sections", `*${startSeconds}-inf`] : []),
    ];

    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PATH: process.env.PATH }
    });

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

  console.log(`[getVideoDirectSource] Obteniendo URL para: ${videoId}`);

  const args = [
    ...getYtdlpBaseArgs(),
    "-f", "18/22/best[ext=mp4]/best",
    "-g",
    videoUrl,
  ];

  const directUrl = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PATH: process.env.PATH }
    });

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) {
        const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const firstUrl = lines.find((l) => /^https?:\/\//i.test(l));
        if (!firstUrl) {
          console.error(`[getVideoDirectSource] Error: No se obtuvo URL directa del video. stdout: ${stdout}, stderr: ${stderr}`);
          return reject(new Error("No se obtuvo URL directa del video"));
        }
        resolve(firstUrl);
      }
      else {
        console.error(`[getVideoDirectSource] Error (código ${code}): ${stderr}`);
        reject(new Error(stderr || `yt-dlp salió con código ${code}`));
      }
    });

    proc.on("error", (err) => {
      console.error(`[getVideoDirectSource] Error de proceso: ${err.message}`);
      reject(err);
    });
  });

  const lower = String(directUrl).toLowerCase();
  const mimeType =
    lower.includes(".webm") || lower.includes("mime=video%2Fwebm")
      ? "video/webm"
      : "video/mp4";

  console.log(`[getVideoDirectSource] URL obtenida correctamente (mime: ${mimeType})`);
  return { directUrl, mimeType };
};

export const proxyVideoStream = async (res, sourceUrl, mimeType, rangeHeader) => {

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  };

  if (rangeHeader) headers.Range = rangeHeader;
  console.log(`[proxyVideoStream] Iniciando stream. Range: ${rangeHeader || "N/A"}`);
  const upstream = await fetch(sourceUrl, { headers });

  if (!upstream.ok) {
    console.error(`[proxyVideoStream] Error al obtener stream de YouTube: ${upstream.status} ${upstream.statusText}`);
    res.status(upstream.status).end();
    return;
  }

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
    console.error("[proxyVideoStream] El cuerpo de la respuesta upstream es nulo");
    res.end();
    return;
  }
  upstream.body.on("error", (err) => {
    console.error("[proxyVideoStream] Error en el stream body:", err.message);
    try { res.end(); } catch {}
  });

  upstream.body.pipe(res);
};

export { searchVideo, searchChannelVideos };