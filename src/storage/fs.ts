/** Node-runtime storage: uploads + metadata sidecars + disk cache, all local. */
import { promises as fs } from "node:fs";
import type { ImageCache, CacheEntry } from "../cache";
import type { StorageAdapter, StoredImage, UploadedMeta } from "../types";

export class FsStorage implements StorageAdapter {
  private readonly uploadsDir: string;
  private readonly metaDir: string;
  private readonly ready: Promise<unknown>;

  constructor(root: string) {
    this.uploadsDir = `${root}/uploads`;
    this.metaDir = `${root}/meta`;
    this.ready = Promise.all([
      fs.mkdir(this.uploadsDir, { recursive: true }),
      fs.mkdir(this.metaDir, { recursive: true }),
    ]);
  }

  async put(id: string, data: Uint8Array, meta: UploadedMeta): Promise<void> {
    await this.ready;
    await fs.writeFile(`${this.uploadsDir}/${id}`, data);
    await fs.writeFile(`${this.metaDir}/${id}.json`, JSON.stringify(meta));
  }

  async getMeta(id: string): Promise<UploadedMeta | null> {
    await this.ready;
    try {
      return JSON.parse(await fs.readFile(`${this.metaDir}/${id}.json`, "utf8")) as UploadedMeta;
    } catch {
      return null;
    }
  }

  async get(id: string): Promise<StoredImage | null> {
    await this.ready;
    try {
      const [data, metaRaw] = await Promise.all([
        fs.readFile(`${this.uploadsDir}/${id}`),
        fs.readFile(`${this.metaDir}/${id}.json`, "utf8"),
      ]);
      return { data: new Uint8Array(data), meta: JSON.parse(metaRaw) as UploadedMeta };
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<void> {
    await this.ready;
    await Promise.allSettled([
      fs.rm(`${this.uploadsDir}/${id}`, { force: true }),
      fs.rm(`${this.metaDir}/${id}.json`, { force: true }),
    ]);
  }

  async list(): Promise<UploadedMeta[]> {
    await this.ready;
    try {
      const files = await fs.readdir(this.metaDir);
      const metas = await Promise.all(
        files
          .filter((f) => f.endsWith(".json"))
          .map((f) =>
            fs
              .readFile(`${this.metaDir}/${f}`, "utf8")
              .then((s) => JSON.parse(s) as UploadedMeta)
              .catch(() => null),
          ),
      );
      return metas
        .filter((m): m is UploadedMeta => m !== null)
        .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    } catch {
      return [];
    }
  }
}

/** Write-through disk cache: <sha1(key)>.bin next to <sha1(key)>.json */
export class DiskCache implements ImageCache {
  private readonly ready: Promise<unknown>;

  constructor(dir: string) {
    this.ready = fs.mkdir(dir, { recursive: true });
    this.dir = dir;
  }

  private dir: string;

  private paths(key: string) {
    // key is already a hash-safe canonical string, but hash anyway for flat dirs
    const name = key.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
    return { bin: `${this.dir}/${name}.bin`, json: `${this.dir}/${name}.json` };
  }

  async get(key: string): Promise<CacheEntry | null> {
    await this.ready;
    const { bin, json } = this.paths(key);
    try {
      const [data, metaRaw] = await Promise.all([
        fs.readFile(bin),
        fs.readFile(json, "utf8"),
      ]);
      const meta = JSON.parse(metaRaw) as { type: string; etag: string; width?: number; height?: number };
      return {
        data: new Uint8Array(data),
        type: meta.type,
        etag: meta.etag,
        width: meta.width,
        height: meta.height,
      };
    } catch {
      return null;
    }
  }

  async put(key: string, entry: CacheEntry): Promise<void> {
    await this.ready;
    const { bin, json } = this.paths(key);
    await fs.writeFile(bin, entry.data);
    await fs.writeFile(
      json,
      JSON.stringify({ type: entry.type, etag: entry.etag, width: entry.width, height: entry.height }),
    );
  }
}
