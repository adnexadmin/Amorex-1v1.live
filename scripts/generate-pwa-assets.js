import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcImage = path.resolve('src/assets/images/amorex_3d_heart_logo_1787566285140.jpg');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateAssets() {
  console.log('Generating PWA & SEO icon assets from:', srcImage);

  // 1. 512x512 Standard Icon (Any)
  // Create a rich, rounded, glowing dark background with the 3D heart centered
  await sharp(srcImage)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 2. 192x192 Standard Icon (Any)
  await sharp(srcImage)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. 512x512 Maskable Icon (Maskable)
  // Android safe-zone requires ~15% padding around essential content so circular/squircle masks don't clip it.
  const innerHeartSize = Math.round(512 * 0.72); // 368px
  const heartResized = await sharp(srcImage)
    .resize(innerHeartSize, innerHeartSize, { fit: 'cover' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 13, b: 27, alpha: 1 } // #0B0D1B
    }
  })
    .composite([
      {
        input: heartResized,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. Apple Touch Icon (180x180 PNG) for iOS Safari
  await sharp(srcImage)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. Favicon 32x32 PNG
  await sharp(srcImage)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');

  // 6. Favicon ICO (48x48 PNG fallback)
  await sharp(srcImage)
    .resize(48, 48, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // 7. Open Graph & Social Share Image (1200x630) for Google SEO & Social Meta
  const ogHeart = await sharp(srcImage)
    .resize(380, 380, { fit: 'cover' })
    .toBuffer();

  const svgBannerOverlay = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0B0D1B" />
          <stop offset="50%" stop-color="#190B28" />
          <stop offset="100%" stop-color="#05060D" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#FF2E93" />
          <stop offset="50%" stop-color="#FF85C0" />
          <stop offset="100%" stop-color="#00D2FF" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#FF1744" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#FF1744" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      <circle cx="280" cy="315" r="260" fill="url(#glow)" />
      
      <text x="560" y="240" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-style="italic" font-size="64" fill="url(#textGrad)" letter-spacing="-1">
        AMOREX LIVE
      </text>
      <rect x="1000" y="195" width="80" height="34" rx="17" fill="#FF1744" />
      <text x="1040" y="218" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle">LIVE</text>
      
      <text x="560" y="300" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF">
        Romantic Social Universe &amp; 1v1 Video Matching
      </text>
      <text x="560" y="348" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="19" fill="#9CA3AF">
        Live HD Video Calls • 12-Seat Party Voice Rooms • Interactive Mini-Games
      </text>
      <text x="560" y="415" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="16" fill="#00D2FF" letter-spacing="1">
        ⚡ PWA COMPATIBLE • INSTANT INSTALL • WEBRTC PEER CONNECTION
      </text>
    </svg>
  `);

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 11, g: 13, b: 27, alpha: 1 }
    }
  })
    .composite([
      { input: svgBannerOverlay, top: 0, left: 0 },
      { input: ogHeart, top: 125, left: 90 }
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('Created og-image.jpg for Google SEO & Open Graph');

  // 8. Vector SVG icon (public/icon.svg)
  const svgIconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="amorexGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FF4081" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#C2185B" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0B0D1B" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E93" />
      <stop offset="35%" stop-color="#FF1744" />
      <stop offset="70%" stop-color="#C2185B" />
      <stop offset="100%" stop-color="#7B1FA2" />
    </linearGradient>
    <linearGradient id="sheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#FF1744" flood-opacity="0.65" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="#0B0D1B" />
  <rect width="512" height="512" rx="112" fill="url(#amorexGlow)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#FF2E93" stroke-width="4" stroke-opacity="0.4" />

  <!-- Outer 3D Heart Glow -->
  <g filter="url(#shadow)">
    <!-- 3D Heart Silhouette -->
    <path d="M256,430 C256,430 80,316 80,188 C80,118 136,72 204,72 C236,72 250,92 256,104 C262,92 276,72 308,72 C376,72 432,118 432,188 C432,316 256,430 256,430 Z"
          fill="url(#heartGrad)" />
  </g>

  <!-- Glossy Specular Overlay -->
  <path d="M256,420 C256,420 90,310 90,192 C90,128 140,82 204,82 C232,82 248,98 256,110 C264,98 280,82 308,82 C372,82 422,128 422,192 C422,310 256,420 256,420 Z"
        fill="url(#sheen)" opacity="0.75" />

  <!-- Inner Romantic Sparkle -->
  <circle cx="180" cy="140" r="14" fill="#FFFFFF" opacity="0.85" />
  <circle cx="156" cy="170" r="6" fill="#FFFFFF" opacity="0.7" />

  <!-- Subtle Logo Text -->
  <text x="256" y="482" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" font-style="italic" fill="#FF85C0" text-anchor="middle" letter-spacing="4">AMOREX</text>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIconContent);
  console.log('Created icon.svg');

  console.log('All PWA & SEO icons successfully generated!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
