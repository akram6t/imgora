import type { EffectiveParams, OutputFormat } from "./types";

/**
 * Parses URL query params into a normalized, fully-defaulted transform spec.
 *
 * The returned `canonical` string is the deterministic cache key: two URLs that
 * produce the same pixels always yield the same canonical string (order of
 * params, aliases and explicit defaults don't matter), so
 *   /t/id?w=300&h=200  and  /t/id?h=200&w=300&q=80
 * share one cache entry.
 */

const OUT_FORMATS: Set<string> = new Set(["jpeg", "jpg", "png", "webp", "avif"]);
const FITS: Set<string> = new Set(["cover", "contain", "fill", "inside", "outside"]);

function first(sp: Record<string, string>, names: string[]): string | null {
  for (const n of names) {
    const v = sp[n];
    if (v !== undefined && v !== "") return v;
  }
  return null;
}

function int(
  sp: Record<string, string>,
  names: string[],
  min: number,
  max: number,
): number | null {
  const raw = first(sp, names);
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(max, Math.max(min, n));
}

function bool(v: string | null): boolean {
  return v === "1" || v === "true" || v === "yes";
}

/** Effect amounts 0-100; legacy boolean values ("1"/"true") mean 100. */
function amount(v: string | null): number | null {
  if (v === null || v === "") return null;
  if (v === "1" || v === "true" || v === "yes") return 100;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}

/** f=auto picks avif/webp by the client's Accept header. */
function resolveAuto(accept: string | null, sourceFormat: string | null): OutputFormat {
  const a = (accept ?? "").toLowerCase();
  if (a.includes("image/avif")) return "avif";
  if (a.includes("image/webp")) return "webp";
  if (sourceFormat === "jpeg" || sourceFormat === "png" || sourceFormat === "webp") {
    return sourceFormat;
  }
  return "webp";
}

export function parseParams(
  sp: Record<string, string>,
  accept: string | null,
  sourceFormat: string | null,
): EffectiveParams {
  const rawFmt = (first(sp, ["f", "fmt"]) ?? "auto").toLowerCase();
  const normalizedFmt = rawFmt === "jpg" ? "jpeg" : rawFmt;
  // an explicit f= is a conversion request; absent f= is just browser negotiation
  const fmtExplicit = first(sp, ["f", "fmt"]) !== null;
  const fmt: OutputFormat =
    rawFmt === "auto"
      ? resolveAuto(accept, sourceFormat)
      : OUT_FORMATS.has(normalizedFmt)
        ? (normalizedFmt as OutputFormat)
        : "webp";

  const q = int(sp, ["q", "quality"], 1, 100) ?? 80;
  const w = int(sp, ["w", "width"], 1, 8192);
  const h = int(sp, ["h", "height"], 1, 8192);
  const fitRaw = (first(sp, ["fit", "crop"]) ?? "cover").toLowerCase();
  const fit = (FITS.has(fitRaw) ? fitRaw : "cover") as EffectiveParams["fit"];
  const bg = first(sp, ["bg", "b"]);
  const cw = int(sp, ["cw", "cropw"], 1, 8192);
  const ch = int(sp, ["ch", "croph"], 1, 8192);
  const bright = int(sp, ["bright", "brightness"], 1, 200) ?? 100;
  const sat = int(sp, ["sat", "saturation"], 0, 200) ?? 100;
  const hue = int(sp, ["hue"], -180, 180) ?? 0;
  const blurRaw = first(sp, ["blur"]);
  const blur = blurRaw === null ? 0 : Math.min(100, Math.max(0.3, Number(blurRaw) || 0));

  const rawCs = (first(sp, ["cs", "subsampling"]) ?? "420").toLowerCase();
  const cs: "420" | "444" = rawCs === "444" ? "444" : "420";
  const level = int(sp, ["level", "zlevel"], 0, 9) ?? 6;
  const pqual = int(sp, ["pqual", "palettequality"], 1, 100) ?? 80;

  const p: EffectiveParams = {
    w,
    h,
    fit,
    bg: bg && /^#?[0-9a-fA-F]{3,8}$/.test(bg) ? (bg.startsWith("#") ? bg : "#" + bg) : null,
    x: int(sp, ["x", "left"], 0, 8191) ?? 0,
    y: int(sp, ["y", "top"], 0, 8191) ?? 0,
    cw: cw !== null && ch !== null ? cw : null,
    ch: cw !== null && ch !== null ? ch : null,
    q,
    fmt,
    prog: bool(first(sp, ["prog", "progressive"])),
    moz: bool(first(sp, ["moz", "mozjpeg"])),
    cs,
    effort: int(sp, ["effort", "method"], 0, 9),
    lossless: bool(first(sp, ["lossless", "ll"])),
    level,
    palette: bool(first(sp, ["palette"])),
    pqual,
    rot: int(sp, ["rot", "rotate", "a"], 0, 359) ?? 0,
    flip: bool(first(sp, ["flip", "vflip"])),
    flop: bool(first(sp, ["flop", "hflip"])),
    gray: amount(first(sp, ["gray", "grayscale", "g"])) ?? 0,
    neg: amount(first(sp, ["neg", "negate", "invert"])) ?? 0,
    bright,
    sat,
    hue,
    blur,
    sharpen: amount(first(sp, ["sharpen", "sh"])) ?? 0,
    download: bool(first(sp, ["download", "dl"])),
    meta: bool(first(sp, ["meta", "info"])),
    orig: bool(first(sp, ["orig", "original"])),
    canonical: "",
  };

  // canonical = every pixel-affecting field that differs from its default,
  // sorted for determinism. Delivery-only flags are excluded.
  const parts: string[] = [];
  if (p.w !== null) parts.push(`w=${p.w}`);
  if (p.h !== null) parts.push(`h=${p.h}`);
  if (p.fit !== "cover") parts.push(`fit=${p.fit}`);
  if (p.bg !== null) parts.push(`bg=${p.bg.slice(1)}`);
  if (p.x !== 0) parts.push(`x=${p.x}`);
  if (p.y !== 0) parts.push(`y=${p.y}`);
  if (p.cw !== null) parts.push(`cw=${p.cw}`, `ch=${p.ch}`);
  // format only counts as a transform when explicitly requested AND it actually
  // converts — bare /t/<id> stays a passthrough even though the browser's
  // Accept header resolves f=auto to avif/webp (docs promise this, and it
  // keeps the editor's first load free of a pointless full re-encode)
  if (fmtExplicit && p.fmt !== sourceFormat) parts.push(`f=${p.fmt}`);
  if (p.q !== 80) parts.push(`q=${p.q}`);
  if (p.prog) parts.push(`prog=1`);
  if (p.moz) parts.push(`moz=1`);
  if (p.cs !== "420") parts.push(`cs=${p.cs}`);
  if (p.effort !== null) parts.push(`effort=${p.effort}`);
  if (p.lossless) parts.push(`lossless=1`);
  if (p.level !== 6) parts.push(`level=${p.level}`);
  if (p.palette) parts.push(`palette=1`, `pqual=${p.pqual}`);
  if (p.rot !== 0) parts.push(`rot=${p.rot}`);
  if (p.flip) parts.push(`flip=1`);
  if (p.flop) parts.push(`flop=1`);
  if (p.gray > 0) parts.push(`gray=${p.gray}`);
  if (p.neg > 0) parts.push(`neg=${p.neg}`);
  if (p.bright !== 100) parts.push(`bright=${p.bright}`);
  if (p.sat !== 100) parts.push(`sat=${p.sat}`);
  if (p.hue !== 0) parts.push(`hue=${p.hue}`);
  if (p.blur > 0) parts.push(`blur=${p.blur}`);
  if (p.sharpen > 0) parts.push(`sharpen=${p.sharpen}`);
  p.canonical = parts.sort().join("&");

  // Nothing to do — the transform output would equal the original bytes.
  if (p.canonical === "") p.orig = true;
  return p;
}
