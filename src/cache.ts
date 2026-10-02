/**
 * Cache layers, fast path first:
 *   1. MemCache      — process-wide LRU, serves repeat URLs with zero I/O
 *   2. TieredCache   — mem + pluggable backend (disk on Node, Cache API on Workers)
 *   3. WorkersCache  — Cloudflare Cache API (edge cache)
 * On top of this, every response is sent immutable with an ETag so browsers
 * and CDNs never re-fetch.
 */

export interface CacheEntry {
  data: Uint8Array;
  type: string;
  etag: string;
  width?: number;
  height?: number;
}

export interface ImageCache {
  get(key: string): Promise<CacheEntry | null>;
  put(key: string, entry: CacheEntry): Promise<void>;
}

export class MemCache implements ImageCache {
  private map = new Map<string, CacheEntry>();
  private bytes = 0;

  constructor(
    private maxEntries = 128,
    private maxBytes = 256 * 1024 * 1024,
  ) {}

  get(key: string): Promise<CacheEntry | null> {
    const e = this.map.get(key);
    if (!e) return Promise.resolve(null);
    // refresh recency
    this.map.delete(key);
    this.map.set(key, e);
    return Promise.resolve(e);
  }

  put(key: string, entry: CacheEntry): Promise<void> {
    const prev = this.map.get(key);
    if (prev) this.bytes -= prev.data.byteLength;
    this.map.delete(key);
    this.map.set(key, entry);
    this.bytes += entry.data.byteLength;
    while (
      this.map.size > 1 &&
      (this.map.size > this.maxEntries || this.bytes > this.maxBytes)
    ) {
      const oldest = this.map.keys().next().value as string;
      const old = this.map.get(oldest);
      this.bytes -= old ? old.data.byteLength : 0;
      this.map.delete(oldest);
    }
    return Promise.resolve();
  }
}

/** LRU memory + any durable backend; promotes backend hits into memory. */
export class TieredCache implements ImageCache {
  constructor(
    private mem: MemCache,
    private backends: ImageCache[] = [],
  ) {}

  async get(key: string): Promise<CacheEntry | null> {
    const hit = await this.mem.get(key);
    if (hit) return hit;
    for (const backend of this.backends) {
      const e = await backend.get(key);
      if (e) {
        await this.mem.put(key, e);
        return e;
      }
    }
    return null;
  }

  async put(key: string, entry: CacheEntry): Promise<void> {
    await this.mem.put(key, entry);
    await Promise.all(this.backends.map((b) => b.put(key, entry).catch(() => {})));
  }
}

/**
 * In-flight de-duplication ("single flight"): N concurrent requests for the
 * same transform share one decode/encode pipeline instead of racing.
 */
export class FlightPool {
  private inflight = new Map<string, Promise<unknown>>();

  async run<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;
    const p = fn().finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }
}

/** Cloudflare Cache API backend (per-origin, keyed by synthetic URL). */
export class WorkersCache implements ImageCache {
  private edge: Cache;

  constructor(private origin: string) {
    // DOM's CacheStorage lib type lacks `.default` — Workers-specific API
    this.edge = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  }

  private req(key: string): Request {
    return new Request(`${this.origin}/__imagecache/${encodeURIComponent(key)}`);
  }

  async get(key: string): Promise<CacheEntry | null> {
    const res = await this.edge.match(this.req(key));
    if (!res) return null;
    const data = new Uint8Array(await res.arrayBuffer());
    return {
      data,
      type: res.headers.get("content-type") ?? "application/octet-stream",
      etag: (res.headers.get("x-etag") ?? "").replace(/"/g, ""),
    };
  }

  async put(key: string, entry: CacheEntry): Promise<void> {
    const res = new Response(new Uint8Array(entry.data), {
      headers: {
        "content-type": entry.type,
        "x-etag": `"${entry.etag}"`,
        "cache-control": "public, max-age=31536000",
      },
    });
    await this.edge.put(this.req(key), res);
  }
}
