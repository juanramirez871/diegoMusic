
export const extractVideoId = (url) => {
  if (url.includes("v="))        return url.split("v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  return url;
};


export const pickPopularSortFilter = (sortFilters) => {
  if (!Array.isArray(sortFilters)) return undefined;
  return sortFilters.find((f) => String(f).toLowerCase().includes("popular"));
};

export const mapInnertubeVideoToChannelItem = (video) => {

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

const extractHandleFromInput = (input) => {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const handleMatch = raw.match(/@[\w.-]+/);
  if (handleMatch) return handleMatch[0];

  return "";
};

export const resolveChannelId = async (input) => {

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

export const extractChannelIdFromInput = (input) => {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  const ucMatch = raw.match(/UC[a-zA-Z0-9_-]{22}/);
  if (ucMatch) return ucMatch[0];

  return "";
};