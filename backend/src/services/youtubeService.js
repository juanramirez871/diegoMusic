import YouTube from "youtube-sr";

const searchVideo = async (search) => {

  console.log(YouTube.default.search)
  const videos = await YouTube.default.search(search, {
    limit: 20,
    safeSearch: true,
  });
  
  return videos;
};

export {
  searchVideo,
};
