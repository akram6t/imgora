/**
 * Deno Deploy processor — thin loader over the shared WASM pipeline
 * (wasm-pipeline.ts). Codecs come from esm.sh CDN builds: their wasm binaries
 * are served over https (esm.sh rewrites the emscripten loader URLs), which is
 * the officially demonstrated jSquash-on-Deno pattern. No manual init needed.
 */
// @ts-ignore — remote CDN module (Deno runtime only)
import jpegDecode from "https://esm.sh/@jsquash/jpeg@1.6.0/decode";
// @ts-ignore — remote CDN module (Deno runtime only)
import jpegEncode from "https://esm.sh/@jsquash/jpeg@1.6.0/encode";
// @ts-ignore — remote CDN module (Deno runtime only)
import pngDecode from "https://esm.sh/@jsquash/png@3.1.1/decode";
// @ts-ignore — remote CDN module (Deno runtime only)
import pngEncode from "https://esm.sh/@jsquash/png@3.1.1/encode";
// @ts-ignore — remote CDN module (Deno runtime only)
import webpDecode from "https://esm.sh/@jsquash/webp@1.5.0/decode";
// @ts-ignore — remote CDN module (Deno runtime only)
import webpEncode from "https://esm.sh/@jsquash/webp@1.5.0/encode";
// @ts-ignore — remote CDN module (Deno runtime only)
import resizeFn from "https://esm.sh/@jsquash/resize@2.1.1";

import { createWasmProcessor, type WasmCodecs } from "./wasm-pipeline";
import type { Processor } from "../types";

export function createDenoProcessor(): Processor {
  const codecs: WasmCodecs = {
    // deno-lint-ignore no-explicit-any
    jpegDecode: jpegDecode as any,
    // deno-lint-ignore no-explicit-any
    jpegEncode: jpegEncode as any,
    // deno-lint-ignore no-explicit-any
    pngDecode: pngDecode as any,
    // deno-lint-ignore no-explicit-any
    pngEncode: pngEncode as any,
    // deno-lint-ignore no-explicit-any
    webpDecode: webpDecode as any,
    // deno-lint-ignore no-explicit-any
    webpEncode: webpEncode as any,
    // deno-lint-ignore no-explicit-any
    resize: resizeFn as any,
  };
  return createWasmProcessor(codecs);
}
