import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const svg = readFileSync(new URL('../app/icons/icon.svg', import.meta.url));
const sizes = { 'app/icons/icon-192.png': 192, 'app/icons/icon-512.png': 512, 'app/icons/apple-touch-icon.png': 180 };

for (const [rel, size] of Object.entries(sizes)) {
  const out = fileURLToPath(new URL('../' + rel, import.meta.url));
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log('wrote', rel, size + 'px');
}
