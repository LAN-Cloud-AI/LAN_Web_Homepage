import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isStaticAsset } from './build-production.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'release-manifest.json'), 'utf8'));
async function walk(directory, prefix = '') {
  const out = [];
  for (const entry of await fs.readdir(path.join(directory, prefix), { withFileTypes: true })) {
    const file = prefix + entry.name;
    if (entry.isDirectory()) out.push(...await walk(directory, file + '/')); else out.push(file);
  }
  return out.sort();
}
const failures = [];
let documents = 0, checkedRefs = 0;
for (const target of ['dist', 'dist-global']) {
  const directory = path.join(root, target);
  const names = await walk(directory);
  const namesSet = new Set(names);
  const refs = (text, file) => {
    const urls = [];
    if (file.endsWith('.html')) {
      for (const match of text.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g)) urls.push(match[1]);
      for (const match of text.matchAll(/\bsrcset=["']([^"']+)["']/g)) urls.push(...match[1].split(',').map(part => part.trim().split(/\s/)[0]));
    }
    if (file.endsWith('.js')) for (const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([./][^"']+\.js)["']/g)) urls.push(match[1]);
    if (file.endsWith('.css')) for (const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) urls.push(match[1]);
    for (let url of urls) {
      if (url.startsWith(manifest.cdnBase + '/')) url = '/' + url.slice(manifest.cdnBase.length + 1);
      else if (/^[a-z]+:|^\/\/|^#/.test(url)) continue;
      url = url.split(/[?#]/)[0];
      const resolved = url.startsWith('/') ? url.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), url));
      if (!isStaticAsset(resolved)) continue;
      checkedRefs++;
      if (!namesSet.has(resolved)) failures.push(`${target}/${file}: missing ${resolved}`);
    }
  };
  for (const file of names.filter(file => /\.(html|js|css)$/.test(file))) {
    const text = await fs.readFile(path.join(directory, file), 'utf8');
    if (/chatgpt\.site|demo-review-label|Website preview · Demo/.test(text)) failures.push(`${target}/${file}: demo residue`);
    refs(text, file);
    if (file.endsWith('.html') && /<body\b/.test(text)) {
      documents++;
      if ((text.match(/data-lan-analytics="umami"/g) || []).length !== 1) failures.push(`${target}/${file}: tracker count`);
      if ((text.match(/data-lan-events="umami"/g) || []).length !== 1) failures.push(`${target}/${file}: events count`);
      if (!/(?:404\.html|leadshunter\/index\.html)$/.test(file) && !text.includes('content="index,follow,max-image-preview:large"')) failures.push(`${target}/${file}: index policy`);
      if (text.includes('rel="canonical"') && !/rel="canonical" href="https:\/\/lancloudtech\.com\//.test(text) && !file.includes('leadshunter')) failures.push(`${target}/${file}: canonical`);
      if (target === 'dist-global' && text.includes(manifest.cdnBase)) failures.push(`${target}/${file}: domestic release dependency`);
    }
  }
  const headers = await fs.readFile(path.join(directory, '_headers'), 'utf8');
  assert.equal(headers.includes('X-Robots-Tag: noindex, follow'), target === 'dist-global');
  // Pages combines duplicate matching headers; its catch-all must not repeat asset Cache-Control.
  if (target === 'dist-global') assert.ok(!headers.split('\n\n')[0].includes('Cache-Control:'));
  assert.ok(!(await fs.readFile(path.join(directory, 'robots.txt'), 'utf8')).includes('Disallow: /'));
}
for (const entry of manifest.cdnFiles) {
  const bytes = await fs.readFile(path.join(root, 'dist-cdn', entry.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
}
for (const name of ['lan-mark-bright.svg', 'lan-mark-black.svg']) {
  assert.deepEqual(await fs.readFile(path.join(root, 'site/images/logo', name)), await fs.readFile(path.join(root, 'dist/images/logo', name)));
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(JSON.stringify({ passed: true, release: manifest.release, documents, checkedRefs, cdnAssets: manifest.cdnFiles.length }));
