/**
 * The full WASM image pipeline, codec-agnostic. Two thin loaders feed it:
 *   • wasm.ts      — Cloudflare: manual init with statically imported binaries
 *   • wasm-deno.ts — Deno: glue modules that auto-load their own WASM
 */
import type { EffectiveParams, ProcessResult, Processor } from "../types";
import { sniffFormat } from "../utils";

export type { Processor };

export class ProcessorError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface WasmCodecs {
  // option params are `any` — each glue has its own options type and the
  // boundary is only exercised with the literals inside processImage
  // deno-lint-ignore no-explicit-any
  jpegDecode: (b: ArrayBuffer, o?: any) => Promise<ImageData>;
  // deno-lint-ignore no-explicit-any
  jpegEncode: (i: ImageData, o?: any) => Promise<ArrayBuffer>;
  // deno-lint-ignore no-explicit-any
  pngDecode: (b: ArrayBuffer, o?: any) => Promise<ImageData>;
  // deno-lint-ignore no-explicit-any
  pngEncode: (i: ImageData, o?: any) => Promise<ArrayBuffer>;
  // deno-lint-ignore no-explicit-any
  webpDecode: (b: ArrayBuffer, o?: any) => Promise<ImageData>;
  // deno-lint-ignore no-explicit-any
  webpEncode: (i: ImageData, o?: any) => Promise<ArrayBuffer>;
  // deno-lint-ignore no-explicit-any
  resize: (i: ImageData, o?: any) => Promise<ImageData>;
}

export function createWasmProcessor(
  codecs: WasmCodecs,
  pre?: () => Promise<void>,
): Processor {
  return {
    async processImage(input: Uint8Array, p: EffectiveParams): Promise<ProcessResult> {
      if (pre) await pre();
      const sourceFormat = sniffFormat(input);
      const buf = input.slice().buffer; // ArrayBuffer copy for wasm codecs

      let img: ImageData;
      if (sourceFormat === "jpeg") {
        img = await codecs.jpegDecode(buf, { preserveOrientation: true });
      } else if (sourceFormat === "png") {
        img = await codecs.pngDecode(buf);
      } else if (sourceFormat === "webp") {
        img = await codecs.webpDecode(buf);
      } else {
        throw new ProcessorError(
          415,
          `Workers runtime decodes jpeg/png/webp only (source is ${sourceFormat ?? "unknown"}). Use ?orig=1 for passthrough.`,
        );
      }

      if (p.cw !== null && p.ch !== null) {
        img = cropRegion(img, p.x, p.y, p.cw, p.ch);
      }
      if (p.rot !== 0) img = rotateImageData(img, p.rot);
      if (p.flip) img = mirrorImageData(img, true);
      if (p.flop) img = mirrorImageData(img, false);

      if (p.w !== null || p.h !== null) {
        const ow = img.width;
        const oh = img.height;
        let rw: number;
        let rh: number;
        let outW: number | null = null;
        let outH: number | null = null;
        if (p.fit === "fill") {
          rw = p.w ?? ow;
          rh = p.h ?? oh;
        } else if (p.fit === "cover" || p.fit === "outside") {
          const scale = Math.max(p.w ? p.w / ow : 0, p.h ? p.h / oh : 0);
          rw = Math.ceil(ow * scale);
          rh = Math.ceil(oh * scale);
          outW = p.w ?? Math.min(rw, p.h ? Math.round((p.h * ow) / oh) : rw);
          outH = p.h ?? Math.min(rh, rw);
        } else {
          // contain / inside — fit inside the box, keep aspect
          const candidates = [
            p.w ? p.w / ow : Infinity,
            p.h ? p.h / oh : Infinity,
          ];
          const scale = Math.min(...candidates);
          rw = Math.max(1, Math.round(ow * scale));
          rh = Math.max(1, Math.round(oh * scale));
        }
        img = await codecs.resize(img, {
          width: rw,
          height: rh,
          method: "lanczos3",
          fitMethod: "stretch",
          premultiply: true,
          linearRGB: true,
        });
        if (outW !== null && (outW < img.width || (outH ?? 0) < img.height)) {
          img = cropCenter(img, Math.min(img.width, outW), Math.min(img.height, outH ?? img.height));
        }
      }

      if (p.gray > 0 || p.neg > 0) img = adjustPixels(img, p.gray, p.neg);

      const fmt = p.fmt === "avif" ? "webp" : p.fmt; // avif wasm encode is too slow for edge runtimes
      let out: ArrayBuffer;
      if (fmt === "jpeg") {
        out = await codecs.jpegEncode(img, {
          quality: p.q,
          progressive: p.prog,
          auto_subsample: p.cs !== "444",
          chroma_subsample: p.cs === "444" ? 0 : 2,
        });
      } else if (fmt === "png") {
        out = await codecs.pngEncode(img);
      } else {
        out = await codecs.webpEncode(img, {
          quality: p.lossless ? 100 : p.q,
          lossless: p.lossless ? 1 : 0,
          method: Math.min(6, p.effort ?? 4),
        });
      }

      return {
        data: new Uint8Array(out),
        format: fmt,
        width: img.width,
        height: img.height,
      };
    },
  };
}

/* ---------- pixel helpers (pure ImageData math) ---------- */

function newImageData(w: number, h: number): ImageData {
  // 3-arg constructor form — required by edge runtimes
  return new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
}

function cropRegion(img: ImageData, x: number, y: number, w: number, h: number): ImageData {
  x = Math.min(x, img.width - 1);
  y = Math.min(y, img.height - 1);
  w = Math.min(w, img.width - x);
  h = Math.min(h, img.height - y);
  const out = newImageData(w, h);
  for (let row = 0; row < h; row++) {
    const src = ((row + y) * img.width + x) * 4;
    out.data.set(img.data.subarray(src, src + w * 4), row * w * 4);
  }
  return out;
}

function cropCenter(img: ImageData, w: number, h: number): ImageData {
  return cropRegion(img, Math.floor((img.width - w) / 2), Math.floor((img.height - h) / 2), w, h);
}

function rotateImageData(img: ImageData, deg: number): ImageData {
  const q = ((deg % 360) + 360) % 360;
  if (q === 0) return img;
  const swap = q === 90 || q === 270;
  const w = swap ? img.height : img.width;
  const h = swap ? img.width : img.height;
  const out = newImageData(w, h);
  const sd = img.data;
  const dd = out.data;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + x) * 4;
      const dx = q === 90 ? img.height - 1 - y : q === 180 ? img.width - 1 - x : y;
      const dy = q === 90 ? x : q === 180 ? img.height - 1 - y : img.width - 1 - x;
      const di = (dy * w + dx) * 4;
      dd[di] = sd[si];
      dd[di + 1] = sd[si + 1];
      dd[di + 2] = sd[si + 2];
      dd[di + 3] = sd[si + 3];
    }
  }
  return out;
}

function mirrorImageData(img: ImageData, vertical: boolean): ImageData {
  const out = newImageData(img.width, img.height);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const sx = vertical ? x : img.width - 1 - x;
      const sy = vertical ? img.height - 1 - y : y;
      const si = (sy * img.width + sx) * 4;
      const di = (y * img.width + x) * 4;
      out.data[di] = img.data[si];
      out.data[di + 1] = img.data[si + 1];
      out.data[di + 2] = img.data[si + 2];
      out.data[di + 3] = img.data[si + 3];
    }
  }
  return out;
}

function adjustPixels(img: ImageData, grayAmt: number, negAmt: number): ImageData {
  if (grayAmt <= 0 && negAmt <= 0) return img;
  const g = grayAmt / 100; // desaturation factor
  const n = negAmt / 100; // inversion factor
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], gg = d[i + 1], b = d[i + 2];
    if (g > 0) {
      const l = (0.299 * r + 0.587 * gg + 0.114 * b) | 0;
      r = r * (1 - g) + l * g;
      gg = gg * (1 - g) + l * g;
      b = b * (1 - g) + l * g;
    }
    if (n > 0) {
      r = r * (1 - n) + (255 - r) * n;
      gg = gg * (1 - n) + (255 - gg) * n;
      b = b * (1 - n) + (255 - b) * n;
    }
    d[i] = r; d[i + 1] = gg; d[i + 2] = b;
  }
  return img;
}
