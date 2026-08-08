import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { absoluteUrl, PUBLIC_ROUTES, SITE_ORIGIN } from "../site-seo.js";
import { SHARE_BY_ROUTE } from "../share-meta.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
};

required(exists("robots.txt"), "robots.txt must exist.");
required(exists("sitemap.xml"), "sitemap.xml must exist.");
required(exists("site-seo.js"), "site-seo.js must exist.");
required(exists("sitemap/index.html"), "Human sitemap page must exist.");
required(exists("scripts/generate-sitemap.mjs"), "Sitemap generator must exist.");

const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const i18n = read("i18n.js");

required(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`), "robots.txt must declare the apex sitemap.");
required(robots.includes("Allow: /"), "robots.txt must allow crawling.");
required(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "sitemap.xml must use the sitemaps.org schema.");
required(i18n.includes('"footer.sitemap"'), "i18n must include footer.sitemap in locales.");

const shareIds = new Set(Object.keys(SHARE_BY_ROUTE));
for (const route of PUBLIC_ROUTES) {
  required(exists(route.html), `Missing HTML for ${route.id}: ${route.html}`);
  const html = read(route.html);
  const url = absoluteUrl(route.path);

  required(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml missing ${url}`);
  required(html.includes(`rel="canonical" href="${url}"`), `${route.id} needs matching canonical.`);
  required(html.includes('name="description"'), `${route.id} needs meta description.`);
  required(html.includes('name="robots" content="index,follow'), `${route.id} needs robots meta.`);
  required(html.includes('property="og:site_name"'), `${route.id} needs og:site_name.`);
  required(html.includes('property="og:locale" content="zh_CN"'), `${route.id} needs og:locale.`);
  required(html.includes('property="og:locale:alternate" content="zh_TW"'), `${route.id} needs og:locale:alternate zh_TW.`);
  required(html.includes('property="og:locale:alternate" content="en_US"'), `${route.id} needs og:locale:alternate en_US.`);
  required(html.includes('name="twitter:title"'), `${route.id} needs twitter:title.`);
  required(html.includes('name="twitter:description"'), `${route.id} needs twitter:description.`);
  required(html.includes('name="twitter:card"'), `${route.id} needs twitter:card.`);
  required(html.includes('type="application/ld+json"'), `${route.id} needs JSON-LD.`);
  required(html.includes('"@type": "Organization"'), `${route.id} JSON-LD must include Organization.`);
  required(html.includes('"@type": "WebPage"'), `${route.id} JSON-LD must include WebPage.`);
  required(html.includes(SITE_ORIGIN), `${route.id} must reference the apex origin.`);

  if (route.inShareMeta) {
    required(shareIds.has(route.id), `${route.id} must exist in SHARE_BY_ROUTE.`);
    required(
      SHARE_BY_ROUTE[route.id].path === route.path,
      `${route.id} path must match SHARE_BY_ROUTE.`
    );
  }
}

const locCount = (sitemap.match(/<loc>/g) || []).length;
required(locCount === PUBLIC_ROUTES.length, `sitemap.xml must list exactly ${PUBLIC_ROUTES.length} URLs.`);

const home = read("index.html");
required(home.includes('href="./sitemap/"'), "Homepage footer must link to /sitemap/.");
required(home.includes('data-i18n="footer.sitemap"'), "Homepage sitemap link must be i18n-aware.");

const hub = read("ai-course/index.html");
required(hub.includes('href="../sitemap/"'), "AI course hub footer must link to /sitemap/.");

console.log(
  `PASS: SEO adapters OK — ${PUBLIC_ROUTES.length} routes, robots.txt, sitemap.xml, JSON-LD, and share-meta alignment.`
);
