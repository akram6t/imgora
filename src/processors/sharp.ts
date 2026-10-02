/**
 * Node-runtime processor — sharp (libvips).
 * The fastest image pipeline available on Node: native, multi-threaded,
 * streaming; 4-25x faster than Jimp/ImageMagick in public benchmarks.
 */
import sharp from "sharp";
import type { EffectiveParams, ProcessResult, Processor } from "../types";

const LIMIT_INPUT_PIXELS = 268402689; // ~16384x16384

export function createNodeProcessor(): Processor {
  return {
    async processImage(input: Uint8Array, p: EffectiveParams): Promise<ProcessResult> {
      let img = sharp(input, { limitInputPixels: LIMIT_INPUT_PIXELS, animated: false });

      if (p.cw !== null && p.ch !== null) {
        img = img.extract({ left: p.x, top: p.y, width: p.cw, height: p.ch });
      }
      if (p.rot !== 0) img = img.rotate(p.rot, { background: p.bg ?? { r: 0, g: 0, b: 0, alpha: 0 } });
      if (p.flip) img = img.flip();
      if (p.flop) img = img.flop();

      if (p.w !== null || p.h !== null) {
        img = img.resize({
          width: p.w ?? undefined,
          height: p.h ?? undefined,
          fit: p.fit,
          kernel: "lanczos3",
          withoutEnlargement: true,
          background: p.bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
        });
      }

      // gray amount = proportional desaturation (100 → pure luminance),
      // composed with the user's saturation setting
      if (p.bright !== 100 || p.sat !== 100 || p.hue !== 0 || p.gray > 0) {
        const desat = 1 - p.gray / 100;
        img = img.modulate({
          brightness: p.bright / 100,
          saturation: (p.sat / 100) * desat,
          hue: p.hue,
        });
      }
      if (p.neg > 0) {
        if (p.neg >= 100) {
          img = img.negate();
        } else {
          // partial invert: negate, then blend the pre-negate state over it
          // at alpha = remaining original amount. ensureAlpha(alpha) only fills
          // a MISSING channel, so the overlay's alpha is set byte-wise.
          const pre = await img.png().toBuffer();
          const inverted = await sharp(pre).negate().toBuffer();
          const { data, info } = await sharp(pre).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          const alpha = Math.round(255 * (1 - p.neg / 100));
          for (let i = 3; i < data.length; i += 4) data[i] = alpha;
          const overlay = await sharp(data, {
            raw: { width: info.width, height: info.height, channels: 4 },
          }).png().toBuffer();
          img = sharp(inverted).composite([{ input: overlay, blend: "over" }]);
        }
      }
      if (p.blur > 0) img = img.blur(p.blur);
      if (p.sharpen > 0) {
        const t = p.sharpen / 100;
        img = img.sharpen({ sigma: 0.3 + 1.7 * t, m1: 1, m2: 1 + 2 * t });
      }

      switch (p.fmt) {
        case "jpeg":
          // JPEG has no alpha — flatten first or transparent areas turn black.
          img = img.flatten({ background: p.bg ?? { r: 255, g: 255, b: 255 } }).jpeg({
            quality: p.q,
            progressive: p.prog,
            mozjpeg: p.moz,
            chromaSubsampling: p.cs === "444" ? "4:4:4" : "4:2:0",
          });
          break;
        case "png":
          img = img.png({
            compressionLevel: p.level,
            progressive: p.prog,
            palette: p.palette,
            ...(p.palette ? { quality: p.pqual } : {}),
          });
          break;
        case "avif":
          img = img.avif({
            quality: p.lossless ? undefined : p.q,
            lossless: p.lossless,
            effort: p.effort ?? 3, // keep default low — AVIF encodes are otherwise very slow
          });
          break;
        default:
          img = img.webp({
            quality: p.lossless ? undefined : p.q,
            lossless: p.lossless,
            effort: p.effort ?? 4,
            smartSubsample: !p.lossless && p.q >= 80,
          });
      }

      const { data, info } = await img.toBuffer({ resolveWithObject: true });
      return {
        data: new Uint8Array(data),
        // sharp reports AVIF output as its container format "heif"
        format: info.format === "heif" ? "avif" : info.format,
        width: info.width,
        height: info.height,
      };
    },
  };
}
