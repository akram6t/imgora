# <img src="logo.svg" width="34" align="top" alt="Imgora"> Imgora

Cloudinary-style **on-the-fly image processing** built with [Hono](https://hono.dev).
Upload an image once, then transform it entirely through URL query parameters —
resize, crop, format conversion, fine-grained compression controls, effects —
with aggressive caching so identical URLs are served instantly.

**One codebase, three storage backends / three runtimes:**

| | Local dev (`npm run dev`) | Production (`S3_*` env) | Cloudflare (`npm run deploy`) | Deno Deploy |
|---|---|---|---|---|
| Processor | **sharp** (libvips, native) | **sharp** | **@jsquash WASM** codecs | **@jsquash WASM** codecs |
| Storage | filesystem `data/uploads/` | **S3** (AWS / R2 / MinIO / any S3-compatible) | R2 binding, or S3 via env | S3 via env |
| Cache | memory LRU → disk | memory LRU (add CDN in front) | memory LRU → Cache API (edge) | memory LRU |

> Library choice is benchmark-driven: sharp is the fastest Node image library
> (4–25× faster than Jimp/ImageMagick in public benchmarks). On Workers, where
> native binaries can't run, the same Squoosh WASM codecs Chrome uses take over.

## Quick start

```bash
npm install
npm run dev          # → http://localhost:3000
```

- **`/`** — landing page (SEO-complete)
- **`/studio`** — the playground: upload, live preview, every compression option,
  download button, per-browser transform history (IndexedDB) and a live quota chip

```bash
curl -F "file=@pic.jpg" localhost:3000/upload
curl -o out.webp "localhost:3000/t/ID?w=640&fit=cover&q=75&f=webp"
```

## Transform params (`GET /t/:id?…`)

All transformations are query parameters on the image URL — order-independent and
fully cacheable:

**Geometry** — `w`, `h` (px, no upscale) · `fit`: `cover|contain|fill|inside|outside` ·
`bg=rrggbb` (contain / rotate / jpeg flatten) · `x`,`y`,`cw`,`ch` (pre-crop region)

**Output & compression** — `f`: `auto|webp|avif|jpeg|png` (auto = avif/webp by Accept header) ·
`q` 1–100 (80) · `prog` (progressive jpeg/png) · and per-format:

| Param | Applies to | Values (default) |
|---|---|---|
| `moz=1` | jpeg | MozJPEG-tuned encoder |
| `cs` | jpeg | `420` (default) or `444` — chroma subsampling |
| `effort` | webp, avif | 0–9 (webp default 4, avif 3; 0 = fastest) |
| `lossless=1` | webp, avif | lossless encode (ignores `q`) |
| `level` | png | zlib level 0–9 (6) |
| `palette=1` + `pqual` | png | 8-bit palette + its quality 1–100 (80) |

**Effects** — `rot` · `flip` / `flop` · `gray` (0–100 desaturation) · `neg` (0–100 invert) ·
`bright` / `sat` (1–200%) · `hue` (-180–180) · `blur` (0.3–100) · `sharpen` (1–100 strength)

**Delivery** — `download=1` (attachment header) · `meta=1` (JSON info) · `orig=1` (passthrough)

```
/t/id?w=800&q=75&f=webp               # everyday optimization
/t/id?f=jpeg&moz=1&cs=444&q=82&prog=1 # premium jpeg
/t/id?f=webp&lossless=1               # bit-perfect webp
/t/id?f=png&palette=1&pqual=60&level=9  # tiny 8-bit png
/t/id?w=256&h=256&fit=cover&f=avif&effort=6
```

## Caching (the "instant" part)

1. **Browser/CDN** — `Cache-Control: immutable` + ETag/304 everywhere.
2. **In-process LRU** (256 MB results + hot metadata + hot originals).
3. **Disk cache** (`data/cache/`, Node) / **Cache API** (Workers).
4. **Deterministic key** — `sha1(imageId + canonicalParams)`: normalized params
   (sorted, defaults removed, `f=auto` resolved) make `?w=300&h=200` and
   `?h=200&w=300&q=80` one entry, never colliding across browsers.
5. **Single-flight** — concurrent identical requests share one pipeline run.
6. **Storage-free hits** — a transform cache hit never touches the filesystem/S3:
   the request resolves from the metadata cache + result cache alone.

Measured locally (2400×1500 jpeg): cold `w=1200&f=avif` ≈ 330 ms → warm ≈ 4 ms.

## Storage backends

### Local (default, dev)
Everything under `DATA_DIR` (default `./data`): `uploads/`, `meta/`, `cache/`.

### S3 (production)
Set env vars and the S3 adapter takes over — works with AWS S3, **Tigris**,
Cloudflare R2 (pass its S3 endpoint), MinIO, Backblaze B2, Wasabi…

The cleanest way is a gitignored `.env` file in the project root (loaded
automatically by `npm start` / `npm run dev`):

```bash
S3_BUCKET=imgora
AWS_ACCESS_KEY_ID=tid_…            # standard AWS_* names work as-is
AWS_SECRET_ACCESS_KEY=tsec_…
AWS_ENDPOINT_URL_S3=https://t3.storage.dev   # Tigris; omit for real AWS S3
AWS_REGION=auto
```

IMGORA-native names (`S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_ENDPOINT`, `S3_PREFIX`) are understood as well, and existing process env
always wins over `.env`. `AWS_ENDPOINT_URL_IAM` is never needed — static keys
are used directly. Run on AWS infra without keys to use IAM roles (default
credential chain).

How it stays fast:

- **Uploads**: one image `PutObject` + one tiny metadata sidecar (parallel), with
  `Cache-Control: immutable` and full metadata stored as object Metadata.
- **Transforms**: metadata comes from `HeadObject` (or the in-process meta cache);
  the image body is fetched from S3 **only on a transform-cache miss** — warm
  URLs cost zero S3 requests. Measured against Tigris from local dev:
  cold transform ≈ 2 s (download + encode), warm repeat ≈ **6 ms**.
- The SDK keeps HTTP connections alive; on AWS infra you can drop the explicit
  keys and use IAM roles (default credential chain).
- Put a CDN (Cloudflare/CloudFront) in front and the immutable headers make
  repeat traffic free at the edge.

Credentials: omit `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` (or their `AWS_*`
aliases) to use the SDK's default chain (IAM role, profile, etc.).

### Cloudflare Workers

The same codebase runs on Workers: **@jsquash WASM codecs** replace sharp and
storage goes through the S3 adapter (your Tigris bucket — dev and prod share
the same objects) or an R2 binding.

```bash
# 1 — one-time login (opens the browser)
npx wrangler login

# 2 — one-time secrets (non-secret config already lives in wrangler.toml [vars])
npx wrangler secret put AWS_ACCESS_KEY_ID
npx wrangler secret put AWS_SECRET_ACCESS_KEY

# 3 — ship it
npx wrangler deploy        # → https://imgora.<your-subdomain>.workers.dev
```

`wrangler dev` runs the real Workers runtime locally (WASM + your S3 config from
`.dev.vars`) on port 8787 — verified end-to-end: uploads land in Tigris and WASM
transforms (webp/jpeg/png, rotate, flip, gray amounts) read them back.

### Deno Deploy

A third runtime: `src/deno.ts` serves the same app with WASM codecs + the S3
adapter (env via the Deno Deploy dashboard). Locally:

```bash
deno task dev              # → http://localhost:8000 (uses .env for S3 config)
```

Deploy — either connect the repo in the Deno Deploy dashboard (entrypoint:
`src/deno.ts`) or use deployctl:

```bash
# one-time: create an access token at dash.deno.com → Account Settings → Access Tokens
npx deployctl deploy --project=imgora --entrypoint=src/deno.ts
```

Then set the env vars in the dashboard (Settings → Environment Variables):
`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `DAILY_TRANSFORM_LIMIT`.

Deno runtime notes: same WASM decode limits as Workers (jpeg/png/webp sources,
90° steps, no sharpen); Deploy's free tier has a per-request CPU limit, so big
transforms need the paid plan or the Node runtime.

Workers runtime notes: decodes jpeg/png/webp (gif/avif/tiff work via `orig`
passthrough only); rotate is 90° steps; `cs`/`palette`/`level` are sharp-only;
partial `neg` uses the WASM pixel blender; `f=avif` falls back to webp.
Dimensions are parsed from file headers on upload — no WASM decode, no CPU spike.
After deploying, add your `*.workers.dev` URL (or custom domain) to Google
Search Console and submit `/sitemap.xml`.

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | multipart field `file` **or** raw image body **or** `{"url": "https://…"}` · max 10 MB · magic-byte type check |
| `GET` | `/t/:id?params` | transform (passthrough when nothing applies) |
| `GET` | `/raw/:id` | original bytes |
| `GET` | `/exists/:id` | `{ id, exists }` — availability probe for retention-aware clients |
| `GET` | `/images` | list uploads with URLs |
| `DELETE` | `/images/:id` | delete upload |
| `GET` | `/quota` | remaining transformations for the current user today |
| `GET` | `/healthz` | service + runtime + storage info |
| `GET` | `/` | landing page (SEO + Open Graph + JSON-LD) |
| `GET` | `/studio` | playground (`/playground` redirects here) |

Ids are immutable, so original and transformed URLs are permanently shareable.
Every image response carries `X-Cache: MISS|HIT|RAW`, `X-Image-Dimensions` and
`X-RateLimit-Limit/Remaining`.

## Daily quota (self-hosted tier)

Transformations are limited per anonymous user (an `imgora_uid` cookie issued on
first visit) to **100/day** by default — configure with `DAILY_TRANSFORM_LIMIT`.
Counts persist to `data/usage.json` (Node) and reset at midnight UTC. Cache hits
are always free: only real transformations consume a slot. When exhausted,
`/t` returns `429` with a friendly JSON error and the Studio shows a banner.
This is deliberately lightweight (cookie identity, local counts) — swap in real
auth/billing at the same choke point (`getQuota().consume` in `src/index.ts`).

## Browser history (retention-aware)

The Studio saves every transformation you run to **IndexedDB** (keyed to a
per-browser user) — image id, exact params, URL, size, dimensions. On load it
rebuilds "My transforms" from that local database, and each record is checked
against `/exists/:id`: if the S3 object was removed by your retention/lifecycle
policy, the stale metadata is deleted from the browser DB automatically (and any
history thumbnail that fails to load prunes itself too).

## Project layout

```
src/
  index.ts         Hono app: routes, cache flow, quota, runtime wiring
  node.ts          Node entrypoint (@hono/node-server, .env loader)
  landing.ts       marketing landing page (/) with SEO metadata
  playground.ts    studio app (/studio) — single-file HTML
  params.ts        query parsing → normalized params + canonical cache key
  quota.ts         daily per-user transform quota
  cache.ts         MemCache LRU · TieredCache · WorkersCache · FlightPool
  utils.ts         sniffing, ids, sha1, header-only image dimensions
  brand.ts         logo SVG + favicon PNG (served at /logo.svg, /favicon.*)
  storage/fs.ts    Node: uploads + sidecars + disk cache
  storage/s3.ts    Production: S3 / R2 / MinIO (HeadObject fast path)
  storage/r2.ts    Workers: native R2 binding (+ memory fallback)
  processors/sharp.ts   sharp pipeline (Node)
  processors/wasm.ts    @jsquash pipeline (Workers)
```
