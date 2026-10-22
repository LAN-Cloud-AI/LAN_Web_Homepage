import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { analyticsScriptTag, siteEventsScriptTag } from '../site-analytics.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const APEX = 'https://lancloudtech.com';
export const GLOBAL = 'https://global.lancloudtech.com';
export const CDN = 'https://img.lancloudtech.com';
const DEMO = 'https://lan-cloud-tdesign-demo.mingxuan400.chatgpt.site';
const textFile = file => /\.(?:html|js|css|svg|txt|xml|json)$/.test(file) || ['_headers', '_redirects'].includes(file);
export const isStaticAsset = file => /\.(?:js|css|svg|png|webp|jpe?g|gif|ico|avif|woff2?|ttf|otf|mp4|webm|pdf)$/.test(file) || file.startsWith('fonts/') || file.startsWith('vendor/');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(path.join(directory, prefix), { withFileTypes: true })) {
    const file = prefix + entry.name;
    if (entry.name.startsWith('.') || entry.name.startsWith('__audit')) throw new Error(`Private file in site source: ${file}`);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not public source: ${file}`);
    if (entry.isDirectory()) files.push(...await walk(directory, `${file}/`));
    else if (entry.isFile()) files.push(file);
  }
  return files.sort();
}

/** Release infrastructure changes only; approved visible copy is preserved. */
export function productionHtml(html, file) {
  if (!/<body\b/i.test(html)) return html;
  let result = html
    .replace(/\s*<style>\.demo-review-label\{[^<]*<\/style>/g, '')
    .replace(/\s*<div class="demo-review-label">[^<]*<\/div>/g, '')
    .replace(/\s*<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, '')
    .replace(/\s*<script\b(?=[^>]*(?:data-lan-analytics=["']umami["']|data-lan-events=["']umami["']|src=["'][^"']*\/site-events(?:\.[a-f0-9]+)?\.js["']))[^>]*>\s*<\/script>/gi, '')
    .replace(/<body\b([^>]*)>/i, (_, attributes) => `<body${attributes.replace(/\sdata-site-version=["'][^"']*["']/gi, '')} data-site-version="current">`);
  const isNoindex = /(?:^|\/)(?:404\.html|leadshunter\/index\.html)$/.test(file);
  result = result.replace(/<\/head>/i, `  <meta name="robots" content="${isNoindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}" />\n  ${analyticsScriptTag('lan')}\n  ${siteEventsScriptTag()}\n</head>`);
  return result;
}

/** Production endpoint resilience; approved site/ remains an exact design import. */
export function productionGeoHost(text) {
  const oldEndpoint = 'const GEO_ENDPOINT = "https://lan-geo.mingxuan400.workers.dev/";';
  const fetchStart = '  try {\n    const res = await fetch(GEO_ENDPOINT, {\n      credentials: "omit",';
  const fetchEnd = '  } catch {\n    /* stay on current host */\n  }';
  for (const expected of [oldEndpoint, fetchStart, fetchEnd]) {
    if (text.split(expected).length !== 2) throw new Error('Geo source changed; review production normalization before building.');
  }
  return text
    .replace(oldEndpoint, 'const GEO_ENDPOINT = "https://geo.lancloudtech.com/";')
    .replace(fetchStart, '  const controller = new AbortController();\n  const timeout = setTimeout(() => controller.abort(), 3000);\n  try {\n    const res = await fetch(GEO_ENDPOINT, {\n      signal: controller.signal,\n      credentials: "omit",')
    .replace(fetchEnd, '  } catch {\n    /* stay on current host */\n  } finally {\n    clearTimeout(timeout);\n  }');
}

function normalizeSource(data, file) {
  if (!textFile(file)) return data;
  let text = data.toString('utf8').replaceAll(DEMO, APEX);
  if (file.endsWith('.html')) text = productionHtml(text, file);
  if (/^geo-host(?:\.[a-f0-9]+)?\.js$/.test(file)) text = productionGeoHost(text);
  if (/^share-meta(?:\.[a-f0-9]+)?\.js$/.test(file)) {
    text = text.replace('"/images/generated/tdesign/share"', `"${APEX}/images/generated/tdesign/share"`);
  }
  return Buffer.from(text);
}

/** Only URLs resolving to a packaged asset are rebased. Navigation stays local. */
export function rewriteAssets(text, file, files, base, global = false) {
  const rebase = url => {
    if (!url || /^(?:data:|blob:|#|mailto:|tel:)/.test(url)) return url;
    let local = url;
    if (local.startsWith(`${APEX}/`)) local = local.slice(APEX.length);
    else if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(local)) return url;
    const [pathname] = local.split(/[?#]/, 1);
    const suffix = local.slice(pathname.length);
    const resolved = pathname.startsWith('/') ? pathname.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname));
    if (!files.has(resolved) || !isStaticAsset(resolved)) return url;
    if (global) return url.startsWith(`${APEX}/`) ? `${GLOBAL}/${resolved}${suffix}` : url;
    return `${base}/${resolved}${suffix}`;
  };
  // Relative JS imports remain relative: the whole module graph shares one CDN prefix.
  text = text.replace(/(["'`])([^"'`\s<>]+)\1/g, (all, quote, value) => {
    if (file.endsWith('.js') && !value.startsWith('/') && !value.startsWith(`${APEX}/`)) return all;
    return `${quote}${rebase(value)}${quote}`;
  });
  text = text.replace(/\bsrcset\s*=\s*(["'])([^"']+)\1/gi, (_, quote, value) =>
    `srcset=${quote}${value.split(',').map(part => part.replace(/^(\s*)(\S+)/, (all, space, url) => space + rebase(url))).join(',')}${quote}`);
  text = text.replace(/url\(\s*(["']?)([^"')\s]+)\1\s*\)/g, (_, quote, url) => `url(${quote}${rebase(url)}${quote})`);
  if (/^share-meta(?:\.[a-f0-9]+)?\.js$/.test(file)) {
    text = text.replaceAll(`${APEX}/images/generated/tdesign/share`, `${global ? GLOBAL : base}/images/generated/tdesign/share`);
  }
  return text;
}

const headers = global => `/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${global ? '' : '  Cache-Control: public, max-age=0, must-revalidate\n'}${global ? '  X-Robots-Tag: noindex, follow\n' : ''}\n/fonts/*\n  Access-Control-Allow-Origin: *\n  Cache-Control: public, max-age=31536000, immutable\n\n/images/*\n  Cache-Control: public, max-age=604800\n`;

export async function buildProduction({ root = ROOT, target = 'both' } = {}) {
  if (!['both', 'domestic', 'global'].includes(target)) throw new Error('Unknown production target');
  const sourceDir = path.join(root, 'site');
  const names = await walk(sourceDir);
  const source = new Map(await Promise.all(names.map(async file => [file, normalizeSource(await fs.readFile(path.join(sourceDir, file)), file)])));
  source.set('robots.txt', await fs.readFile(path.join(root, 'robots.txt')));
  source.set('_headers', Buffer.from(headers(false)));
  const hash = createHash('sha256');
  hash.update(await fs.readFile(fileURLToPath(import.meta.url)));
  for (const [name, bytes] of source) hash.update(name).update('\0').update(bytes).update('\0');
  const release = `compact-${hash.digest('hex').slice(0, 16)}`;
  const prefix = `lanxin/webpage/releases/${release}`;
  const cdnBase = `${CDN}/${prefix}`;
  const assets = new Set(names.filter(isStaticAsset));
  const cdnFiles = [];
  const outputs = [];
  for (const global of target === 'both' ? [false, true] : [target === 'global']) {
    const output = path.join(root, global ? 'dist-global' : 'dist');
    await fs.rm(output, { recursive: true, force: true });
    if (!global) await fs.rm(path.join(root, 'dist-cdn'), { recursive: true, force: true });
    for (const [file, bytes] of source) {
      let data = bytes;
      if (textFile(file)) data = Buffer.from(rewriteAssets(bytes.toString('utf8'), file, assets, cdnBase, global));
      if (file === '_headers') data = Buffer.from(headers(global));
      await fs.mkdir(path.dirname(path.join(output, file)), { recursive: true });
      await fs.writeFile(path.join(output, file), data);
      if (!global && isStaticAsset(file)) {
        const cdnFile = path.join(root, 'dist-cdn', file);
        await fs.mkdir(path.dirname(cdnFile), { recursive: true });
        await fs.writeFile(cdnFile, data);
        cdnFiles.push({ path: file, key: `${prefix}/${file}`, bytes: data.length, sha256: digest(data) });
      }
    }
    outputs.push(output);
  }
  const manifest = { schemaVersion: 1, source: 'site/', release, cdnBase, cdnPrefix: prefix, outputs, cdnFiles };
  if (target !== 'global') await fs.writeFile(path.join(root, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv.includes('--global') ? 'global' : process.argv.includes('--domestic') ? 'domestic' : 'both';
  const result = await buildProduction({ target });
  console.log(`Production ${target}: ${result.release}; ${result.outputs.map(output => path.basename(output)).join(', ')}; ${result.cdnFiles.length} CDN assets.`);
}
