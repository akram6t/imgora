/** Marketing landing page served at "/". Static + SEO-complete.
 *  %ORIGIN% placeholders are replaced with the request origin at serve time.
 *  NOTE: content must not contain backticks or ${ — it lives in a TS template literal. */
export const LANDING_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0e14">
<meta name="author" content="Imgora">
<title>Imgora — Free Image Transform API · Resize, Compress &amp; Convert by URL</title>
<meta name="description" content="Imgora transforms images on the fly: resize, crop, compress and convert to WebP/AVIF with simple URL parameters. S3-backed, edge-cached, built on Hono. Free self-hosted image pipeline for production.">
<meta name="keywords" content="image processing api, image cdn, on the fly image resize, webp converter, avif converter, image optimization api, cloudinary alternative free, s3 image transforms, imgix alternative, image compression api">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="%ORIGIN%/">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="manifest" href="/manifest.webmanifest">
<!-- paste your Google Search Console / Bing verification meta tag here after verifying ownership -->

<meta property="og:type" content="website">
<meta property="og:site_name" content="Imgora">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="Imgora — Free Image Transform API · Resize, Compress &amp; Convert by URL">
<meta property="og:description" content="Resize, crop, compress and convert images by URL. S3-backed, edge-cached, instant.">
<meta property="og:url" content="%ORIGIN%/">
<meta property="og:image" content="%ORIGIN%/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Imgora — resize, compress and convert images with one URL">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Imgora — Free Image Transform API · Resize, Compress &amp; Convert by URL">
<meta name="twitter:description" content="Resize, crop, compress and convert images by URL. S3-backed, edge-cached, instant.">
<meta name="twitter:image" content="%ORIGIN%/og.png">
<meta name="twitter:image:alt" content="Imgora — resize, compress and convert images with one URL">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Imgora",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "description": "On-the-fly image transformation API: resize, crop, compress and convert images via URL parameters. S3-backed with multi-layer caching.",
  "url": "%ORIGIN%/",
  "logo": "%ORIGIN%/logo.svg",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Imgora",
  "url": "%ORIGIN%/",
  "logo": "%ORIGIN%/logo.svg",
  "sameAs": [
    "https://github.com/akram6t",
    "https://www.linkedin.com/in/akram6t"
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Imgora free to use?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Every transform is free — you can self-host Imgora with your own S3 storage and no feature is locked behind a paid tier." }
    },
    {
      "@type": "Question",
      "name": "Which image formats does Imgora support?",
      "acceptedAnswer": { "@type": "Answer", "text": "JPEG, PNG, WebP, AVIF, GIF and TIFF as input. Output can be WebP, AVIF, JPEG or PNG, with automatic format negotiation per browser." }
    },
    {
      "@type": "Question",
      "name": "How do I transform an image?",
      "acceptedAnswer": { "@type": "Answer", "text": "Upload once to /upload, then request variants by URL parameters — for example /t/<id>?w=640&h=400&fit=cover&q=75&f=webp. Every parameter combination is cached permanently." }
    },
    {
      "@type": "Question",
      "name": "Where are my images stored?",
      "acceptedAnswer": { "@type": "Answer", "text": "In any S3-compatible storage — AWS S3, Tigris, Cloudflare R2, MinIO or Backblaze B2. Transformed variants are served from a four-layer cache and never touch object storage on repeat requests." }
    },
    {
      "@type": "Question",
      "name": "Can Imgora run on Cloudflare Workers?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. The same codebase runs on Cloudflare Workers using WASM codecs and R2 storage, deployed with one command." }
    }
  ]
}
</script>

<style>
  :root {
    --bg: #0b0e14; --panel: #11151f; --panel2: #161b28; --border: #232a3a;
    --text: #e6e9f0; --muted: #8b93a7; --accent: #6366f1; --accent2: #a855f7;
    --green: #34d399; --amber: #fbbf24;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  a { color: inherit; text-decoration: none; }
  a.card { cursor: pointer; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

  /* nav */
  nav { position: sticky; top: 0; z-index: 10; background: rgba(11, 14, 20, .82);
    backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
  nav .inner { display: flex; align-items: center; gap: 22px; height: 62px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; }
  .brand svg { width: 28px; height: 28px; border-radius: 7px; display: block; }
  nav .links { display: flex; gap: 20px; margin-left: 12px; color: var(--muted); font-size: 14px; }
  nav .links a:hover { color: var(--text); }
  nav .cta { margin-left: auto; }
  .btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 10px;
    padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer;
    border: 1px solid var(--border); background: var(--panel2); color: var(--text);
    transition: .15s; }
  .btn:hover { border-color: var(--accent); transform: translateY(-1px); }
  .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; box-shadow: 0 6px 22px rgba(124, 58, 237, .35); }
  .btn.primary:hover { box-shadow: 0 8px 28px rgba(124, 58, 237, .5); }
  .btn.big { padding: 13px 26px; font-size: 15.5px; }

  /* hero */
  .hero { position: relative; text-align: center; padding: 92px 0 66px; overflow: hidden; }
  .hero::before { content: ""; position: absolute; inset: -40% -20% auto; height: 130%;
    background:
      radial-gradient(600px 300px at 30% 20%, rgba(99, 102, 241, .18), transparent 70%),
      radial-gradient(600px 300px at 70% 25%, rgba(168, 85, 247, .16), transparent 70%);
    pointer-events: none; }
  .hero h1 { position: relative; font-size: clamp(34px, 6vw, 58px); line-height: 1.12;
    margin: 0 auto 18px; max-width: 820px; letter-spacing: -.02em; }
  .hero h1 .grad { background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; background-clip: text; color: transparent; }
  .hero p { position: relative; color: var(--muted); font-size: clamp(15px, 2.2vw, 18px);
    max-width: 640px; margin: 0 auto 30px; }
  .hero .cta { position: relative; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  /* live transform demo — an image morphing through real playground states */
  .demoStage { position: relative; height: 250px; margin-top: 34px; display: flex;
    align-items: center; justify-content: center; }
  .demoImg { position: relative; overflow: hidden; border-radius: 10px;
    box-shadow: 0 22px 60px rgba(0, 0, 0, .5), 0 0 0 1px rgba(255, 255, 255, .07);
    transition: width 1s cubic-bezier(.4, 0, .2, 1), height 1s cubic-bezier(.4, 0, .2, 1),
      border-radius 1s cubic-bezier(.4, 0, .2, 1), filter 1s ease;
    will-change: width, height, filter; }
  .demoImg svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .demoQ { position: relative; display: inline-flex; align-items: center; gap: 8px;
    margin-top: 10px; background: #0d1019; border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 18px; font: 13px ui-monospace, monospace; color: #9fb0d0;
    max-width: 100%; overflow: auto; }
  .demoQ .host { color: #566080; }
  .demoQ .k { color: var(--accent2); }
  .demoQ .q { color: #c7d2fe; font-weight: 600; }
  .demoQ .q.swap { animation: qpop .45s ease; }
  @keyframes qpop { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
  .demoQ b { color: var(--green); font-weight: 600; white-space: nowrap; }
  .trust { display: flex; gap: 26px; justify-content: center; flex-wrap: wrap;
    margin-top: 38px; color: var(--muted); font-size: 13px; }
  .trust span { display: flex; align-items: center; gap: 7px; }
  .trust i { width: 7px; height: 7px; border-radius: 50%; background: var(--green); display: inline-block; }

  /* sections */
  section { padding: 66px 0; }
  section h2 { font-size: clamp(24px, 3.4vw, 32px); margin: 0 0 10px; letter-spacing: -.01em; }
  section .lead { color: var(--muted); margin: 0 0 34px; max-width: 620px; }
  .eyebrow { color: var(--accent2); font-size: 12px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .14em; margin-bottom: 12px; }

  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } nav .links { display: none; } }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 14px;
    padding: 22px; transition: .18s; }
  .card:hover { transform: translateY(-3px); border-color: #313b55; }
  .card .ico { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center;
    justify-content: center; font-size: 20px; margin-bottom: 14px;
    background: linear-gradient(135deg, rgba(99, 102, 241, .18), rgba(168, 85, 247, .18));
    border: 1px solid rgba(124, 58, 237, .3); }
  .card h3 { margin: 0 0 7px; font-size: 16px; }
  .card p { margin: 0; color: var(--muted); font-size: 13.5px; }

  /* how */
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; counter-reset: step; }
  @media (max-width: 900px) { .steps { grid-template-columns: 1fr; } }
  .step { position: relative; background: var(--panel); border: 1px solid var(--border);
    border-radius: 14px; padding: 22px; }
  .step::before { counter-increment: step; content: "0" counter(step);
    font: 800 13px ui-monospace, monospace; color: #fff; display: inline-flex;
    width: 34px; height: 34px; border-radius: 10px; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--accent2)); margin-bottom: 14px; }
  .step h3 { margin: 0 0 7px; font-size: 15.5px; }
  .step p { margin: 0; color: var(--muted); font-size: 13.5px; }
  .step code { background: #0d1019; border: 1px solid var(--border); border-radius: 6px;
    padding: 1px 6px; font-size: 12px; color: #9fb0d0; }

  /* api */
  pre { background: #0d1019; border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; overflow: auto; font: 12.5px/1.7 ui-monospace, monospace; color: #9fb0d0; }
  pre .c { color: #566080; }
  pre .g { color: var(--green); }
  pre .a { color: var(--amber); }

  /* cta + footer */
  .banner { text-align: center; background: linear-gradient(135deg, rgba(99, 102, 241, .12), rgba(168, 85, 247, .12));
    border: 1px solid rgba(124, 58, 237, .35); border-radius: 18px; padding: 46px 26px; }
  .banner h2 { margin-bottom: 8px; }
  .banner p { color: var(--muted); margin: 0 0 22px; }
  footer { border-top: 1px solid var(--border); margin-top: 60px; padding: 26px 0 34px;
    color: var(--muted); font-size: 13px; }
  footer .inner { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  footer .right { margin-left: auto; }
  footer a:hover { color: var(--text); }
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
      <a href="#features">Features</a>
      <a href="#how">How it works</a>
      <a href="/docs">Docs</a>
      <a href="#contact">Contact</a>
    </div>
    <a class="btn primary cta" href="/studio">Open Studio →</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <h1>Every image your app needs,<br><span class="grad">delivered by a URL</span></h1>
    <p>Imgora transforms images on the fly — resize, crop, compress, convert to WebP/AVIF —
       driven entirely by query parameters. Upload once, then serve any variant instantly from cache.</p>
    <div class="cta">
      <a class="btn primary big" href="/studio">Open Studio →</a>
      <a class="btn big" href="/docs">Read the docs</a>
    </div>
    <div class="demoStage">
      <div class="demoImg" id="demoImg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="hd1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#1e1b4b"/><stop offset="55%" stop-color="#7c3aed"/>
              <stop offset="85%" stop-color="#ec4899"/><stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
            <radialGradient id="hd2" cx="0.72" cy="0.78" r="0.5">
              <stop offset="0" stop-color="#fde68a"/><stop offset="60%" stop-color="#f59e0b" stop-opacity=".85"/>
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="640" height="400" fill="url(#hd1)"/>
          <circle cx="461" cy="312" r="130" fill="url(#hd2)"/>
          <circle cx="461" cy="312" r="34" fill="#fde68a"/>
          <polygon points="0,400 165,208 268,318 340,246 470,400" fill="#181333"/>
          <polygon points="238,400 402,232 560,400" fill="#241a4a"/>
          <polygon points="380,400 520,296 640,400" fill="#2f2160"/>
          <rect x="0" y="352" width="640" height="48" fill="#12101f" opacity=".85"/>
          <circle cx="120" cy="90" r="2" fill="#fff" opacity=".8"/><circle cx="220" cy="52" r="1.6" fill="#fff" opacity=".6"/>
          <circle cx="320" cy="110" r="1.8" fill="#fff" opacity=".7"/><circle cx="560" cy="70" r="2" fill="#fff" opacity=".8"/>
        </svg>
      </div>
    </div>
    <div class="demoQ">
      <span class="host">your.imgora.app</span><span class="k">/t/</span><span class="k">sunset</span><span class="q" id="demoQ">?w=640&amp;h=400&amp;fit=cover</span><b id="demoSz">→ 24 KB</b>
    </div>
    <div class="trust">
      <span><i></i>WebP · AVIF · JPEG · PNG</span>
      <span><i></i>4-layer cache</span>
      <span><i></i>S3-compatible storage</span>
      <span><i></i>runs on Cloudflare Workers</span>
    </div>
  </div>
</header>

<section id="features">
  <div class="wrap">
    <div class="eyebrow">Features</div>
    <h2>Everything an image pipeline needs</h2>
    <p class="lead">One upload in, unlimited variants out — each URL combination is deterministic, cacheable and immutable.</p>
    <div class="grid">
      <div class="card"><div class="ico">🖼</div><h3>Resize &amp; smart crop</h3>
        <p>Width, height, five fit modes and region cropping with Lanczos resampling — no upscaling, ever.</p></div>
      <div class="card"><div class="ico">⚡</div><h3>Modern formats</h3>
        <p>Automatic AVIF/WebP negotiation from the browser's Accept header. Typically 40–90% smaller than JPEG.</p></div>
      <div class="card"><div class="ico">🗜</div><h3>Fine-grained compression</h3>
        <p>Quality, MozJPEG, chroma subsampling, encoder effort, lossless mode, PNG palette quantization.</p></div>
      <div class="card"><div class="ico">🎨</div><h3>Effects in the URL</h3>
        <p>Rotate, flip, grayscale, invert, brightness, saturation, hue, blur, sharpen — all cacheable params.</p></div>
      <div class="card"><div class="ico">🚀</div><h3>Instant by design</h3>
        <p>Memory LRU → disk / edge cache → immutable browser cache. Warm URLs answer in single-digit milliseconds.</p></div>
      <div class="card"><div class="ico">🪣</div><h3>S3-powered storage</h3>
        <p>Works with AWS S3, Tigris, R2, MinIO. Metadata-first lookups mean cache hits never touch object storage.</p></div>
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <div class="eyebrow">How it works</div>
    <h2>Three steps, no pipeline to build</h2>
    <p class="lead">Imgora sits between your storage and your users, generating every variant on demand.</p>
    <div class="steps">
      <div class="step"><h3>Upload once</h3>
        <p>POST your image to <code>/upload</code> (multipart, raw body or remote URL). You get a permanent id back.</p></div>
      <div class="step"><h3>Transform by URL</h3>
        <p>Ask for any variant with query params: <code>/t/&lt;id&gt;?w=400&amp;f=avif</code>. Render it straight into <code>&lt;img&gt;</code>.</p></div>
      <div class="step"><h3>Served from cache</h3>
        <p>First request transforms; every identical request after that is served instantly — browsers, edge and memory.</p></div>
    </div>
  </div>
</section>

<section id="integrations">
  <div class="wrap">
    <div class="eyebrow">Any stack</div>
    <h2>Plain HTTP — integrate in minutes</h2>
    <p class="lead">No SDK required: upload with any HTTP client, then serve transform URLs
    directly in HTML. Full walkthroughs for cURL, JavaScript, axios, Python and Go live in the docs.</p>
    <div class="grid">
      <div class="card"><div class="ico">📘</div><h3>Full parameter reference</h3>
        <p>Every query attribute documented with defaults, limits and when to use it.</p></div>
      <div class="card"><div class="ico">🧑‍💻</div><h3>Code in five languages</h3>
        <p>Copy-paste cURL, fetch, axios, Python and Go samples for upload and transform.</p></div>
      <div class="card"><div class="ico">🎯</div><h3>Real-world recipes</h3>
        <p>Avatars, LQIP placeholders, retina srcset, social cards — one click to copy.</p></div>
    </div>
    <div style="margin-top:22px"><a class="btn" href="/docs">Browse the docs →</a></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="banner">
      <h2>Ready to see it move?</h2>
      <p>The Studio gives you live sliders, every compression option and an instant cache indicator.</p>
      <a class="btn primary big" href="/studio">Open Studio →</a>
    </div>
  </div>
</section>

<section id="contact">
  <div class="wrap">
    <div class="eyebrow">Contact</div>
    <h2>Questions, feedback, or ideas?</h2>
    <p class="lead">Imgora is actively developed — reach out for bug reports, feature requests,
    collaborations, or just to show what you built with it.</p>
    <div class="grid">
      <a class="card" href="https://github.com/akram6t" target="_blank" rel="noopener">
        <div class="ico">GH</div>
        <h3>GitHub</h3>
        <p>Explore the source code, report issues, and contribute to the project.</p>
        <p style="margin-top:8px;color:var(--accent)">Open profile ↗</p>
      </a>
      <a class="card" href="https://www.linkedin.com/in/akram6t" target="_blank" rel="noopener">
        <div class="ico">in</div>
        <h3>LinkedIn</h3>
        <p>Connect with me, follow progress updates, and reach out for collaborations.</p>
        <p style="margin-top:8px;color:var(--accent)">Open profile ↗</p>
      </a>
      <a class="card" href="/docs">
        <div class="ico">📖</div>
        <h3>Documentation</h3>
        <p>Everything about the API, every parameter and code samples — before you write to me, the answer is probably there.</p>
        <p style="margin-top:8px;color:var(--accent)">/docs ↗</p>
      </a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap inner">
    <a class="brand" href="/" style="font-size:14px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="width:20px;height:20px;border-radius:5px"><defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg2)"/><rect x="26.5" y="10.5" width="11" height="11" rx="2.5" transform="rotate(45 32 16)" fill="#fff"/><rect x="27" y="25" width="10" height="25" rx="5" fill="#fff"/><rect x="43" y="43" width="8" height="8" rx="2" transform="rotate(45 47 47)" fill="#fff" opacity=".5"/></svg>
      imgora
    </a>
    <span>© 2026 Imgora · images on demand</span>
    <span class="right"><a href="/docs">Docs</a> · <a href="https://github.com/akram6t" target="_blank" rel="noopener">GitHub</a> · <a href="https://www.linkedin.com/in/akram6t" target="_blank" rel="noopener">LinkedIn</a></span>
  </div>
</footer>

<script>
(function () {
  "use strict";
  var img = document.getElementById("demoImg");
  var q = document.getElementById("demoQ");
  var sz = document.getElementById("demoSz");
  if (!img || !q) return;
  // each state = the visual (css) + the URL params that produce it
  var STATES = [
    { w: 330, h: 206, r: 10, f: "", p: "?w=640&h=400&fit=cover&f=webp", s: "→ 24 KB" },
    { w: 186, h: 186, r: 26, f: "", p: "?w=256&h=256&fit=cover&q=80", s: "→ 9 KB" },
    { w: 330, h: 206, r: 10, f: "grayscale(1)", p: "?w=640&h=400&fit=cover&gray=1", s: "→ 19 KB" },
    { w: 330, h: 186, r: 10, f: "blur(5px)", p: "?w=640&h=360&fit=cover&blur=4", s: "→ 8 KB" },
    { w: 300, h: 300, r: 150, f: "saturate(1.7)", p: "?w=480&h=480&fit=cover&sat=170", s: "→ 16 KB" },
    { w: 262, h: 262, r: 14, f: "saturate(1.3) brightness(1.15)", p: "?w=512&h=512&fit=cover&bright=115", s: "→ 14 KB" }
  ];
  var i = 0;
  function apply() {
    var st = STATES[i % STATES.length];
    img.style.width = st.w + "px";
    img.style.height = st.h + "px";
    img.style.borderRadius = st.r + "px";
    img.style.filter = st.f || "none";
    q.textContent = st.p;
    sz.textContent = st.s;
    q.classList.remove("swap");
    void q.offsetWidth; // restart the pop animation
    q.classList.add("swap");
    i += 1;
  }
  apply();
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) setInterval(apply, 2400);
})();
</script>
</body>
</html>`;
