import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "logos");
mkdirSync(OUT_DIR, { recursive: true });

// Logo sizes for different use cases
const SIZES = [
  { name: "logo-100x100", w: 100, h: 100, type: "icon" },
  { name: "logo-200x200", w: 200, h: 200, type: "icon" },
  { name: "logo-400x400", w: 400, h: 400, type: "icon" },
  { name: "logo-512x512", w: 512, h: 512, type: "icon" },
  { name: "logo-800x800", w: 800, h: 800, type: "icon" },
  { name: "logo-1200x1200", w: 1200, h: 1200, type: "icon" },
  { name: "favicon-social-400x400", w: 400, h: 400, type: "icon" }, // Social media profile pic
];

// Full logo w/ text sizes (wider)
const TEXT_SIZES = [
  { name: "logo-text-400x100", w: 400, h: 100 },
  { name: "logo-text-800x200", w: 800, h: 200 },
  { name: "logo-text-1200x300", w: 1200, h: 300 },
  { name: "logo-text-1600x400", w: 1600, h: 400 },
];

// Shield icon SVG (same as favicon.svg)
function shieldSvg(size) {
  const scale = size / 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.08)}" fill="#0f172a"/>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="scale(${scale})">
    <path d="M128 30 L60 70 L60 130 C60 190 128 240 128 240 C128 240 196 190 196 130 L196 70 Z" fill="url(#grad1)" stroke="white" stroke-width="2"/>
    <g transform="translate(128, 130)">
      <path d="M -35 -25 L -50 -25 L -50 25 L -35 25" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 35 -25 L 50 -25 L 50 25 L 35 25" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="-20" y1="-8" x2="20" y2="-8" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <line x1="-20" y1="8" x2="20" y2="8" stroke="white" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

// Full logo with text
function logoWithText(w, h) {
  const iconSize = h * 0.7;
  const iconY = (h - iconSize) / 2;
  const iconX = h * 0.15;
  const textX = iconX + iconSize + h * 0.15;
  const fontSizeBrand = h * 0.22;
  const fontSizeSub = h * 0.11;
  const textY = h * 0.48;
  const subY = h * 0.65;
  const scale = iconSize / 256;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" rx="${Math.round(h * 0.08)}" fill="#0f172a"/>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(${iconX}, ${iconY}) scale(${scale})">
    <path d="M128 30 L60 70 L60 130 C60 190 128 240 128 240 C128 240 196 190 196 130 L196 70 Z" fill="url(#grad1)" stroke="white" stroke-width="2"/>
    <g transform="translate(128, 130)">
      <path d="M -35 -25 L -50 -25 L -50 25 L -35 25" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 35 -25 L 50 -25 L 50 25 L 35 25" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="-20" y1="-8" x2="20" y2="-8" stroke="white" stroke-width="5" stroke-linecap="round"/>
      <line x1="-20" y1="8" x2="20" y2="8" stroke="white" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>
  <text x="${textX}" y="${textY}" fill="white" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSizeBrand}" font-weight="700" letter-spacing="-0.02em">
    <tspan fill="white">Secure</tspan><tspan fill="#3b82f6">Code</tspan><tspan fill="white">Reviews</tspan>
  </text>
  <text x="${textX}" y="${subY}" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSizeSub}" font-weight="400">
    ShieldX Security Platform
  </text>
</svg>`;
}

async function main() {
  console.log("Generating logos...\n");

  // Icon-only logos
  for (const s of SIZES) {
    const svg = Buffer.from(shieldSvg(s.w));
    const out = join(OUT_DIR, `${s.name}.png`);
    await sharp(svg).resize(s.w, s.h).png().toFile(out);
    console.log(`  ✓ ${s.name}.png (${s.w}x${s.h})`);
  }

  // Logos with text
  for (const s of TEXT_SIZES) {
    const svg = Buffer.from(logoWithText(s.w, s.h));
    const out = join(OUT_DIR, `${s.name}.png`);
    await sharp(svg).resize(s.w, s.h).png().toFile(out);
    console.log(`  ✓ ${s.name}.png (${s.w}x${s.h})`);
  }

  // Also generate SVGs for scalable use
  writeFileSync(join(OUT_DIR, "logo-icon.svg"), shieldSvg(512));
  writeFileSync(join(OUT_DIR, "logo-with-text.svg"), logoWithText(1600, 400));
  console.log("\n  ✓ logo-icon.svg");
  console.log("  ✓ logo-with-text.svg");

  console.log(`\nAll logos saved to: public/logos/`);
}

main().catch(console.error);
