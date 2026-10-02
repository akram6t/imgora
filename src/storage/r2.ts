/** Cloudflare Workers storage: R2 bucket (or ephemeral memory fallback). */
import type { StorageAdapter, StoredImage, UploadedMeta, R2BucketLike } from "../types";

export class R2Storage implements StorageAdapter {
  constructor(private bucket: R2BucketLike) {}

  private key(id: string): string {
    return `images/${id}`;
  }

  private metaFrom(obj: { customMetadata?: Record<string, string>; size?: number; uploaded?: Date }): UploadedMeta {
    try {
      const m = JSON.parse(obj.customMetadata?.meta ?? "null");
      if (m && m.id) return m as UploadedMeta;
    } catch {
      /* fall through to reconstruct */
    }
    return {
      id: "unknown",
      type: "application/octet-stream",
      bytes: obj.size ?? 0,
      uploadedAt: (obj.uploaded ?? new Date(0)).toISOString(),
    };
  }

  async put(id: string, data: Uint8Array, meta: UploadedMeta): Promise<void> {
    await this.bucket.put(this.key(id), data, {
      httpMetadata: { contentType: meta.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { meta: JSON.stringify(meta) },
    });
  }

  async getMeta(id: string): Promise<UploadedMeta | null> {
    if (this.bucket.head) {
      const obj = await this.bucket.head(this.key(id));
      return obj ? this.metaFrom(obj) : null;
    }
    // binding without head(): fall back to a ranged get of 0 bytes
    const obj = await this.bucket.get(this.key(id));
    return obj ? this.metaFrom(obj) : null;
  }

  async get(id: string): Promise<StoredImage | null> {
    const obj = await this.bucket.get(this.key(id));
    if (!obj) return null;
    const data = new Uint8Array(await obj.arrayBuffer());
    const meta = this.metaFrom(obj);
    return { data, meta: { ...meta, id, bytes: data.byteLength } };
  }

  async remove(id: string): Promise<void> {
    await this.bucket.delete(this.key(id));
  }

  async list(): Promise<UploadedMeta[]> {
    const res = await this.bucket.list({ prefix: "images/" });
    const out: UploadedMeta[] = [];
    for (const obj of res.objects) {
      const m = this.metaFrom(obj);
      out.push({ ...m, id: obj.key.slice("images/".length), bytes: obj.size, uploadedAt: (obj.uploaded ?? new Date(0)).toISOString() });
    }
    return out.filter((m) => m.id).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
}

/** Fallback for Workers without an R2/S3 configuration (quick local wrangler dev). */
export class MemoryStorage implements StorageAdapter {
  private map = new Map<string, StoredImage>();

  async put(id: string, data: Uint8Array, meta: UploadedMeta): Promise<void> {
    this.map.set(id, { data, meta });
  }
  async getMeta(id: string): Promise<UploadedMeta | null> {
    return this.map.get(id)?.meta ?? null;
  }
  async get(id: string): Promise<StoredImage | null> {
    return this.map.get(id) ?? null;
  }
  async remove(id: string): Promise<void> {
    this.map.delete(id);
  }
  async list(): Promise<UploadedMeta[]> {
    return [...this.map.values()]
      .map((s) => s.meta)
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
}
