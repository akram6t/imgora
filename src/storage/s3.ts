/**
 * S3 storage adapter — the production backend. Works with AWS S3 and any
 * S3-compatible service (Cloudflare R2 via S3 endpoint, MinIO, Backblaze B2,
 * Wasabi, GCS XML API...).
 *
 * Built for speed:
 *   • transform requests only need metadata → `getMeta` uses HeadObject
 *     (a few hundred bytes, no image body) and the in-process meta cache
 *     usually answers first;
 *   • the image body is fetched exactly once per transform-miss, then served
 *     from the transform cache;
 *   • objects are written immutable (`Cache-Control: immutable`) and carry
 *     the full upload metadata as S3 object Metadata;
 *   • a tiny `meta/<id>.json` sidecar object is also written because S3
 *     listings do not include user metadata (galleries stay one list + N
 *     tiny GETs, never N image downloads).
 */
import type { StorageAdapter, StoredImage, UploadedMeta } from "../types";

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  prefix: string;
}

function asStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Reads S3 config from any env-like record; null when no bucket is configured.
 *  Understands both IMGORA-native names (S3_*) and the standard AWS SDK names,
 *  including the standardized AWS_ENDPOINT_URL_S3 / AWS_ENDPOINT_URL endpoints. */
export function s3ConfigFromEnv(env: Record<string, unknown>): S3Config | null {
  const bucket = asStr(env.S3_BUCKET);
  if (!bucket) return null;
  return {
    bucket,
    region:
      asStr(env.S3_REGION) ?? asStr(env.AWS_REGION) ?? asStr(env.AWS_DEFAULT_REGION) ?? "us-east-1",
    accessKeyId: asStr(env.S3_ACCESS_KEY_ID) ?? asStr(env.AWS_ACCESS_KEY_ID),
    secretAccessKey: asStr(env.S3_SECRET_ACCESS_KEY) ?? asStr(env.AWS_SECRET_ACCESS_KEY),
    endpoint: asStr(env.S3_ENDPOINT) ?? asStr(env.AWS_ENDPOINT_URL_S3) ?? asStr(env.AWS_ENDPOINT_URL),
    prefix: asStr(env.S3_PREFIX) ?? "imgora",
  };
}

export class S3Storage implements StorageAdapter {
  private clientP: Promise<S3ClientLike> | null = null;

  constructor(private cfg: S3Config) {}

  /** Lazily-created shared client (dynamic import keeps cold starts lean). */
  private client(): Promise<S3ClientLike> {
    this.clientP ??= (async () => {
      const { S3Client } = await import("@aws-sdk/client-s3");
      return new S3Client({
        region: this.cfg.region,
        ...(this.cfg.accessKeyId && this.cfg.secretAccessKey
          ? { credentials: { accessKeyId: this.cfg.accessKeyId, secretAccessKey: this.cfg.secretAccessKey } }
          : {}), // no explicit keys → SDK default chain (IAM roles, profiles, env)
        ...(this.cfg.endpoint ? { endpoint: this.cfg.endpoint, forcePathStyle: true } : {}),
      }) as S3ClientLike;
    })();
    return this.clientP;
  }

  private dataKey(id: string): string {
    return `${this.cfg.prefix}/${id}`;
  }

  private metaKey(id: string): string {
    return `${this.cfg.prefix}-meta/${id}.json`;
  }

  private async isNotFound(e: unknown): Promise<boolean> {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    return (
      err?.name === "NotFound" ||
      err?.name === "NoSuchKey" ||
      err?.$metadata?.httpStatusCode === 404
    );
  }

  async put(id: string, data: Uint8Array, meta: UploadedMeta): Promise<void> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    await Promise.all([
      client.send(
        new PutObjectCommand({
          Bucket: this.cfg.bucket,
          Key: this.dataKey(id),
          Body: data,
          ContentType: meta.type,
          CacheControl: "public, max-age=31536000, immutable",
          Metadata: { meta: JSON.stringify(meta) },
        }),
      ),
      // sidecar for listing (S3 lists don't expose user metadata)
      client.send(
        new PutObjectCommand({
          Bucket: this.cfg.bucket,
          Key: this.metaKey(id),
          Body: JSON.stringify(meta),
          ContentType: "application/json",
        }),
      ),
    ]);
  }

  async getMeta(id: string): Promise<UploadedMeta | null> {
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: this.cfg.bucket, Key: this.dataKey(id) }),
      );
      const raw = (head.Metadata as Record<string, string> | undefined)?.meta;
      if (raw) return JSON.parse(raw) as UploadedMeta;
      // metadata missing (e.g. migrated object) — synthesize minimal meta
      return {
        id,
        type: head.ContentType ?? "application/octet-stream",
        bytes: head.ContentLength ?? 0,
        uploadedAt: (head.LastModified ?? new Date(0)).toISOString(),
      };
    } catch (e) {
      if (await this.isNotFound(e)) return null;
      throw e;
    }
  }

  async get(id: string): Promise<StoredImage | null> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    try {
      const obj = await client.send(
        new GetObjectCommand({ Bucket: this.cfg.bucket, Key: this.dataKey(id) }),
      );
      const data = new Uint8Array(await obj.Body!.transformToByteArray());
      let meta: UploadedMeta | null = null;
      const raw = (obj.Metadata as Record<string, string> | undefined)?.meta;
      if (raw) meta = JSON.parse(raw) as UploadedMeta;
      return {
        data,
        meta:
          meta ?? {
            id,
            type: obj.ContentType ?? "application/octet-stream",
            bytes: data.byteLength,
            uploadedAt: (obj.LastModified ?? new Date(0)).toISOString(),
          },
      };
    } catch (e) {
      if (await this.isNotFound(e)) return null;
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    await Promise.all([
      client.send(new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: this.dataKey(id) })),
      client.send(new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: this.metaKey(id) })),
    ]);
  }

  async list(): Promise<UploadedMeta[]> {
    const { ListObjectsV2Command, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    const keys: { key: string; size: number; lastModified?: Date }[] = [];
    let token: string | undefined;
    do {
      const page = await client.send(
        new ListObjectsV2Command({
          Bucket: this.cfg.bucket,
          Prefix: `${this.cfg.prefix}-meta/`,
          MaxKeys: 1000,
          ContinuationToken: token,
        }),
      );
      for (const obj of page.Contents ?? []) {
        if (obj.Key) keys.push({ key: obj.Key, size: obj.Size ?? 0, lastModified: obj.LastModified });
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    const metas = await Promise.all(
      keys.map(async ({ key, size, lastModified }) => {
        const id = key.slice(`${this.cfg.prefix}-meta/`.length).replace(/\.json$/, "");
        try {
          const obj = await client.send(
            new GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
          );
          return JSON.parse(await obj.Body!.transformToByteArray().then((b) => new TextDecoder().decode(b))) as UploadedMeta;
        } catch {
          return {
            id,
            type: "application/octet-stream",
            bytes: size,
            uploadedAt: (lastModified ?? new Date(0)).toISOString(),
          } satisfies UploadedMeta;
        }
      }),
    );
    return metas
      .filter((m) => m.id)
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }
}

/** Structural subset we rely on (keeps this file decoupled from SDK typings). */
interface S3ClientLike {
  send(command: unknown): Promise<{
    Metadata?: Record<string, string>;
    ContentType?: string;
    ContentLength?: number;
    LastModified?: Date;
    Body?: { transformToByteArray(): Promise<Uint8Array> };
    Contents?: { Key?: string; Size?: number; LastModified?: Date }[];
    IsTruncated?: boolean;
    NextContinuationToken?: string;
  }>;
}
