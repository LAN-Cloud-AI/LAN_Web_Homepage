/** Refresh shared static chrome before SEO and locale generation. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shellHeader, shellFooter, shellHead } from './site-shell.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  ['ai-course/index.html', '../', 'ai-course', 'top'],
  ['ai-course/fde/index.html', '../../', 'ai-course-fde', 'top'],
  ['ai-course/mvp-3day/index.html', '../../', 'ai-course-mvp-3day', 'top'],
  ['internal-expense/index.html', '../', 'internal-expense', 'main'],
  ['contact/wecom/index.html', '../../', 'wecom', 'main-content'],
  ['sitemap/index.html', '../', 'sitemap', 'sitemap'],
];
for (const [file, prefix, route, mainId] of pages) {
  const target = path.join(root, file);
  let html = fs.readFileSync(target, 'utf8');
  html = html.replace(/<a class="(?:skip-link|lan-skip)"[^>]*>[\s\S]*?<\/a>\s*/g, '');
  html = html.replace(/<header class="(?:site-nav|top|lan-header)"[^>]*>[\s\S]*?<\/header>\s*/g, '');
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>\s*/g, '');
  html = html.replace(/\s*<script[^>]*src="[^"]*\/(?:site-theme|site-shell)\.js"[^>]*><\/script>/g, '');
  html = html.replace(/\s*<link[^>]*href="[^"]*\/site-shell\.css"[^>]*>/g, '');
  if (route === 'wecom') html = html.replace(/<nav class="page-lang"[\s\S]*?<\/nav>/, '');
  html = html.replace(/<main\b([^>]*)>/, (match, attrs) => attrs.includes('tabindex=') ? match : `<main${attrs} tabindex="-1">`);
  html = html.replace('</head>', `  ${shellHead(prefix)}\n</head>`);
  html = html.replace(/(<body\b[^>]*>)/, `$1\n  ${shellHeader(prefix, route, mainId)}`);
  html = html.replace('</main>', `</main>\n\n  ${shellFooter(prefix)}`);
  // The geolocation helper must resolve the same way in every locale tree.
  html = html.replace('src="/geo-host.js"', `src="${prefix}geo-host.js"`);
  fs.writeFileSync(target, html.replace(/[ \t]+$/gm, ''));
  console.log(`Shared shell: ${file}`);
}
