import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const svg = readFileSync(new URL('../icons/icon.svg', import.meta.url));
const sizes = { 'icons/icon-192.png': 192, 'icons/icon-512.png': 512, 'icons/apple-touch-icon.png': 180 };

for (const [rel, size] of Object.entries(sizes)) {
  const out = fileURLToPath(new URL('../' + rel, import.meta.url));
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log('wrote', rel, size + 'px');
}
