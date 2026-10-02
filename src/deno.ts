/**
 * Deno Deploy entrypoint — the same Hono app, third runtime:
 *   • @jsquash WASM codecs (no native sharp on Deno Deploy)
 *   • storage via the S3 adapter (Tigris / AWS / R2 / MinIO) — set env vars
 *     in the Deno Deploy dashboard: S3_BUCKET, S3_REGION, S3_ENDPOINT,
 *     AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DAILY_TRANSFORM_LIMIT
 *   • per-process memory cache (no disk, no Cache API on Deploy)
 *
 * Local run:  deno task dev        (see deno.json)
 * Deploy:     deployctl deploy --entrypoint=src/deno.ts
 *             (or connect the repo in the Deno Deploy dashboard)
 */

// Deno lacks the DOM ImageData global that the jSquash codecs construct —
// polyfill it before anything touches the processors.
const g = globalThis as unknown as {
  ImageData?: new (data: Uint8ClampedArray, width: number, height: number) => unknown;
};
if (!g.ImageData) {
  // deno-lint-ignore no-explicit-any
  g.ImageData = function (this: any, a: Uint8ClampedArray | number, b: number, c?: number) {
    if (typeof a === "number") {
      this.width = a;
      this.height = b;
      this.data = new Uint8ClampedArray(a * b * 4);
    } else {
      this.data = new Uint8ClampedArray(a);
      this.width = b;
      this.height = c as number;
    }
  } as unknown as new (
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ) => unknown;
}

const { default: app } = await import("./index.ts");

// export {} — makes this file a module so top-level await is valid
export {};

const D = (globalThis as unknown as {
  Deno?: { serve: (o: unknown, h: unknown) => void; env: { get(k: string): string | undefined } };
}).Deno;

if (D) {
  const port = Number(D.env.get("PORT") ?? 8000);
  D.serve({ port }, app.fetch);
} else {
  console.error("This entrypoint is for Deno Deploy — run `npm run dev` for Node.");
}
