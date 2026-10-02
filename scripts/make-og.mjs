// One-off: renders the social share card (1200x630) to og-embed.b64
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0e14"/><stop offset="1" stop-color="#141a2e"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="tx" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="220" fill="#6366f1" opacity="0.08"/>
  <circle cx="120" cy="560" r="260" fill="#a855f7" opacity="0.07"/>
  <rect x="90" y="150" width="150" height="150" rx="34" fill="url(#tile)"/>
  <rect x="148" y="178" width="26" height="26" rx="6" transform="rotate(45 161 191)" fill="#fff"/>
  <rect x="150" y="220" width="24" height="62" rx="12" fill="#fff"/>
  <rect x="192" y="232" width="18" height="18" rx="4" transform="rotate(45 201 241)" fill="#fff" opacity="0.5"/>
  <text x="280" y="255" font-family="Segoe UI, Arial, sans-serif" font-size="110" font-weight="700" fill="#f1f5f9">imgora</text>
  <text x="95" y="395" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="600" fill="url(#tx)">Every image your app needs,</text>
  <text x="95" y="455" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="600" fill="url(#tx)">delivered by a URL.</text>
  <text x="95" y="530" font-family="Consolas, monospace" font-size="30" fill="#9fb0d0">/t/&lt;id&gt;?w=640&amp;h=400&amp;fit=cover&amp;f=webp</text>
  <text x="95" y="580" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#5b6478">resize · compress · convert — free image transformation API</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync("og-embed.b64", png.toString("base64"));
console.log("og card:", (png.length / 1024).toFixed(1), "KB →", "og-embed.b64");
