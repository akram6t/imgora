/** Shared types for both runtimes (Node local dev + Cloudflare Workers). */

export interface UploadedMeta {
  id: string;
  type: string;
  bytes: number;
  uploadedAt: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface StoredImage {
  data: Uint8Array;
  meta: UploadedMeta;
}

/** Minimal structural type for the R2 bucket binding (avoids workers-types dep). */
export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | string,
    options?: {
      httpMetadata?: Record<string, string>;
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  get(key: string): Promise<{
    arrayBuffer(): Promise<ArrayBuffer>;
    httpMetadata?: Record<string, string>;
    customMetadata?: Record<string, string>;
  } | null>;
  head?(key: string): Promise<{
    httpMetadata?: Record<string, string>;
    customMetadata?: Record<string, string>;
  } | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{
    objects: {
      key: string;
      size: number;
      uploaded: Date;
      customMetadata?: Record<string, string>;
    }[];
  }>;
}

/** Loose env: covers Workers bindings as well as plain Node process.env. */
export interface Env {
  BUCKET?: R2BucketLike;
  S3_BUCKET?: string;
  S3_REGION?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_ENDPOINT?: string;
  S3_PREFIX?: string;
  [key: string]: unknown;
}

export interface StorageAdapter {
  put(id: string, data: Uint8Array, meta: UploadedMeta): Promise<void>;
  /** metadata only — cheap (sidecar file / HeadObject); never fetches the image body */
  getMeta(id: string): Promise<UploadedMeta | null>;
  get(id: string): Promise<StoredImage | null>;
  remove(id: string): Promise<void>;
  list(): Promise<UploadedMeta[]>;
}

export interface ProcessResult {
  data: Uint8Array;
  format: string;
  width?: number;
  height?: number;
}

export interface Processor {
  processImage(input: Uint8Array, p: EffectiveParams): Promise<ProcessResult>;
}

export type ImageFormat = "jpeg" | "png" | "webp" | "gif" | "avif" | "tiff";
export type OutputFormat = "jpeg" | "png" | "webp" | "avif";

export interface EffectiveParams {
  // resize
  w: number | null;
  h: number | null;
  fit: "cover" | "contain" | "fill" | "inside" | "outside";
  bg: string | null;
  // pre-crop region
  x: number;
  y: number;
  cw: number | null;
  ch: number | null;
  // encode
  q: number;
  fmt: OutputFormat;
  prog: boolean;
  moz: boolean; // mozjpeg tuned encoder
  cs: "420" | "444"; // jpeg chroma subsampling
  effort: number | null; // webp/avif encoder effort (null = per-format default)
  lossless: boolean; // webp/avif lossless
  level: number; // png zlib compression level 0-9
  palette: boolean; // png palette quantization
  pqual: number; // png palette quality
  // effects
  rot: number;
  flip: boolean;
  flop: boolean;
  gray: number; // 0-100 desaturation amount (100 = full grayscale)
  neg: number; // 0-100 invert amount
  bright: number;
  sat: number;
  hue: number;
  blur: number;
  sharpen: number; // 0-100 strength
  // delivery flags (do not affect image bytes)
  download: boolean;
  meta: boolean;
  orig: boolean;
  /** deterministic canonical string used as the cache key suffix */
  canonical: string;
}
