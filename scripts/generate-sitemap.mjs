import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_LOCALES, absoluteLocaleUrl, hreflangLinks } from "../site-identity.js";
import { PUBLIC_ROUTES } from "../site-seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const toLastmod = (htmlRelative) => {
  const stat = fs.statSync(path.join(root, htmlRelative));
  return stat.mtime.toISOString().slice(0, 10);
};

const urlBlocks = PUBLIC_ROUTES.flatMap((route) => {
  const lastmod = toLastmod(route.html);
  return SITE_LOCALES.map((locale) => {
    const loc = absoluteLocaleUrl(route.path, locale);
    const alts = hreflangLinks(route.path)
      .map((item) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${item.href}" />`)
      .join("\n");
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${alts}
  </url>`;
  });
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), xml, "utf8");
console.log(`Wrote ${PUBLIC_ROUTES.length * SITE_LOCALES.length} URLs → sitemap.xml`);
