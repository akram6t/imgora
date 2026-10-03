/** Vercel serverless entrypoint — Node runtime: sharp + S3 storage.
 *  Bundled by scripts/vercel-bundle.mjs into a single api/index.js (CJS) at
 *  deploy time; vercel.json legacy routes send every request here while
 *  preserving the original path.
 *
 *  This is an explicit Node-style handler (IncomingMessage → ServerResponse)
 *  rather than hono/vercel's Web-standard adapter: Vercel's handler-mode
 *  detection does not engage for the bundled CJS export, which leaves the
 *  response unwritten and the invocation times out. */
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./index";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost";
  const url = `${proto}://${host}${req.url}`;
  const method = req.method || "GET";
  const hasBody = method !== "GET" && method !== "HEAD";

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) for (const vv of v) headers.append(k, vv);
  }

  let body: Buffer | undefined;
  if (hasBody) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    body = Buffer.concat(chunks);
  }

  // Buffer is a Uint8Array and accepted at runtime; the DOM lib type for
  // BodyInit just doesn't model it.
  const webRes = await app.fetch(
    new Request(url, { method, headers, body: body as unknown as BodyInit }),
  );

  res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
  if (webRes.body) {
    const reader = webRes.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  }
  res.end();
}
