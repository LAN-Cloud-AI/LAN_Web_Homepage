import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const license = await fs.readFile(path.join(root, 'docs/THREEUI-LICENSE.txt'), 'utf8');
const threeLicense = await fs.readFile(path.join(root, 'node_modules/three/LICENSE'), 'utf8');
await build({
  entryPoints: [path.join(root, 'scripts/motion/hero-scene.js')],
  outfile: path.join(root, 'company-hero-scene.js'),
  bundle: true, minify: true, format: 'esm', target: ['es2020'],
  legalComments: 'inline', banner: { js: `/*! ThreeUI Community adaptation\n${license}\nThree.js\n${threeLicense}*/` },
});
const { size } = await fs.stat(path.join(root, 'company-hero-scene.js'));
console.log(`Local ThreeUI / Three.js hero bundle: ${Math.round(size / 1024)} KiB (loaded only for the visible animated hero).`);
