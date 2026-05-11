import { Innertube } from "youtubei.js";

let innertube = null;

export const getInnertube = async () => {
  if (!innertube) {
    innertube = await Innertube.create({ generate_session_locally: true });
  }
  return innertube;
};
