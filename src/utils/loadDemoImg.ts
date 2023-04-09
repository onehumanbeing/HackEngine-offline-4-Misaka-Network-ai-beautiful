import { requestSeg2Everything } from "../api/fb";
import { lowResTensor } from "./sam";

const url2blob = (url: string) => {
  return fetch(url).then((response) => response.blob());
};

export const requestUrlAndParseJson = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

export const getDemoImg = async (url: string, tensorUrl: string, modelScale: any) => {
  const blob = await url2blob(url);
  // const segJSON = await requestSeg2Everything(blob);
  const segJSON = await requestUrlAndParseJson(tensorUrl);
  const tensor = await lowResTensor(segJSON);

  return {
    url,
    blob,
    tensor,
    eraser: { isErase: false, isEmbedding: false },
    modelScale,
  };
};

export const getDemoImg1 = async () => {
  return await getDemoImg(
    "/demo/demo1.jpg",
    "/demo/demo1.tensor.json",
  {
    height: 600,
    maskHeight: 1024,
    maskWidth: 1024,
    onnxScale: 0.48828125,
    scale: 0.8333333333333334,
    uploadScale: 1.7066666666666668,
    width: 600,
  });
};
