// Retained command name for existing release automation; verifies full launch.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicAssetFiles } from './website-versions.mjs';
import { PUBLIC_ROUTES } from '../site-seo.js';
import { SITE_LOCALES } from '../site-identity.js';
import { localeHtmlPath } from './seo-html.mjs';
import { withGlobalNoindex } from './prepare-pages-assets.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const read = relative => fs.readFile(path.join(dist, relative), 'utf8');
const origin = 'https://lancloudtech.com';
for (const removed of ['preview', 'legacy-site', 'website-versions.css']) {
  await assert.rejects(fs.access(path.join(dist, removed)), `${removed} must not ship`);
}
const routes = PUBLIC_ROUTES.flatMap(route => SITE_LOCALES.map(locale => localeHtmlPath(route.html, locale)));
for (const relative of [...routes, '404.html', 'en/404.html', 'zh-Hant/404.html']) {
  const html = await read(relative);
  assert.match(html, /data-site-version="current"/);
  assert.doesNotMatch(html, /data-site-version-switch|data-page-motion-toggle|data-hero-motion-pause/);
  assert.doesNotMatch(html, /(?:href|src)=["'][^"']*\/preview\//);
  const trackers = [...html.matchAll(/data-website-id="([^"]+)"/g)];
  assert.equal(trackers.length, 1, `${relative}: one tracker`);
  assert.equal(trackers[0][1], 'd93294b3-1e1c-4127-9289-1fb8bdc42293');
  assert.equal([...html.matchAll(/data-lan-events="umami"/g)].length, 1, `${relative}: one events module`);
  assert.match(html, /data-theme-option="(?:system|light|dark)"/);
  if (!relative.endsWith('404.html')) assert.doesNotMatch(html, /name="robots" content="[^"']*noindex/);
  else assert.match(html, /name="robots" content="noindex,follow"/);
  const base = new URL('/' + relative.replace(/index\.html$/, ''), origin);
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), base);
    if (url.origin !== origin || !/^https?:$/.test(url.protocol)) continue;
    const target = path.join(dist, decodeURIComponent(url.pathname));
    const stat = await fs.stat(target).catch(()=>assert.fail(`${relative}: missing ${url.pathname}`));
    if (stat.isDirectory()) await fs.access(path.join(target,'index.html'));
  }
}
assert.doesNotMatch(await read('sitemap.xml'), /\/preview\/|404\.html/);
assert.match(await read('_redirects'), /^\/preview\/\*\s+\/:splat\s+301/m);
assert.match(withGlobalNoindex(await read('_headers')), /^\/\*\n\s+X-Robots-Tag: noindex, follow/m);
assert.equal(withGlobalNoindex(withGlobalNoindex(await read('_headers'))), withGlobalNoindex(await read('_headers')));
for (const file of await publicAssetFiles(dist)) assert.ok(!file.startsWith('preview/'));
console.log(`Full launch verified: ${routes.length} public pages, 3 localized 404 pages, no legacy copy, canonical routes, single Umami and shared theme controls.`);
