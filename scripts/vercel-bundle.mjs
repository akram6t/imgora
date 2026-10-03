/** Vercel build step: bundle the serverless entry into one self-contained
 *  CJS file. Vercel's per-file TypeScript transpile emits extension-less ESM
 *  imports that Node cannot resolve, so we bypass it entirely.
 *  Externals stay in node_modules: sharp (native binary) and the AWS SDK. */
import { build } from "esbuild";

await build({
  entryPoints: ["src/vercel.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  outfile: "api/index.js",
  external: [
    "sharp",
    "@aws-sdk/*",
    // Workers-only module: keeps its static .wasm imports out of this bundle.
    // Never reached on Vercel (isWorkers is false), so a runtime-relative
    // require is fine even though the file itself is not shipped compiled.
    "./processors/wasm",
  ],
  logLevel: "info",
});
