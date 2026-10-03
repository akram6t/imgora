/**
 * Imgora — Cloudinary-style on-the-fly image service on Hono.
 *
 * One codebase, three storage backends:
 *   • Node local dev:  sharp + filesystem (zero-config)
 *   • Production:      sharp + S3 (or any S3-compatible endpoint, e.g. R2)
 *   • Cloudflare:      @jsquash WASM + R2 binding / S3 / memory fallback
 *
 * Transformations are driven entirely by URL query params on /t/:id.
 * Every distinct param combination produces a deterministic cache key, so
 * identical params are served instantly from cache — and transform cache hits
 * never touch object storage at all.
 */
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { parseParams } from "./params";
import {
  FlightPool,
  MemCache,
  TieredCache,
  WorkersCache,
  type CacheEntry,
  type ImageCache,
} from "./cache";
import { PLAYGROUND_HTML } from "./playground";
import { LANDING_HTML } from "./landing";
import { DOCS_HTML } from "./docs";
import { FAVICON_PNG_BASE64, LOGO_SVG } from "./brand";
import { OG_PNG_BASE64 } from "./og-image";
import { DailyQuota, type QuotaStatus } from "./quota";
import {
  EXT,
  MAX_UPLOAD_BYTES,
  MIME,
  genId,
  imageDims,
  isDeno,
  isWorkers,
  sha1Hex,
  sniffFormat,
  stripExt,
  validId,
} from "./utils";
import type {
  Env,
  Processor,
  ProcessResult,
  StorageAdapter,
  UploadedMeta,
} from "./types";

/* ------------------------------------------------------------------ */
/* runtime wiring                                                      */
/* ------------------------------------------------------------------ */

interface Runtime {
  storage: StorageAdapter;
  processor: Processor;
  cache: ImageCache;
  flights: FlightPool;
}

type AppEnv = { Bindings: Env; Variables: { rt: Runtime; origin: string; uid: string } };
type Ctx = Context<AppEnv>;

const err = (c: Ctx, status: ContentfulStatusCode, message: string) =>
  c.json({ error: message }, status);

/** hot cache of original image bytes (per isolate / per process) */
const dataCache = new Map<string, Uint8Array>();
const DATA_CACHE_MAX = 16;

/** hot metadata cache — transform hits never touch disk/S3 at all */
const metaCache = new Map<string, UploadedMeta>();
const META_CACHE_MAX = 512;

/** LRU transform-result layer shared by every request in this isolate/process */
const memCache = new MemCache(128, 256 * 1024 * 1024);
const flights = new FlightPool();

function lruTouch<T>(map: Map<string, T>, key: string): void {
  const v = map.get(key);
  if (v !== undefined) {
    map.delete(key);
    map.set(key, v);
  }
}

function lruTrim(map: Map<string, unknown>, max: number): void {
  while (map.size > max) {
    const oldest = map.keys().next().value as string;
    map.delete(oldest);
  }
}

async function getMeta(rt: Runtime, id: string): Promise<UploadedMeta | null> {
  const hit = metaCache.get(id);
  if (hit) {
    lruTouch(metaCache, id);
    return hit;
  }
  const meta = await rt.storage.getMeta(id);
  if (!meta) return null;
  meta.id = id;
  metaCache.set(id, meta);
  lruTrim(metaCache, META_CACHE_MAX);
  return meta;
}

async function getData(rt: Runtime, id: string): Promise<Uint8Array | null> {
  const hit = dataCache.get(id);
  if (hit) {
    lruTouch(dataCache, id);
    return hit;
  }
  const stored = await rt.storage.get(id);
  if (!stored) return null;
  dataCache.set(id, stored.data);
  lruTrim(dataCache, DATA_CACHE_MAX);
  metaCache.set(id, stored.meta); // keep the two views consistent
  return stored.data;
}

/* ---------- adapter construction ---------- */

let nodeRt: Promise<Runtime> | null = null;
function nodeRuntime(): Promise<Runtime> {
  nodeRt ??= (async () => {
    const [{ FsStorage, DiskCache }, { createNodeProcessor }, { s3ConfigFromEnv, S3Storage }] =
      await Promise.all([import("./storage/fs"), import("./processors/sharp"), import("./storage/s3")]);
    const cfg = s3ConfigFromEnv(process.env);
    const storage = cfg ? new S3Storage(cfg) : new FsStorage(process.env.DATA_DIR || "data");
    return {
      storage,
      processor: createNodeProcessor(),
      cache: new TieredCache(memCache, [new DiskCache(`${process.env.DATA_DIR || "data"}/cache`)]),
      flights,
    };
  })();
  return nodeRt;
}

// lazily-initialized singletons for the Workers runtime. The loader's sync
// section runs before any await, so concurrent first requests are safe.
let adaptersReady: Promise<void> | null = null;
let workersProcessor: Processor | null = null;
type R2StorageCtor = new (b: NonNullable<Env["BUCKET"]>) => StorageAdapter;
type MemStorageCtor = new () => StorageAdapter;
type S3StorageCtor = new (cfg: object) => StorageAdapter;
type S3CfgFn = (env: Record<string, unknown>) => object | null;
let R2StorageCf: R2StorageCtor;
let MemoryStorageCf: MemStorageCtor;
let S3StorageCf: S3StorageCtor;
let s3CfgFromEnv: S3CfgFn;

function loadWorkersAdapters(): Promise<void> {
  adaptersReady ??= (async () => {
    const [{ R2Storage, MemoryStorage }, { createWorkersProcessor }, { S3Storage, s3ConfigFromEnv }] =
      await Promise.all([
        import("./storage/r2"),
        import("./processors/wasm"),
        import("./storage/s3"),
      ]);
    R2StorageCf = R2Storage as R2StorageCtor;
    MemoryStorageCf = MemoryStorage as MemStorageCtor;
    S3StorageCf = S3Storage as unknown as S3StorageCtor;
    s3CfgFromEnv = s3ConfigFromEnv as S3CfgFn;
    workersProcessor = createWorkersProcessor();
  })();
  return adaptersReady;
}

function workersRuntime(env: Env, origin: string): Runtime {
  const cfg = s3CfgFromEnv(env as Record<string, unknown>);
  return {
    storage: env.BUCKET
      ? new R2StorageCf(env.BUCKET)
      : cfg
        ? new S3StorageCf(cfg)
        : new MemoryStorageCf(),
    processor: workersProcessor!,
    cache: new TieredCache(memCache, [new WorkersCache(origin)]),
    flights,
  };
}

// Deno Deploy runtime: WASM codecs + S3 storage + in-memory cache
// (no disk, no Cloudflare Cache API). Env comes from Deno.env.
let denoRt: Promise<Runtime> | null = null;
function denoRuntime(): Promise<Runtime> {
  denoRt ??= (async () => {
    const [{ S3Storage, s3ConfigFromEnv }, { createDenoProcessor }] = await Promise.all([
      import("./storage/s3"),
      import("./processors/wasm-deno"),
    ]);
    const D = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno;
    const env = (k: string) => D?.env.get(k);
    const cfg = s3ConfigFromEnv({
      S3_BUCKET: env("S3_BUCKET"),
      S3_REGION: env("S3_REGION") ?? env("AWS_REGION"),
      S3_ACCESS_KEY_ID: env("S3_ACCESS_KEY_ID") ?? env("AWS_ACCESS_KEY_ID"),
      S3_SECRET_ACCESS_KEY: env("S3_SECRET_ACCESS_KEY") ?? env("AWS_SECRET_ACCESS_KEY"),
      S3_ENDPOINT: env("S3_ENDPOINT") ?? env("AWS_ENDPOINT_URL_S3"),
      S3_PREFIX: env("S3_PREFIX"),
    });
    if (!cfg) throw new Error("Deno Deploy needs S3_BUCKET (+ AWS keys) in the project env vars");
    return {
      storage: new S3Storage(cfg),
      processor: createDenoProcessor(),
      cache: new TieredCache(memCache), // memory only — no CF Cache API, no disk
      flights,
    };
  })();
  return denoRt;
}

async function getRuntime(c: Ctx): Promise<Runtime> {
  const origin = new URL(c.req.url).origin;
  if (isDeno) return denoRuntime();
  if (!isWorkers) return nodeRuntime();
  await loadWorkersAdapters();
  return workersRuntime(c.env, origin);
}

/* ------------------------------------------------------------------ */
/* app                                                                 */
/* ------------------------------------------------------------------ */

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("rt", await getRuntime(c));
  c.set("origin", new URL(c.req.url).origin);
  // anonymous per-user identity for the daily quota (dummy tier: cookie-based)
  let uid = "";
  const m = (c.req.header("cookie") ?? "").match(/(?:^|;\s*)imgora_uid=([A-Za-z0-9_-]+)/);
  let fresh = false;
  if (m) uid = m[1];
  else {
    uid = "u" + genId();
    fresh = true;
  }
  c.set("uid", uid);
  await next();
  // never attach Set-Cookie to immutable-cached image responses (CDN safety)
  if (fresh && !/^\/(t|raw)\//.test(new URL(c.req.url).pathname)) {
    c.res.headers.append("Set-Cookie", `imgora_uid=${uid}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`);
  }
});

// allow the JSON API to be consumed cross-origin (images are CORS-exempt anyway)
app.use("/upload", cors());
app.use("/images", cors());
app.use("/images/*", cors());

// s-maxage lets serverless CDNs (Vercel edge) cache transform URLs; the
// canonical query string is deterministic, so URL-keyed caching is safe.
const IMMU = "public, max-age=31536000, s-maxage=31536000, immutable";

/* ---------- daily transform quota (self-hosted tier) ---------- */

let quota: DailyQuota | null = null;
function getQuota(): DailyQuota {
  quota ??= new DailyQuota(
    isWorkers ? 100 : Number(process.env.DAILY_TRANSFORM_LIMIT) || 100,
    isWorkers ? undefined : `${process.env.DATA_DIR || "data"}/usage.json`,
  );
  return quota;
}

function rateHeaders(st: QuotaStatus): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(st.limit),
    "X-RateLimit-Remaining": String(st.remaining),
  };
}

function cacheHeaders(entry: CacheEntry, xCache: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": entry.type,
    "Cache-Control": IMMU,
    ETag: `"${entry.etag}"`,
    Vary: "Accept",
    "X-Cache": xCache,
  };
  if (entry.width) h["X-Image-Dimensions"] = `${entry.width}x${entry.height ?? "?"}`;
  return h;
}

function etagMatch(c: Ctx, etag: string): boolean {
  return c.req.header("if-none-match") === `"${etag}"`;
}

/* ---------- landing + studio ---------- */

// HTML pages must always revalidate — stale markup after a deploy is worse
// than a round-trip. Static assets below stay immutable.
const HTML_HEADERS = { "Cache-Control": "no-cache" } as const;

app.get("/", (c) => c.html(LANDING_HTML.replaceAll("%ORIGIN%", new URL(c.req.url).origin), 200, HTML_HEADERS));
app.get("/docs", (c) => c.html(DOCS_HTML.replaceAll("%ORIGIN%", new URL(c.req.url).origin), 200, HTML_HEADERS));
app.get("/studio", (c) => c.html(PLAYGROUND_HTML, 200, HTML_HEADERS));
app.get("/playground", (c) => c.redirect("/studio"));

/* ---------- brand assets ---------- */

const BRAND_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": IMMU,
} as const;

app.get("/logo.svg", (c) => c.body(LOGO_SVG, 200, BRAND_HEADERS));
app.get("/favicon.svg", (c) => c.body(LOGO_SVG, 200, BRAND_HEADERS));
app.get("/favicon.png", (c) =>
  c.body(
    Uint8Array.from(atob(FAVICON_PNG_BASE64), (ch) => ch.charCodeAt(0)) as unknown as ArrayBuffer,
    200,
    { "Content-Type": "image/png", "Cache-Control": IMMU },
  ),
);

/* ---------- SEO infrastructure ---------- */

// social share card — real 1200×630 raster (SVG OG images are ignored by crawlers)
app.get("/og.png", (c) =>
  c.body(
    Uint8Array.from(atob(OG_PNG_BASE64), (ch) => ch.charCodeAt(0)) as unknown as ArrayBuffer,
    200,
    { "Content-Type": "image/png", "Cache-Control": IMMU },
  ),
);

// crawl policy: pages yes, infinite param space and the app shell no
app.get("/robots.txt", (c) =>
  c.body(
    "User-agent: *\n" +
      "Allow: /\n" +
      "Disallow: /t/\n" +
      "Disallow: /raw/\n" +
      "Disallow: /studio\n" +
      "Disallow: /upload\n" +
      "Disallow: /images\n" +
      "Disallow: /exists/\n" +
      "Disallow: /quota\n" +
      "\n" +
      `Sitemap: ${c.get("origin")}/sitemap.xml\n`,
    200,
    { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  ),
);

// sitemap for the indexable public pages
app.get("/sitemap.xml", (c) => {
  const origin = c.get("origin");
  const today = new Date().toISOString().slice(0, 10);
  const page = (path: string, priority: string, changefreq: string) =>
    `  <url><loc>${origin}${path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    page("/", "1.0", "weekly") +
    "\n" +
    page("/docs", "0.9", "weekly") +
    "\n</urlset>\n";
  return c.body(xml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// PWA-lite manifest — installability + theme signals for mobile
app.get("/manifest.webmanifest", (c) =>
  c.body(
    JSON.stringify({
      name: "Imgora — Image Transformation API",
      short_name: "Imgora",
      description:
        "Resize, crop, compress and convert images by URL. S3-backed, edge-cached, free.",
      start_url: "/",
      display: "standalone",
      background_color: "#0b0e14",
      theme_color: "#0b0e14",
      icons: [
        { src: "/favicon.png", sizes: "64x64", type: "image/png" },
        { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      ],
    }),
    200,
    { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  ),
);

app.get("/healthz", (c) =>
  c.json({
    ok: true,
    service: "imgora",
    runtime: isWorkers ? "cloudflare-workers" : isDeno ? "deno-deploy" : "node",
    storage: isWorkers
      ? c.env.BUCKET
        ? "r2"
        : s3CfgSafe(c.env)
          ? "s3"
          : "memory"
      : isDeno
        ? "s3"
        : s3CfgSafe()
          ? "s3"
          : "filesystem",
  }),
);

function s3CfgSafe(env?: Record<string, unknown>): boolean {
  try {
    // cheap presence check without loading the SDK
    const src = env ?? process.env;
    return typeof src.S3_BUCKET === "string" && src.S3_BUCKET.length > 0;
  } catch {
    return false;
  }
}

/* ---------- upload ---------- */

app.post("/upload", async (c) => {
  const rt = c.get("rt");
  const ct = c.req.header("content-type") ?? "";
  let data: Uint8Array | null = null;

  if (ct.includes("application/json")) {
    const body = await c.req.json<{ url?: string }>().catch(() => null);
    if (!body?.url || !/^https?:\/\//i.test(body.url)) {
      return err(c, 400, 'POST {"url": "https://…"} to fetch a remote image');
    }
    const res = await fetch(body.url, { signal: AbortSignal.timeout(20_000) }).catch(() => null);
    if (!res?.ok) return err(c, 400, "Failed to fetch source url");
    data = new Uint8Array(await res.arrayBuffer());
  } else if (ct.includes("multipart/form-data")) {
    const form = await c.req.parseBody();
    const file = form.file ?? form.image;
    if (!(file instanceof File)) return err(c, 400, "Send multipart field 'file'");
    data = new Uint8Array(await file.arrayBuffer());
  } else {
    data = new Uint8Array(await c.req.arrayBuffer());
  }

  if (!data || data.byteLength === 0) return err(c, 400, "Empty body");
  if (data.byteLength > MAX_UPLOAD_BYTES) {
    return err(c, 413, `Max upload size is ${(MAX_UPLOAD_BYTES / 1024 / 1024) | 0} MB`);
  }
  const format = sniffFormat(data);
  if (!format || !(format in MIME)) {
    return err(c, 415, "Unsupported image type (supported: jpeg, png, webp, gif, avif, tiff)");
  }

  const id = genId();
  const dims = imageDims(data); // header-only parse — no decode, no CPU spike
  const meta: UploadedMeta = {
    id,
    type: MIME[format],
    bytes: data.byteLength,
    uploadedAt: new Date().toISOString(),
    format,
    width: dims.width,
    height: dims.height,
  };
  await rt.storage.put(id, data, meta);
  const origin = c.get("origin");
  return c.json({ ...meta, rawUrl: `${origin}/raw/${id}`, transformUrl: `${origin}/t/${id}` });
});

/* ---------- transforms ---------- */

app.get("/t/:id", async (c) => {
  const id = stripExt(c.req.param("id"));
  if (!validId(id)) return err(c, 400, "Invalid image id");
  const rt = c.get("rt");
  const origin = c.get("origin");

  // metadata only — the image body is fetched from storage on a cache miss
  const meta = await getMeta(rt, id);
  if (!meta) return err(c, 404, "Image not found");

  const p = parseParams(c.req.query(), c.req.header("accept") ?? null, meta.format ?? null);

  // passthrough original (also when no params were given at all)
  if (p.orig) {
    const data = await getData(rt, id);
    if (!data) return err(c, 404, "Image not found");
    const entry: CacheEntry = { data, type: meta.type, etag: await sha1Hex(`raw|${id}`) };
    if (etagMatch(c, entry.etag)) return c.body(null, 304, cacheHeaders(entry, "RAW"));
    const h = cacheHeaders(entry, "RAW");
    if (p.download) {
      h["Content-Disposition"] = `attachment; filename="${id}.${EXT[meta.format ?? ""] ?? "img"}"`;
    }
    return c.body(entry.data as unknown as ArrayBuffer, 200, h);
  }

  const key = `${id}|${p.canonical}`;
  const etag = await sha1Hex(key);

  const cached = await rt.cache.get(key);
  if (cached) {
    if (etagMatch(c, cached.etag)) return c.body(null, 304, cacheHeaders(cached, "HIT"));
    if (p.meta) return metaJson(c, id, origin, p, cached);
    const h = { ...cacheHeaders(cached, "HIT"), ...rateHeaders(await getQuota().status(c.get("uid"))) };
    if (p.download) {
      h["Content-Disposition"] = `attachment; filename="${id}.${EXT[cached.type.replace("image/", "")] ?? "img"}"`;
    }
    return c.body(cached.data as unknown as ArrayBuffer, 200, h);
  }

  // cache miss: now (and only now) fetch the original body from storage
  const data = await getData(rt, id);
  if (!data) return err(c, 404, "Image not found");

  // Memory guard for constrained runtimes: Workers WASM and ~1GB serverless
  // lambdas (Vercel). Self-hosted Node with sharp handles much larger images.
  if (
    (isWorkers || !!process.env.VERCEL) &&
    meta.width &&
    meta.height &&
    meta.width * meta.height > 30_000_000
  ) {
    return err(
      c,
      413,
      `Image is ~${Math.round((meta.width * meta.height) / 1e6)}MP — too large to transform on serverless. Use ?orig=1 for the original or the self-hosted Node runtime.`,
    );
  }

  // quota gate — only real transformations (cache misses) consume a slot
  const attempt = await getQuota().consume(c.get("uid"));
  if (!attempt.ok) {
    return c.json(
      {
        error: `Daily transformation limit reached (${attempt.status.limit}/day). Quota resets at midnight UTC.`,
        limit: attempt.status.limit,
        resets: attempt.status.resets,
      },
      429,
      rateHeaders(attempt.status),
    );
  }

  let result: ProcessResult;
  try {
    // single-flight: concurrent identical requests share one pipeline run
    result = await rt.flights.run(key, () => rt.processor.processImage(data, p));
  } catch (e) {
    const status = (e as { status?: number }).status ?? 400;
    return err(c, (status ?? 400) as ContentfulStatusCode, `Transform failed: ${(e as Error).message}`);
  }

  const fresh: CacheEntry = {
    data: result.data,
    type: MIME[result.format] ?? "application/octet-stream",
    etag,
    width: result.width,
    height: result.height,
  };
  if (isWorkers) c.executionCtx.waitUntil(rt.cache.put(key, fresh));
  else await rt.cache.put(key, fresh);

  if (etagMatch(c, etag)) return c.body(null, 304, cacheHeaders(fresh, "MISS"));
  if (p.meta) return metaJson(c, id, origin, p, fresh);
  const h = { ...cacheHeaders(fresh, "MISS"), ...rateHeaders(attempt.status) };
  if (p.download) {
    h["Content-Disposition"] = `attachment; filename="${id}.${EXT[result.format] ?? "img"}"`;
  }
  return c.body(fresh.data as unknown as ArrayBuffer, 200, h);
});

function metaJson(
  c: Ctx,
  id: string,
  origin: string,
  p: ReturnType<typeof parseParams>,
  e: CacheEntry,
) {
  return c.json({
    id,
    format: e.type.replace("image/", ""),
    bytes: e.data.byteLength,
    width: e.width,
    height: e.height,
    params: p.canonical,
    url: `${origin}/t/${id}?${p.canonical}`,
  });
}

/* ---------- original ---------- */

app.get("/raw/:id", async (c) => {
  const id = stripExt(c.req.param("id"));
  if (!validId(id)) return err(c, 400, "Invalid image id");
  const rt = c.get("rt");
  const meta = await getMeta(rt, id);
  if (!meta) return err(c, 404, "Image not found");
  const data = await getData(rt, id);
  if (!data) return err(c, 404, "Image not found");
  const entry: CacheEntry = { data, type: meta.type, etag: await sha1Hex(`raw|${id}`) };
  if (etagMatch(c, entry.etag)) return c.body(null, 304, cacheHeaders(entry, "RAW"));
  return c.body(entry.data as unknown as ArrayBuffer, 200, cacheHeaders(entry, "RAW"));
});

/* ---------- management ---------- */

app.get("/quota", async (c) => c.json(await getQuota().status(c.get("uid"))));

app.get("/exists/:id", async (c) => {
  const id = stripExt(c.req.param("id"));
  if (!validId(id)) return err(c, 400, "Invalid image id");
  const meta = await getMeta(c.get("rt"), id);
  return c.json({ id, exists: !!meta });
});

app.get("/images", async (c) => {
  const rt = c.get("rt");
  const origin = c.get("origin");
  const images = await rt.storage.list();
  return c.json({
    count: images.length,
    images: images.map((m) => ({
      ...m,
      rawUrl: `${origin}/raw/${m.id}`,
      transformUrl: `${origin}/t/${m.id}`,
    })),
  });
});

app.delete("/images/:id", async (c) => {
  const id = stripExt(c.req.param("id"));
  if (!validId(id)) return err(c, 400, "Invalid image id");
  await c.get("rt").storage.remove(id);
  metaCache.delete(id);
  dataCache.delete(id);
  return c.json({ ok: true, id });
});

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((e, c) => c.json({ error: e.message ?? "Internal error" }, 500));

export default app;
