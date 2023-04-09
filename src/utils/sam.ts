import { Tensor } from "onnxruntime-web";
import { requestSeg2Everything } from "../api/fb";


// const segJSON = await requestSeg2Everything(blob);
export const lowResTensor = async (segJSON: any) => {
  const embedArr = segJSON.map((arrStr: string) => {
    const binaryString = window.atob(arrStr);
    const uint8arr = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8arr[i] = binaryString.charCodeAt(i);
    }
    const float32Arr = new Float32Array(uint8arr.buffer);
    return float32Arr;
  });
  const lowResTensor = new Tensor("float32", embedArr[0], [1, 256, 64, 64]);
  return lowResTensor
}
