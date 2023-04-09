import { InferenceSession, Tensor } from "onnxruntime-common";
import { modelData } from "./modelAPI";
import { rleToImage, traceOnnxMaskToSVG } from "./mask_utils";

import * as ort from 'onnxruntime-web';
import { modelInputProps } from "./Interface";

// console.log("hi")
// Onnxruntime
ort.env.debug = false;
// set global logging level
ort.env.logLevel = 'verbose';

// override path of wasm files - for each file
ort.env.wasm.numThreads = 2;
ort.env.wasm.simd = true;
// ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': '/ort-wasm.wasm',
  'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
  'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
  'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
};

const MODEL_URL = "/interactive_module_quantized_592547_2023_03_19_sam6_long_uncertain.onnx";
let model: InferenceSession | null = null;

export const loadModel = async () => {
  try {
    model = await InferenceSession.create(MODEL_URL);
    console.log("Model loaded");
    return model;
  } catch (e) {
    console.error("Model failed to load");
  }
};

export const runModel = async (clicks: Array<modelInputProps>, tensor: Tensor, modelScale: any, predMask?: Tensor | null) => {
  try {
    if (
      model === null ||
      clicks === null ||
      tensor === null ||
      modelScale === null
    )
      return;

    const feeds = modelData({
      clicks,
      tensor,
      modelScale,
      // @ts-ignore 
      last_pred_mask: predMask,
    });
    if (feeds === undefined) return;
    // const beforeONNX = Date.now();
    const results = await model.run(feeds);
    // const afterONNX = Date.now();
    // console.log(`ONNX took ${afterONNX - beforeONNX}ms`);

    const output = results[model.outputNames[0]];
    const pred_mask = results[model.outputNames[1]];
    const svgStr = traceOnnxMaskToSVG(
      output.data,
      output.dims[1],
      output.dims[0]
    );
    const mask = output.data;
    const maskImg = rleToImage(output.data, output.dims[0], output.dims[1]);
    return { svgStr, mask, maskImg, pred_mask };
  } catch (e) {
    console.log(e);
  }
};
