import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProduction } from './build-production.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function prepareWorkerAssets({ root = ROOT, output = path.join(root, 'dist') } = {}) {
  if (path.resolve(output) !== path.join(path.resolve(root), 'dist')) throw new Error('Domestic release output must be dist/');
  await buildProduction({ root, target: 'domestic' });
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareWorkerAssets();
  console.log('Approved production source packaged into dist/ and dist-cdn/.');
}
