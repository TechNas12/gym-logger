import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public');

// Master SVG design for GymLogger
function getSvg(size, isMaskable = false) {
  // If maskable, Android will crop it to circle or squircle with safe zone in the middle 80%
  // So we adjust inner artwork scale
  const scale = isMaskable ? 0.72 : 0.85;
  const offset = (size * (1 - scale)) / 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </radialGradient>

    <!-- Emerald Glow Gradient -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="50%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#16a34a" />
    </linearGradient>

    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4f4f5" />
      <stop offset="100%" stop-color="#a1a1aa" />
    </linearGradient>

    <linearGradient id="glowRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#15803d" stop-opacity="0.1" />
    </linearGradient>

    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.02}" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base background (full bleed) -->
  <rect width="${size}" height="${size}" rx="${isMaskable ? 0 : size * 0.22}" fill="url(#bgGrad)" />

  ${!isMaskable ? `
  <!-- Outer subtle border -->
  <rect x="${size * 0.02}" y="${size * 0.02}" width="${size * 0.96}" height="${size * 0.96}" rx="${size * 0.20}" fill="none" stroke="url(#glowRing)" stroke-width="${size * 0.015}" />
  ` : ''}

  <!-- Artwork Group with scaling -->
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- Center ambient glow -->
    <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.28}" fill="#22c55e" opacity="0.12" filter="url(#neonGlow)" />

    <!-- Dumbbell Graphic (Diagonal 45deg) centered at (size*0.5, size*0.5) -->
    <g transform="rotate(-35, ${size * 0.5}, ${size * 0.5})">
      <!-- Main Bar / Handle -->
      <rect 
        x="${size * 0.30}" 
        y="${size * 0.475}" 
        width="${size * 0.40}" 
        height="${size * 0.05}" 
        rx="${size * 0.02}" 
        fill="url(#metalGrad)" 
      />

      <!-- Handle Knurling Rings -->
      <line x1="${size * 0.45}" y1="${size * 0.475}" x2="${size * 0.45}" y2="${size * 0.525}" stroke="#71717a" stroke-width="${size * 0.008}" />
      <line x1="${size * 0.50}" y1="${size * 0.475}" x2="${size * 0.50}" y2="${size * 0.525}" stroke="#71717a" stroke-width="${size * 0.008}" />
      <line x1="${size * 0.55}" y1="${size * 0.475}" x2="${size * 0.55}" y2="${size * 0.525}" stroke="#71717a" stroke-width="${size * 0.008}" />

      <!-- Left Outer Plate Cap -->
      <rect 
        x="${size * 0.19}" 
        y="${size * 0.40}" 
        width="${size * 0.04}" 
        height="${size * 0.20}" 
        rx="${size * 0.015}" 
        fill="url(#metalGrad)" 
      />

      <!-- Left Big Plate -->
      <rect 
        x="${size * 0.24}" 
        y="${size * 0.32}" 
        width="${size * 0.06}" 
        height="${size * 0.36}" 
        rx="${size * 0.025}" 
        fill="url(#emeraldGrad)" 
        filter="url(#neonGlow)"
      />

      <!-- Left Inner Plate Collar -->
      <rect 
        x="${size * 0.30}" 
        y="${size * 0.43}" 
        width="${size * 0.025}" 
        height="${size * 0.14}" 
        rx="${size * 0.01}" 
        fill="#27272a" 
      />

      <!-- Right Inner Plate Collar -->
      <rect 
        x="${size * 0.675}" 
        y="${size * 0.43}" 
        width="${size * 0.025}" 
        height="${size * 0.14}" 
        rx="${size * 0.01}" 
        fill="#27272a" 
      />

      <!-- Right Big Plate -->
      <rect 
        x="${size * 0.70}" 
        y="${size * 0.32}" 
        width="${size * 0.06}" 
        height="${size * 0.36}" 
        rx="${size * 0.025}" 
        fill="url(#emeraldGrad)" 
        filter="url(#neonGlow)"
      />

      <!-- Right Outer Plate Cap -->
      <rect 
        x="${size * 0.77}" 
        y="${size * 0.40}" 
        width="${size * 0.04}" 
        height="${size * 0.20}" 
        rx="${size * 0.015}" 
        fill="url(#metalGrad)" 
      />
    </g>

    <!-- Modern Typography badge at bottom if size >= 192 -->
    ${size >= 192 ? `
    <text 
      x="${size * 0.5}" 
      y="${size * 0.88}" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-weight="900" 
      font-size="${size * 0.08}" 
      fill="#f4f4f5" 
      text-anchor="middle" 
      letter-spacing="${size * 0.015}"
    >GYM<tspan fill="#22c55e">LOGGER</tspan></text>
    ` : ''}
  </g>
</svg>
`;
}

async function generate() {
  const targets = [
    { filename: 'icon-192x192.png', size: 192, isMaskable: false },
    { filename: 'icon-512x512.png', size: 512, isMaskable: false },
    { filename: 'icon-maskable-192.png', size: 192, isMaskable: true },
    { filename: 'icon-maskable-512.png', size: 512, isMaskable: true },
    { filename: 'apple-touch-icon.png', size: 180, isMaskable: false },
    { filename: 'favicon-32x32.png', size: 32, isMaskable: false },
  ];

  for (const t of targets) {
    const svgStr = getSvg(t.size, t.isMaskable);
    const dest = path.join(outputDir, t.filename);
    await sharp(Buffer.from(svgStr))
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`Generated: ${t.filename} (${t.size}x${t.size})`);
  }

  // Also save master SVG
  const masterSvg = getSvg(512, false);
  fs.writeFileSync(path.join(outputDir, 'app-icon.svg'), masterSvg, 'utf-8');
  console.log('Generated: app-icon.svg');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
