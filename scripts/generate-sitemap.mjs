import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { absoluteUrl, PUBLIC_ROUTES } from "../site-seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const toLastmod = (htmlRelative) => {
  const stat = fs.statSync(path.join(root, htmlRelative));
  return stat.mtime.toISOString().slice(0, 10);
};

const urls = PUBLIC_ROUTES.map((route) => {
  const loc = absoluteUrl(route.path);
  const lastmod = toLastmod(route.html);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const out = path.join(root, "sitemap.xml");
fs.writeFileSync(out, xml, "utf8");
console.log(`Wrote ${PUBLIC_ROUTES.length} URLs → sitemap.xml`);
