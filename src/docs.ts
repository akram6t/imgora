/** Documentation page served at "/docs" — full attribute reference, recipes,
 *  multi-language code samples. %ORIGIN% replaced at request time.
 *  NOTE: content must not contain backticks or ${ — it lives in a TS template literal. */
export const DOCS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0e14">
<title>Imgora Docs — Image Transform API Reference &amp; Query Parameter Guide</title>
<meta name="description" content="Complete reference for every Imgora query parameter: resize, fit modes, crop, WebP/AVIF compression, effects, delivery options — with use cases and code samples for cURL, JavaScript, axios, Python and Go.">
<meta name="keywords" content="imgora docs, image transform api reference, url query parameters image, axios image upload, image api use cases">
<meta name="robots" content="index, follow">
<link rel="canonical" href="%ORIGIN%/docs">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
<link rel="manifest" href="/manifest.webmanifest">

<meta property="og:type" content="article">
<meta property="og:site_name" content="Imgora">
<meta property="og:title" content="Imgora Docs — Image Transform API Reference">
<meta property="og:description" content="Every query parameter explained with use cases and code samples in cURL, JavaScript, axios, Python and Go.">
<meta property="og:url" content="%ORIGIN%/docs">
<meta property="og:image" content="%ORIGIN%/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Imgora Docs — Image Transform API Reference">
<meta name="twitter:description" content="Every query parameter explained with use cases and code samples.">
<meta name="twitter:image" content="%ORIGIN%/og.png">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Imgora", "item": "%ORIGIN%/" },
    { "@type": "ListItem", "position": 2, "name": "Docs", "item": "%ORIGIN%/docs" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "name": "Imgora Docs — Image Transform API Reference",
  "headline": "Complete reference for every Imgora query parameter: resize, fit modes, crop, compression, effects and code samples",
  "description": "Full API reference for the Imgora image transformation service: URL query parameters for resize, crop, WebP/AVIF compression, effects and delivery, with code examples in cURL, JavaScript, axios, Python and Go.",
  "url": "%ORIGIN%/docs",
  "inLanguage": "en",
  "about": { "@type": "SoftwareApplication", "name": "Imgora", "applicationCategory": "DeveloperApplication" }
}
</script>
<style>
  :root {
    --bg: #0b0e14; --panel: #11151f; --panel2: #161b28; --border: #232a3a;
    --text: #e6e9f0; --muted: #8b93a7; --accent: #6366f1; --accent2: #a855f7;
    --green: #34d399; --amber: #fbbf24; --code: #9fb0d0;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 14.5px/1.65 system-ui, -apple-system, "Segoe UI", sans-serif; }
  a { color: inherit; text-decoration: none; }
  code { background: #0d1019; border: 1px solid var(--border); border-radius: 6px;
    padding: 1px 7px; font: 12.5px ui-monospace, monospace; color: var(--code); }
  pre { background: #0d1019; border: 1px solid var(--border); border-radius: 12px;
    padding: 18px 20px; overflow: auto; font: 12.5px/1.75 ui-monospace, monospace;
    color: var(--code); margin: 0; }
  pre .c { color: #566080; } pre .g { color: var(--green); }
  pre .a { color: var(--amber); } pre .k { color: var(--accent2); }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

  nav { position: sticky; top: 0; z-index: 10; background: rgba(11, 14, 20, .85);
    backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
  nav .inner { display: flex; align-items: center; gap: 22px; height: 62px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; }
  .brand svg { width: 28px; height: 28px; border-radius: 7px; display: block; }
  nav .links { display: flex; gap: 20px; margin-left: 12px; color: var(--muted); font-size: 14px; }
  nav .links a:hover { color: var(--text); }
  .btn { display: inline-flex; align-items: center; border-radius: 10px; padding: 9px 17px;
    font: inherit; font-weight: 600; cursor: pointer; border: 1px solid var(--border);
    background: var(--panel2); color: var(--text); transition: .15s; }
  .btn:hover { border-color: var(--accent); }
  .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; box-shadow: 0 6px 22px rgba(124, 58, 237, .3); }
  nav .cta { margin-left: auto; }

  .docs { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 36px; padding: 34px 0 70px; }
  @media (max-width: 940px) { .docs { grid-template-columns: 1fr; } .sidebar { display: none; } }
  .sidebar { position: sticky; top: 86px; align-self: start; }
  .sidebar a { display: block; color: var(--muted); font-size: 13px; padding: 5px 10px;
    border-left: 2px solid var(--border); transition: .12s; }
  .sidebar a:hover { color: var(--text); border-color: var(--accent); }
  .sidebar .grp { font-size: 10.5px; text-transform: uppercase; letter-spacing: .12em;
    color: #566080; margin: 16px 0 4px 10px; }

  h1 { font-size: 32px; margin: 8px 0 10px; letter-spacing: -.01em; }
  h2 { font-size: 23px; margin: 52px 0 6px; padding-top: 14px; letter-spacing: -.01em; }
  h2:first-of-type { margin-top: 0; }
  .lead { color: var(--muted); font-size: 15px; margin: 0 0 22px; }
  h3 { font-size: 16.5px; margin: 30px 0 8px; }
  p { margin: 0 0 12px; }
  .mut { color: var(--muted); font-size: 13px; }

  table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13.5px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--border);
    vertical-align: top; }
  th { color: var(--muted); font-size: 11.5px; text-transform: uppercase; letter-spacing: .1em; }
  td.p { font: 12.5px ui-monospace, monospace; color: #c7d2fe; white-space: nowrap; }
  td.d { color: var(--muted); white-space: nowrap; }

  .uc { background: linear-gradient(135deg, rgba(99, 102, 241, .07), rgba(168, 85, 247, .07));
    border: 1px solid rgba(124, 58, 237, .25); border-left: 3px solid var(--accent);
    border-radius: 10px; padding: 10px 14px; margin: 10px 0 18px; font-size: 13px; color: var(--muted); }
  .uc b { color: var(--text); }

  .fitgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0 20px; }
  @media (max-width: 700px) { .fitgrid { grid-template-columns: 1fr; } }
  .fit { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 13px 16px; }
  .fit code { color: #fff; }
  .fit p { margin: 6px 0 0; font-size: 12.5px; color: var(--muted); }
  .fit .use { color: #9fb0d0; }

  .tabs { margin: 14px 0 22px; }
  .tabbtns { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: -1px; }
  .tabbtn { background: var(--panel); border: 1px solid var(--border); border-bottom: none;
    color: var(--muted); font: 12.5px ui-monospace, monospace; padding: 8px 14px;
    border-radius: 9px 9px 0 0; cursor: pointer; }
  .tabbtn.on { color: #fff; background: #0d1019; border-color: var(--border);
    box-shadow: inset 0 2px 0 var(--accent); }
  .pane { display: none; }
  .pane.on { display: block; }

  .recipes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
  @media (max-width: 760px) { .recipes { grid-template-columns: 1fr; } }
  .recipe { background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
    padding: 15px 17px; cursor: pointer; transition: .15s; }
  .recipe:hover { border-color: var(--accent); transform: translateY(-2px); }
  .recipe h4 { margin: 0 0 4px; font-size: 14px; }
  .recipe p { margin: 0 0 9px; font-size: 12.5px; color: var(--muted); }
  .recipe code { display: block; overflow: auto; white-space: nowrap; font-size: 11.5px; }

  footer { border-top: 1px solid var(--border); padding: 24px 0 36px; color: var(--muted);
    font-size: 13px; margin-top: 40px; }
  footer .inner { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
  footer .right { margin-left: auto; }
</style>
</head>
<body>

<nav>
  <div class="wrap inner">
    <a class="brand" href="/">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg)"/><rect x="26.5" y="10.5" width="11" height="11" rx="2.5" transform="rotate(45 32 16)" fill="#fff"/><rect x="27" y="25" width="10" height="25" rx="5" fill="#fff"/><rect x="43" y="43" width="8" height="8" rx="2" transform="rotate(45 47 47)" fill="#fff" opacity=".5"/></svg>
      imgora
    </a>
    <div class="links">
      <a href="/#features">Features</a>
      <a href="/#how">How it works</a>
      <a href="/docs">Docs</a>
    </div>
    <a class="btn primary cta" href="/studio">Open Studio →</a>
  </div>
</nav>

<div class="wrap docs">
  <aside class="sidebar">
    <div class="grp">Start</div>
    <a href="#upload">Upload an image</a>
    <a href="#transform">Transform by URL</a>
    <div class="grp">Query parameters</div>
    <a href="#geometry">Geometry — w, h, fit, bg</a>
    <a href="#crop">Crop region — x, y, cw, ch</a>
    <a href="#format">Format — f</a>
    <a href="#compression">Compression — q &amp; friends</a>
    <a href="#effects">Effects</a>
    <a href="#delivery">Delivery</a>
    <div class="grp">Reference</div>
    <a href="#headers">Response headers</a>
    <a href="#endpoints">Endpoints</a>
    <a href="#caching">Caching</a>
    <a href="#quota">Quota</a>
    <div class="grp">Examples</div>
    <a href="#recipes">Use-case recipes</a>
    <a href="#code">Code samples</a>
  </aside>

  <main>
    <h1>Docs &amp; API reference</h1>
    <p class="lead">Everything an image URL can do. Upload once, then request any variant by
    adding query parameters to <code>/t/&lt;id&gt;</code>. Parameters are order-independent,
    fully cacheable, and identical combinations always produce identical bytes.</p>

    <h2 id="upload">Upload an image</h2>
    <p>Three ways to upload — all return JSON with an <code>id</code>, the original
    <code>rawUrl</code> and a <code>transformUrl</code> base. Max size 10 MB; the type is
    verified from magic bytes (jpeg, png, webp, gif, avif, tiff).</p>
<pre><span class="c"># multipart (recommended)</span>
<span class="g">curl -F "file=@photo.jpg" %ORIGIN%/upload</span>

<span class="c"># raw body — just send the bytes with a matching Content-Type</span>
<span class="g">curl --data-binary @photo.jpg -H "Content-Type: image/jpeg" %ORIGIN%/upload</span>

<span class="c"># fetch from a remote URL (server-side download)</span>
<span class="g">curl -H "Content-Type: application/json" -d '{"url":"https://example.com/photo.jpg"}' %ORIGIN%/upload</span></pre>
    <p class="mut">Response: <code>{ "id": "a1b2c3", "width": 2400, "height": 1500, "format": "jpeg",
    "rawUrl": "…/raw/a1b2c3", "transformUrl": "…/t/a1b2c3" }</code> — dimensions are parsed from
    file headers, so uploads stay instant even for huge images.</p>

    <h2 id="transform">Transform by URL</h2>
    <p>Every variant is a GET on <code>/t/&lt;id&gt;</code> plus query parameters. You can also
    append a friendly extension — <code>/t/a1b2c3.webp</code> — it is ignored and purely cosmetic.
    With no parameters the original bytes pass through untouched.</p>
<pre><span class="g">/t/a1b2c3?w=640&amp;h=400&amp;fit=cover&amp;q=75&amp;f=webp</span>   <span class="c"># cover-crop 640×400 webp</span>
<span class="g">/t/a1b2c3?w=1920&amp;f=avif&amp;sharpen=1</span>              <span class="c"># max-width, modern format</span>
<span class="g">/t/a1b2c3?w=400&amp;gray=1&amp;q=80</span>                    <span class="c"># grayscale 400px</span></pre>

    <h2 id="geometry">Geometry — <code>w</code>, <code>h</code>, <code>fit</code>, <code>bg</code></h2>
    <table>
      <tr><th>Param</th><th>Values (default)</th><th>Description</th></tr>
      <tr><td class="p">w</td><td class="d">1–8192 px</td><td>Target width. The image is never upscaled — larger sources stay sharp.</td></tr>
      <tr><td class="p">h</td><td class="d">1–8192 px</td><td>Target height. Give both to define a box; <code>fit</code> decides how it is filled.</td></tr>
      <tr><td class="p">bg</td><td class="d">hex, e.g. <code>ffffff</code></td><td>Background color for letterboxing, rotation and JPEG flatten. No <code>#</code> needed.</td></tr>
    </table>

    <h3>Fit modes — how the box gets filled</h3>
    <div class="fitgrid">
      <div class="fit"><code>fit=cover</code> <span class="mut">(default)</span>
        <p>Fills the box completely, center-crops the overflow. <span class="use">Use for: avatars, cards, thumbnails — any fixed frame.</span></p></div>
      <div class="fit"><code>fit=contain</code>
        <p>Fits inside the box and pads the rest with <code>bg</code>. <span class="use">Use for: product shots on a white canvas.</span></p></div>
      <div class="fit"><code>fit=fill</code>
        <p>Stretches to exactly the requested size, ignoring aspect. <span class="use">Use for: banners where exact pixels matter more than proportions.</span></p></div>
      <div class="fit"><code>fit=inside</code>
        <p>Largest size that fits within the box, aspect preserved, no padding. <span class="use">Use for: "max 1600px wide" constraints.</span></p></div>
      <div class="fit"><code>fit=outside</code>
        <p>Covers the box without cropping (may exceed a dimension), then clamps. <span class="use">Use for: background sheets to crop client-side.</span></p></div>
    </div>
    <div class="uc"><b>Use case — responsive avatar:</b> <code>?w=256&amp;h=256&amp;fit=cover&amp;q=80&amp;f=webp</code>
    — square frame, faces stay centered because cover crops from the middle.</div>

    <h2 id="crop">Crop region — <code>x</code>, <code>y</code>, <code>cw</code>, <code>ch</code></h2>
    <table>
      <tr><th>Param</th><th>Values</th><th>Description</th></tr>
      <tr><td class="p">x, y</td><td class="d">px from top-left</td><td>Top-left corner of the crop region.</td></tr>
      <tr><td class="p">cw, ch</td><td class="d">px (both required)</td><td>Crop width and height. Applied <b>before</b> resize/fit.</td></tr>
    </table>
    <div class="uc"><b>Use case — crop a face out of a group photo:</b>
    <code>?x=420&amp;y=120&amp;cw=600&amp;ch=600&amp;w=256&amp;fit=cover</code> — carve the region first, then resize it.</div>

    <h2 id="format">Format — <code>f</code></h2>
    <table>
      <tr><th>Param</th><th>Values (default)</th><th>Description</th></tr>
      <tr><td class="p">f / fmt</td><td class="d">auto · webp · avif · jpeg · png</td><td>Output format. <code>auto</code> reads the browser's Accept header and picks AVIF, else WebP, else the source format — every user gets the smallest file their browser supports, and each format is cached separately.</td></tr>
    </table>
    <div class="uc"><b>Use case:</b> leave <code>f</code> off entirely for HTML <code>&lt;img&gt;</code> tags
    (browsers advertise support), and set <code>f=webp</code> explicitly for API responses where the
    Accept header is missing.</div>

    <h2 id="compression">Compression — <code>q</code> and friends</h2>
    <table>
      <tr><th>Param</th><th>Applies to</th><th>Values (default)</th><th>Description</th></tr>
      <tr><td class="p">q</td><td>all (except lossless/png)</td><td class="d">1–100 (80)</td><td>Encoder quality. 60–80 is the sweet spot for photos.</td></tr>
      <tr><td class="p">moz</td><td>jpeg</td><td class="d">flag</td><td>MozJPEG-tuned encoder — smaller files at the same quality, slightly slower.</td></tr>
      <tr><td class="p">cs</td><td>jpeg</td><td class="d">420 · 444 (420)</td><td>Chroma subsampling. 4:4:4 keeps color detail — logos, screenshots, red text.</td></tr>
      <tr><td class="p">prog</td><td>jpeg, png</td><td class="d">flag</td><td>Progressive encoding — images sharpen gradually while loading.</td></tr>
      <tr><td class="p">effort</td><td>webp, avif</td><td class="d">0–9 (webp 4, avif 3)</td><td>Encoder effort. Higher = smaller/slower. 0 gives near-instant encodes.</td></tr>
      <tr><td class="p">lossless</td><td>webp, avif</td><td class="d">flag</td><td>Bit-perfect output. <code>q</code> is ignored.</td></tr>
      <tr><td class="p">level</td><td>png</td><td class="d">0–9 (6)</td><td>Zlib compression level — 9 squeezes hardest, 0 is fastest.</td></tr>
      <tr><td class="p">palette</td><td>png</td><td class="d">flag</td><td>8-bit palette quantization — massive savings for flat art, icons, screenshots.</td></tr>
      <tr><td class="p">pqual</td><td>png (with palette)</td><td class="d">1–100 (80)</td><td>Palette quality.</td></tr>
    </table>
    <div class="uc"><b>Use case — maximum squeeze for photos:</b> <code>?q=40&amp;f=webp&amp;effort=6</code>.
    <b>Icons &amp; flat art:</b> <code>?f=png&amp;palette=1&amp;pqual=60&amp;level=9</code>.
    <b>Print-quality JPEG:</b> <code>?f=jpeg&amp;moz=1&amp;cs=444&amp;q=90&amp;prog=1</code>.</div>

    <h2 id="effects">Effects</h2>
    <table>
      <tr><th>Param</th><th>Values (default)</th><th>Description</th></tr>
      <tr><td class="p">rot</td><td class="d">0–359 (0)</td><td>Rotate clockwise. Background corners are filled with <code>bg</code>.</td></tr>
      <tr><td class="p">flip</td><td class="d">flag</td><td>Mirror vertically (upside-down).</td></tr>
      <tr><td class="p">flop</td><td class="d">flag</td><td>Mirror horizontally.</td></tr>
      <tr><td class="p">gray</td><td class="d">0–100</td><td>Desaturation amount — <code>gray=100</code> full grayscale, <code>gray=40</code> a subtle muted look. Legacy <code>gray=1</code> still means full.</td></tr>
      <tr><td class="p">neg</td><td class="d">0–100</td><td>Invert amount — blends the original back over the inverted image.</td></tr>
      <tr><td class="p">bright</td><td class="d">1–200 (100)</td><td>Brightness %.</td></tr>
      <tr><td class="p">sat</td><td class="d">0–200 (100)</td><td>Saturation %. 0 = muted color base for duotones.</td></tr>
      <tr><td class="p">hue</td><td class="d">-180–180 (0)</td><td>Hue rotation in degrees.</td></tr>
      <tr><td class="p">blur</td><td class="d">0.3–100 (0)</td><td>Gaussian blur sigma. Small values + tiny width = LQIP placeholders.</td></tr>
      <tr><td class="p">sharpen</td><td class="d">1–100</td><td>Sharpen strength — scales the unsharp-mask sigma and flat-area gain.</td></tr>
    </table>
    <div class="uc"><b>Use case — blurred background placeholder (LQIP):</b>
    <code>?w=24&amp;blur=2&amp;f=webp</code> — a ~1 KB smear you show while the full image loads.
    <b>Muted hero overlay:</b> <code>?w=1600&amp;sat=40&amp;bright=115</code>.
    <b>Soft vintage gray:</b> <code>?gray=35&amp;sat=80</code>.</div>

    <h2 id="delivery">Delivery</h2>
    <table>
      <tr><th>Param</th><th>Description</th></tr>
      <tr><td class="p">download=1</td><td>Sets <code>Content-Disposition: attachment</code> — browsers download instead of rendering.</td></tr>
      <tr><td class="p">meta=1</td><td>Returns JSON (<code>format, bytes, width, height, url</code>) instead of the image — handy for debugging and integrations.</td></tr>
      <tr><td class="p">orig=1</td><td>Pass the original bytes straight through, skipping every transform.</td></tr>
    </table>

    <h2 id="headers">Response headers</h2>
    <table>
      <tr><th>Header</th><th>Meaning</th></tr>
      <tr><td class="p">X-Cache</td><td><code>MISS</code> first transform · <code>HIT</code> served from cache · <code>RAW</code> passthrough.</td></tr>
      <tr><td class="p">X-Image-Dimensions</td><td>Output size, e.g. <code>640x400</code>.</td></tr>
      <tr><td class="p">ETag + Cache-Control</td><td>Immutable, content-addressed — browsers and CDNs never re-fetch.</td></tr>
      <tr><td class="p">X-RateLimit-*</td><td>Daily quota limit and remaining transformations for this user.</td></tr>
      <tr><td class="p">Vary: Accept</td><td>Keeps <code>f=auto</code> variants separate per browser capability.</td></tr>
    </table>

    <h2 id="endpoints">Endpoints</h2>
    <table>
      <tr><th>Method &amp; path</th><th>Description</th></tr>
      <tr><td class="p">POST /upload</td><td>Multipart field <code>file</code>, raw body, or <code>{"url": "https://…"}</code> JSON.</td></tr>
      <tr><td class="p">GET /t/:id</td><td>The transform endpoint — everything above.</td></tr>
      <tr><td class="p">GET /raw/:id</td><td>Original bytes.</td></tr>
      <tr><td class="p">GET /exists/:id</td><td><code>{"id","exists"}</code> — availability probe (retention-aware clients).</td></tr>
      <tr><td class="p">GET /images</td><td>List uploads with URLs and metadata.</td></tr>
      <tr><td class="p">DELETE /images/:id</td><td>Delete an upload and stop serving its variants.</td></tr>
      <tr><td class="p">GET /quota</td><td>Remaining transformations for the current user today.</td></tr>
    </table>

    <h2 id="caching">Caching</h2>
    <p>Cache keys are <b>canonical</b>: parameters are normalized (sorted, defaults removed,
    <code>f=auto</code> resolved), so <code>?w=300&amp;h=200</code> and <code>?h=200&amp;w=300&amp;q=80</code>
    are one cache entry. Layers: immutable browser cache → in-process LRU → disk / edge cache →
    S3 metadata+body (only on a miss). Warm URLs never touch object storage.</p>

    <h2 id="quota">Quota</h2>
    <p>Self-hosted tier: <b>100 transformations per user per day</b> (<code>DAILY_TRANSFORM_LIMIT</code>),
    tracked against an anonymous cookie and reset at midnight UTC. Cache hits are always free.
    Exhausted requests get <code>429</code> with a JSON explanation; <code>/quota</code> reports the balance.</p>

    <h2 id="recipes">Use-case recipes</h2>
    <p class="mut">Click any card to copy its URL.</p>
    <div class="recipes">
      <div class="recipe"><h4>👤 Avatar</h4><p>Square crop, quality-tuned, tiny.</p><code>%ORIGIN%/t/ID?w=256&amp;h=256&amp;fit=cover&amp;q=80&amp;f=webp</code></div>
      <div class="recipe"><h4>🎞 Thumbnail strip</h4><p>Uniform mini frames for galleries.</p><code>%ORIGIN%/t/ID?w=180&amp;h=100&amp;fit=cover&amp;q=60&amp;f=webp</code></div>
      <div class="recipe"><h4>🖼 Hero banner</h4><p>Full-width, modern format, no crop.</p><code>%ORIGIN%/t/ID?w=1920&amp;fit=inside&amp;q=70&amp;f=avif</code></div>
      <div class="recipe"><h4>📉 Max compression</h4><p>Slowest effort, lowest sensible quality.</p><code>%ORIGIN%/t/ID?q=35&amp;f=webp&amp;effort=6</code></div>
      <div class="recipe"><h4>🧬 Bit-perfect archive</h4><p>Lossless WebP — zero quality loss.</p><code>%ORIGIN%/t/ID?f=webp&amp;lossless=1</code></div>
      <div class="recipe"><h4>📰 Print-quality JPEG</h4><p>MozJPEG + full chroma + progressive.</p><code>%ORIGIN%/t/ID?f=jpeg&amp;moz=1&amp;cs=444&amp;q=90&amp;prog=1</code></div>
      <div class="recipe"><h4>📱 Retina srcset pair</h4><p>1x + 2x from one source.</p><code>%ORIGIN%/t/ID?w=400&amp;f=webp &nbsp;+&nbsp; ?w=800&amp;f=webp</code></div>
      <div class="recipe"><h4>🌫 Blur placeholder (LQIP)</h4><p>~1 KB smear while the real image loads.</p><code>%ORIGIN%/t/ID?w=24&amp;blur=2&amp;f=webp</code></div>
      <div class="recipe"><h4>🌐 Social preview card</h4><p>Exact OG dimensions, universal format.</p><code>%ORIGIN%/t/ID?w=1200&amp;h=630&amp;fit=cover&amp;q=80&amp;f=jpeg</code></div>
      <div class="recipe"><h4>⚫ Monochrome gallery</h4><p>Grayscale with a brightness lift.</p><code>%ORIGIN%/t/ID?gray=1&amp;w=800&amp;bright=105&amp;q=80</code></div>
      <div class="recipe"><h4>🪟 Product on white</h4><p>Contain + background + format kept.</p><code>%ORIGIN%/t/ID?w=600&amp;h=600&amp;fit=contain&amp;bg=ffffff&amp;f=png</code></div>
      <div class="recipe"><h4>⬇️ Download endpoint</h4><p>Browser saves instead of rendering.</p><code>%ORIGIN%/t/ID?w=800&amp;download=1</code></div>
    </div>

    <h2 id="code">Code samples</h2>
    <p class="lead" style="margin-bottom:10px">Upload → transform in five languages. Replace
    <code>%ORIGIN%</code> with your deployment.</p>

    <div class="tabs" id="tabs">
      <div class="tabbtns">
        <button class="tabbtn on" data-p="p-curl">cURL</button>
        <button class="tabbtn" data-p="p-fetch">JavaScript · fetch</button>
        <button class="tabbtn" data-p="p-axios">JavaScript · axios</button>
        <button class="tabbtn" data-p="p-python">Python · requests</button>
        <button class="tabbtn" data-p="p-go">Go · net/http</button>
      </div>
      <div class="pane on" id="p-curl">
<pre><span class="c"># 1 — upload</span>
curl -F <span class="k">"file=@photo.jpg"</span> %ORIGIN%/upload
<span class="c"># → {"id":"a1b2c3","transformUrl":"%ORIGIN%/t/a1b2c3", …}</span>

<span class="c"># 2 — transform (save result)</span>
curl -o avatar.webp <span class="k">"%ORIGIN%/t/a1b2c3?w=256&amp;h=256&amp;fit=cover&amp;q=80&amp;f=webp"</span>

<span class="c"># 3 — server-side metadata instead of bytes</span>
curl <span class="k">"%ORIGIN%/t/a1b2c3?w=640&amp;meta=1"</span></pre>
      </div>
      <div class="pane" id="p-fetch">
<pre><span class="c">// works in the browser and Node 18+ — the transform URL is a plain &lt;img&gt; src</span>
<span class="k">const</span> form = <span class="k">new</span> FormData();
form.append(<span class="a">"file"</span>, fileInput.files[0]);

<span class="k">const</span> res = <span class="k">await</span> fetch(<span class="a">"%ORIGIN%/upload"</span>, { method: <span class="a">"POST"</span>, body: form });
<span class="k">const</span> { id, transformUrl } = <span class="k">await</span> res.json();

<span class="c">// serve any variant straight into an &lt;img&gt; tag — no SDK, no download step</span>
img.src = transformUrl + <span class="a">"?w=640&amp;h=400&amp;fit=cover&amp;q=75&amp;f=webp"</span>;</pre>
      </div>
      <div class="pane" id="p-axios">
<pre><span class="k">import</span> axios <span class="k">from</span> <span class="a">"axios"</span>;
<span class="k">import</span> FormData <span class="k">from</span> <span class="a">"form-data"</span>;
<span class="k">import</span> fs <span class="k">from</span> <span class="a">"fs"</span>;

<span class="c">// 1 — upload</span>
<span class="k">const</span> form = <span class="k">new</span> FormData();
form.append(<span class="a">"file"</span>, fs.createReadStream(<span class="a">"photo.jpg"</span>));
<span class="k">const</span> { data } = <span class="k">await</span> axios.post(<span class="a">"%ORIGIN%/upload"</span>, form, {
  headers: form.getHeaders(),
});

<span class="c">// 2 — transform (query params, binary response)</span>
<span class="k">const</span> img = <span class="k">await</span> axios.get(<span class="a">"%ORIGIN%/t/"</span> + data.id, {
  params: { w: 640, h: 400, fit: <span class="a">"cover"</span>, q: 75, f: <span class="a">"webp"</span> },
  responseType: <span class="a">"arraybuffer"</span>,
});
fs.writeFileSync(<span class="a">"out.webp"</span>, img.data);

<span class="c">// 3 — metadata only</span>
<span class="k">const</span> meta = <span class="k">await</span> axios.get(<span class="a">"%ORIGIN%/t/"</span> + data.id, {
  params: { w: 640, meta: 1 },
});</pre>
      </div>
      <div class="pane" id="p-python">
<pre><span class="k">import</span> requests

BASE = <span class="a">"%ORIGIN%"</span>

<span class="c"># 1 — upload</span>
<span class="k">with</span> open(<span class="a">"photo.jpg"</span>, <span class="a">"rb"</span>) <span class="k">as</span> f:
    r = requests.post(BASE + <span class="a">"/upload"</span>, files={<span class="a">"file"</span>: f})
img_id = r.json()[<span class="a">"id"</span>]

<span class="c"># 2 — transform</span>
out = requests.get(BASE + f<span class="a">"/t/{img_id}"</span>, params={
    <span class="a">"w"</span>: 640, <span class="a">"h"</span>: 400, <span class="a">"fit"</span>: <span class="a">"cover"</span>, <span class="a">"q"</span>: 75, <span class="a">"f"</span>: <span class="a">"webp"</span>,
})
<span class="k">with</span> open(<span class="a">"out.webp"</span>, <span class="a">"wb"</span>) <span class="k">as</span> f:
    f.write(out.content)

<span class="c"># 3 — check availability (retention-aware clients)</span>
exists = requests.get(BASE + f<span class="a">"/exists/{img_id}"</span>).json()[<span class="a">"exists"</span>]</pre>
      </div>
      <div class="pane" id="p-go">
<pre><span class="k">package</span> main

<span class="k">import</span> (
    <span class="a">"encoding/json"</span>
    <span class="a">"io"</span>
    <span class="a">"net/http"</span>
    <span class="a">"os"</span>
)

<span class="k">func</span> main() {
    <span class="c">// 1 — upload (raw body)</span>
    f, _ := os.Open(<span class="a">"photo.jpg"</span>)
    up, _ := http.Post(<span class="a">"%ORIGIN%/upload"</span>, <span class="a">"image/jpeg"</span>, f)
    <span class="k">defer</span> up.Body.Close()
    <span class="k">var</span> uploaded <span class="k">struct</span> {
        ID <span class="k">string</span> <span class="a">"json:\\"id\\""</span>
    }
    json.NewDecoder(up.Body).Decode(&amp;uploaded)

    <span class="c">// 2 — transform</span>
    res, _ := http.Get(<span class="a">"%ORIGIN%/t/"</span> + uploaded.ID +
        <span class="a">"?w=640&amp;h=400&amp;fit=cover&amp;q=75&amp;f=webp"</span>)
    out, _ := os.Create(<span class="a">"out.webp"</span>)
    <span class="k">defer</span> out.Close()
    io.Copy(out, res.Body)
}</pre>
      </div>
    </div>

    <div class="uc"><b>Tip — srcset without a build step:</b> render
    <code>&lt;img srcset="/t/ID?w=400&amp;f=webp 1x, /t/ID?w=800&amp;f=webp 2x"&gt;</code> —
    every variant is generated on first request and cached forever.</div>
  </main>
</div>

<footer>
  <div class="wrap inner">
    <a class="brand" href="/" style="font-size:14px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="width:20px;height:20px;border-radius:5px"><defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg2)"/><rect x="26.5" y="10.5" width="11" height="11" rx="2.5" transform="rotate(45 32 16)" fill="#fff"/><rect x="27" y="25" width="10" height="25" rx="5" fill="#fff"/><rect x="43" y="43" width="8" height="8" rx="2" transform="rotate(45 47 47)" fill="#fff" opacity=".5"/></svg>
      imgora
    </a>
    <span>Docs · images on demand</span>
    <span class="right"><a href="/studio">Open Studio →</a></span>
  </div>
</footer>

<script>
(function () {
  "use strict";
  document.querySelectorAll(".tabs").forEach(function (t) {
    t.querySelectorAll(".tabbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        t.querySelectorAll(".tabbtn").forEach(function (x) { x.classList.remove("on"); });
        t.querySelectorAll(".pane").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var p = t.querySelector("#" + b.getAttribute("data-p"));
        if (p) p.classList.add("on");
      });
    });
  });
  document.querySelectorAll(".recipe").forEach(function (r) {
    r.addEventListener("click", function () {
      var code = r.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent.replace(/\\s+\\+\\s+/g, " ")).then(function () {
        var h = r.querySelector("h4");
        var old = h.textContent;
        h.textContent = "✓ copied";
        setTimeout(function () { h.textContent = old; }, 1100);
      }).catch(function () {});
    });
  });
})();
</script>
</body>
</html>`;
