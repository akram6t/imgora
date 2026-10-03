/**
 * Cloudflare Workers processor — thin loader over the shared WASM pipeline
 * (wasm-pipeline.ts). Workers cannot fetch their own bundle at runtime and do
 * not allow dynamic code execution, so each codec's WASM binary is imported
 * statically and passed to its `init()` — the officially recommended
 * jSquash + Workers pattern.
 */
/// <reference path="../wasm.d.ts" />
import jpegDecode, { init as initJpegDec } from "@jsquash/jpeg/decode";
import jpegEncode, { init as initJpegEnc } from "@jsquash/jpeg/encode";
import pngDecode, { init as initPngDec } from "@jsquash/png/decode";
import pngEncode, { init as initPngEnc } from "@jsquash/png/encode";
import webpDecode, { init as initWebpDec } from "@jsquash/webp/decode";
import webpEncode, { init as initWebpEnc } from "@jsquash/webp/encode";
import resizeFn, { initResize } from "@jsquash/resize";

import JPEG_DEC_WASM from "../../node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm";
import JPEG_ENC_WASM from "../../node_modules/@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm";
// wrangler compiles these to a WebAssembly.Module (default export);
// jsquash's generated sibling .d.ts files don't declare one, hence the directive.
// @ts-expect-error see above
import PNG_WASM from "../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm";
import WEBP_DEC_WASM from "../../node_modules/@jsquash/webp/codec/dec/webp_dec.wasm";
import WEBP_ENC_WASM from "../../node_modules/@jsquash/webp/codec/enc/webp_enc_simd.wasm";
// @ts-expect-error see above
import RESIZE_WASM from "../../node_modules/@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm";

import { createWasmProcessor, type Processor } from "./wasm-pipeline";

let readyP: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  readyP ??= Promise.all([
    initJpegDec(JPEG_DEC_WASM),
    initJpegEnc(JPEG_ENC_WASM),
    initPngDec(PNG_WASM),
    initPngEnc(PNG_WASM),
    initWebpDec(WEBP_DEC_WASM),
    initWebpEnc(WEBP_ENC_WASM),
    initResize(RESIZE_WASM),
  ]).then(() => undefined);
  return readyP;
}

export function createWorkersProcessor(): Processor {
  return createWasmProcessor(
    { jpegDecode, jpegEncode, pngDecode, pngEncode, webpDecode, webpEncode, resize: resizeFn },
    ensureWasm,
  );
}
