/** Static, localized 404 documents; root-absolute assets work at arbitrary missing URLs. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NOT_FOUND_COPY } from '../error-page.js';
import { getI18nTable } from '../i18n.js';
import { HTML_LANG, SITE_LOCALES, withLocalePrefix } from '../site-identity.js';
import { siteEventsScriptTag } from '../site-analytics.js';
import { shellHeader, shellFooter, shellHead } from './site-shell.mjs';
import { upsertAnalytics, localeHtmlPath } from './seo-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const localizeShell = (html, locale) => {
  const copy = getI18nTable(locale);
  return html
    .replace(/data-i18n="([^"]+)"([^>]*)>[^<]*</g, (match, key, attrs) => copy[key] ? `data-i18n="${key}"${attrs}>${escape(copy[key])}<` : match)
    .replace(/aria-label="[^"]*"([^>]*data-i18n-aria="([^"]+)")/g, (match, rest, key) => copy[key] ? `aria-label="${escape(copy[key])}"${rest}` : match)
    .replace(/(class="lan-brand"[^>]*aria-label=")[^"]*(")/g, `$1${escape(copy['nav.brand'])}$2`)
    .replace(/(data-shell-locale="([^"]+)"[^>]*aria-pressed=")[^"]*(")/g, (_match, prefix, value, suffix) => `${prefix}${value === locale}${suffix}`);
};

export function renderNotFound(locale = 'zh-Hans') {
  const copy = NOT_FOUND_COPY[locale];
  const home = withLocalePrefix('/', locale);
  const text = key => `<span data-error-copy="${key}">${escape(copy[key])}</span>`;
  return upsertAnalytics(`<!doctype html>
<html lang="${HTML_LANG[locale]}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="robots" content="noindex,follow" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#f7f9f6" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#091813" media="(prefers-color-scheme: dark)" />
  <title>${escape(copy.title)}</title>
  <meta name="description" content="${escape(copy.description)}" />
  <link rel="icon" href="https://img.lancloudtech.com/lanxin/webpage/images/logo/WEB-logo.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="https://img.lancloudtech.com/lanxin/webpage/images/logo/WEB-logo-180.png" />
  ${shellHead('/')}
  ${siteEventsScriptTag('/site-events.js')}
  <link rel="stylesheet" href="/error-page.css" />
  <script src="/geo-host.js" defer></script>
</head>
<body data-site-error="404" data-site-version="new">
${localizeShell(shellHeader(home, 'not-found'), locale)}
<main id="main" class="error-page" data-not-found tabindex="-1">
  <section class="error-stage" aria-labelledby="error-heading">
    <div class="error-copy">
      <p class="error-eyebrow">${text('eyebrow')}</p>
      <h1 id="error-heading" data-error-copy="heading">${escape(copy.heading)}</h1>
      <p class="error-intro" data-error-copy="intro">${escape(copy.intro)}</p>
      <div class="error-actions">
        <a class="error-home" data-error-home href="${home}">${text('home')}<span aria-hidden="true">↗</span></a>
        <a class="error-solutions" data-error-solutions href="${home}solutions/">${text('solutions')}<span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div class="error-visual" data-error-visual aria-hidden="true">
      <svg class="error-vector" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor">
          <g class="error-orbit"><ellipse cx="404" cy="244" rx="357" ry="159" transform="rotate(-9 404 244)"/><ellipse cx="404" cy="244" rx="371" ry="171" transform="rotate(-9 404 244)"/><ellipse cx="404" cy="244" rx="385" ry="183" transform="rotate(-9 404 244)"/></g>
          <g class="error-digit" stroke-linecap="round" stroke-linejoin="round"><path d="M225 104 98 305H269M226 104V363"/><ellipse cx="404" cy="234" rx="81" ry="129"/><path d="M680 104 553 305H724M681 104V363"/></g>
        </g>
      </svg>
    </div>
    <div class="error-note"><p>${text('note')}</p><span aria-hidden="true">LAN CLOUD AI · 404</span></div>
  </section>
</main>
${localizeShell(shellFooter(home), locale)}
<script type="module" src="/error-page.js"></script>
</body>
</html>
`, 'lan');
}

export function generateNotFoundPages() {
  return SITE_LOCALES.map(locale => {
    const output = localeHtmlPath('404.html', locale);
    fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true });
    fs.writeFileSync(path.join(root, output), renderNotFound(locale), 'utf8');
    return output;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Generated ${generateNotFoundPages().length} localized 404 pages.`);
}
