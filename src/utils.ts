/** Runtime helpers shared by Node and Workers paths. */

export const isWorkers =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

export const isDeno =
  typeof (globalThis as { Deno?: unknown }).Deno !== "undefined";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  tiff: "image/tiff",
};

export const EXT: Record<string, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  avif: "avif",
  tiff: "tiff",
};

export function genId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 12);
}

/** Ids are filenames on disk / R2 keys — strictly validate to prevent traversal. */
export function validId(id: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

/** Accepts "photo123" or "photo123.jpg" (optional extension in URLs). */
export function stripExt(raw: string): string {
  const dot = raw.lastIndexOf(".");
  return dot > 0 ? raw.slice(0, dot) : raw;
}

/** Magic-byte sniffing — never trust the client's declared content type. */
export function sniffFormat(b: Uint8Array): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "png";
  }
  const ascii = (from: number, s: string) =>
    s.split("").every((ch, i) => b[from + i] === ch.charCodeAt(0));
  if (ascii(0, "GIF8")) return "gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "webp";
  if (ascii(4, "ftyp")) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand.startsWith("avi")) return "avif";
    if (brand.startsWith("hei") || brand.startsWith("mif")) return "heic";
    if (brand === "isom" || brand === "mp42" || brand === "mp41") return "mp4";
  }
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a) || (b[0] === 0x4d && b[1] === 0x4d)) {
    return "tiff";
  }
  return null;
}

export async function sha1Hex(input: string | Uint8Array): Promise<string> {
  const data =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest("SHA-1", data as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Image dimensions straight from file headers — O(1) for PNG/GIF/WebP, a short
 * marker scan for JPEG. Avoids decoding the whole image just to learn its size
 * (matters for Workers CPU limits and keeps uploads instant).
 */
export function imageDims(b: Uint8Array): { width?: number; height?: number } {
  try {
    if (b.length < 24) return {};
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

    if (b[0] === 0x89 && b[1] === 0x50) {
      // PNG: IHDR width/height at bytes 16..24, big-endian
      return { width: dv.getUint32(16), height: dv.getUint32(20) };
    }
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
      // GIF: logical screen size, little-endian at 6 and 8
      return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
    }
    if (b[0] === 0x52 && b[8] === 0x57) {
      // WebP: RIFF....WEBP + chunk
      const four = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (four === "VP8 ") {
        // lossy: 3-byte frame tag then 9d 01 2a, dims at 26, little-endian, 14 bits
        if (b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a) {
          return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
        }
      } else if (four === "VP8L") {
        // lossless: 14-bit (width-1) and (height-1) packed from byte 21
        const n = dv.getUint32(21, true);
        return { width: (n & 0x3fff) + 1, height: ((n >> 14) & 0x3fff) + 1 };
      } else if (four === "VP8X") {
        // extended: 24-bit (width-1)/(height-1) at 24/27, little-endian
        const w = b[24] | (b[25] << 8) | (b[26] << 16);
        const h = b[27] | (b[28] << 8) | (b[29] << 16);
        return { width: w + 1, height: h + 1 };
      }
      return {};
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      // JPEG: scan segment markers until a start-of-frame (SOF) carries the dims
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = b[i + 1];
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
          i += 2;
          continue;
        }
        const segLen = (b[i + 2] << 8) | b[i + 3];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
        }
        i += 2 + segLen;
      }
    }
  } catch {
    /* dims are best-effort */
  }
  return {};
}

