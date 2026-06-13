import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const p = (rel) => fileURLToPath(new URL(rel, root));

// 2:1 social card (1200x600) derived from the hero — current OG image spec.
await sharp(p('docs/assets/hero.jpeg'))
  .resize(1200, 600, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 82 })
  .toFile(p('docs/assets/og.jpg'));
console.log('wrote docs/assets/og.jpg (1200x600)');
