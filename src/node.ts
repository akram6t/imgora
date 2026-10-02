/** Local dev entrypoint — Node runtime: sharp + filesystem or S3 storage. */
import { serve } from "@hono/node-server";
import app from "./index";
import { readFileSync, existsSync } from "node:fs";

/** Minimal .env loader (no dependency). Existing process env always wins. */
function loadDotEnv(path = ".env"): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}
loadDotEnv();

const port = Number(process.env.PORT || 3000);
serve({ fetch: app.fetch, port }, (info) => {
  const storage = process.env.S3_BUCKET ? `s3:${process.env.S3_BUCKET}` : "filesystem";
  console.log("");
  console.log("  ▶ imgora (node runtime · sharp · " + storage + ")");
  console.log(`  ▶ Landing    : http://localhost:${info.port}/`);
  console.log(`  ▶ Studio     : http://localhost:${info.port}/studio`);
  console.log(`  ▶ Upload     : POST http://localhost:${info.port}/upload  (multipart field "file")`);
  console.log("  ▶ Transform  : /t/:id?w=400&h=300&fit=cover&q=80&f=webp");
  console.log("");
});
