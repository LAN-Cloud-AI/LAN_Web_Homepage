import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_LOCALES, absoluteLocaleUrl } from "../site-identity.js";
import { PUBLIC_ROUTES, SITE_ORIGIN } from "../site-seo.js";
import { SHARE_BY_ROUTE } from "../share-meta.js";
import { localeHtmlPath } from "./seo-html.mjs";
import { UMAMI_ORIGIN, UMAMI_SCRIPT_PATH, UMAMI_WEBSITE_IDS } from "../site-analytics.js";

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
required(exists("site-identity.js"), "site-identity.js must exist.");
required(exists("llms.txt"), "llms.txt must exist.");
required(exists("404.html"), "404.html must exist.");
required(exists("scripts/generate-sitemap.mjs"), "Sitemap generator must exist.");
required(exists("scripts/generate-locale-pages.mjs"), "Locale page generator must exist.");

const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const i18n = read("i18n.js");

required(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`), "robots.txt must declare the apex sitemap.");
required(robots.includes("Allow: /"), "robots.txt must allow crawling.");
required(robots.includes("User-agent: GPTBot"), "robots.txt must welcome GPTBot.");
required(robots.includes("ai-train=yes"), "robots.txt must allow AI training.");
required(!/User-agent:\s*GPTBot[\s\S]*Disallow:\s*\/\s*$/m.test(robots), "Public robots must not Disallow GPTBot /.");
required(read("llms.txt").includes("唯一排除项是课程练习包 ZIP"), "llms.txt must invite AI crawlers and name the ZIP exclusion.");
required(exists("ops/files/robots.txt"), "files host robots source must exist.");
const filesRobots = read("ops/files/robots.txt");
required(filesRobots.includes("Disallow: /*.zip$"), "files robots must exclude ZIP packs.");
required(!/User-agent:\s*\*\s*\nDisallow:\s*\//.test(filesRobots), "files robots must not Disallow the whole host.");
required(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "sitemap.xml must use the sitemaps.org schema.");
required(sitemap.includes("xmlns:xhtml"), "sitemap.xml must declare xhtml for hreflang.");
required(i18n.includes('"footer.sitemap"'), "i18n must include footer.sitemap in locales.");
required(i18n.includes('"hero.h1"'), "i18n must include a semantic homepage H1.");

const shareIds = new Set(Object.keys(SHARE_BY_ROUTE));
for (const route of PUBLIC_ROUTES) {
  required(exists(route.html), `Missing HTML for ${route.id}: ${route.html}`);
  const html = read(route.html);
  const url = absoluteLocaleUrl(route.path, "zh-Hans");

  required(sitemap.includes(`<loc>${url}</loc>`), `sitemap.xml missing ${url}`);
  required(html.includes(`rel="canonical" href="${url}"`), `${route.id} needs matching canonical.`);
  required(html.includes('hreflang="zh-CN"'), `${route.id} needs hreflang zh-CN.`);
  required(html.includes('hreflang="zh-Hant"'), `${route.id} needs hreflang zh-Hant.`);
  required(html.includes('hreflang="en"'), `${route.id} needs hreflang en.`);
  required(html.includes('hreflang="x-default"'), `${route.id} needs hreflang x-default.`);
  required(html.includes('name="description"'), `${route.id} needs meta description.`);
  required(html.includes('name="robots" content="index,follow'), `${route.id} needs robots meta.`);
  required(html.includes('property="og:site_name"'), `${route.id} needs og:site_name.`);
  required(html.includes('property="og:locale"'), `${route.id} needs og:locale.`);
  required(html.includes('name="twitter:title"'), `${route.id} needs twitter:title.`);
  required(html.includes('name="twitter:description"'), `${route.id} needs twitter:description.`);
  required(html.includes('name="twitter:card"'), `${route.id} needs twitter:card.`);
  required(html.includes('type="application/ld+json"'), `${route.id} needs JSON-LD.`);
  required(html.includes('"@type": "Organization"'), `${route.id} JSON-LD must include Organization.`);
  required(html.includes('"@type": "WebPage"'), `${route.id} JSON-LD must include WebPage.`);
  required(html.includes(SITE_ORIGIN), `${route.id} must reference the apex origin.`);
  required(html.includes(`${UMAMI_ORIGIN}${UMAMI_SCRIPT_PATH}`), `${route.id} must embed Umami.`);
  required(html.includes(UMAMI_WEBSITE_IDS.lan), `${route.id} must use the company Umami website id.`);
  required(html.includes('data-lan-analytics="umami"'), `${route.id} must mark the analytics script.`);

  if (route.inShareMeta) {
    required(shareIds.has(route.id), `${route.id} must exist in SHARE_BY_ROUTE.`);
    required(
      SHARE_BY_ROUTE[route.id].path === route.path,
      `${route.id} path must match SHARE_BY_ROUTE.`
    );
  }

  for (const locale of SITE_LOCALES.filter((item) => item !== "zh-Hans")) {
    const generated = localeHtmlPath(route.html, locale);
    required(exists(generated), `Missing generated locale page ${generated}`);
    const generatedHtml = read(generated);
    const localeUrl = absoluteLocaleUrl(route.path, locale);
    required(sitemap.includes(`<loc>${localeUrl}</loc>`), `sitemap.xml missing ${localeUrl}`);
    required(
      generatedHtml.includes(`rel="canonical" href="${localeUrl}"`),
      `${generated} needs locale canonical.`
    );
    required(generatedHtml.includes('hreflang="x-default"'), `${generated} needs hreflang.`);
    required(!generatedHtml.includes("https://global.lancloudtech.com"), `${generated} must not canonicalize to global.`);
  }
}

const locCount = (sitemap.match(/<loc>/g) || []).length;
required(
  locCount === PUBLIC_ROUTES.length * SITE_LOCALES.length,
  `sitemap.xml must list exactly ${PUBLIC_ROUTES.length * SITE_LOCALES.length} URLs.`
);

const home = read("index.html");
required(home.includes('href="./sitemap/"'), "Homepage footer must link to /sitemap/.");
required(home.includes('data-i18n="footer.sitemap"'), "Homepage sitemap link must be i18n-aware.");
required(home.includes('data-i18n="hero.h1"'), "Homepage H1 must use hero.h1.");
required(home.includes("VECT"), "Homepage JSON-LD mentions should still leave VECT in the page.");

const hub = read("ai-course/index.html");
required(hub.includes('href="../sitemap/"'), "AI course hub footer must link to /sitemap/.");

required(exists("en/llms.txt"), "English llms.txt must exist.");
required(exists("zh-Hant/llms.txt"), "Traditional Chinese llms.txt must exist.");
required(read("en/llms.txt").includes("AI crawlers and assistants are welcome"), "English llms.txt must invite AI crawlers.");
required(read("zh-Hant/llms.txt").includes("課程練習包 ZIP"), "Traditional Chinese llms.txt must name the ZIP exclusion.");
required(exists("en/404.html"), "English 404 must exist.");
required(exists("zh-Hant/404.html"), "Traditional Chinese 404 must exist.");

const redirects = read("_redirects");
required(!/\/\*\s+\/index\.html\s+200/.test(redirects), "Pages must not soft-404 via SPA catch-all.");
required(UMAMI_WEBSITE_IDS.lan, "Company Umami website id must be provisioned.");
required(read("404.html").includes(`${UMAMI_ORIGIN}${UMAMI_SCRIPT_PATH}`), "404 must embed Umami.");
required(!read("leadshunter/index.html").includes("data-lan-analytics"), "Hop page must not embed Umami.");
required(exists("ops/nginx/stats.lancloudtech.com.conf"), "stats Nginx vhost must exist.");
required(exists("ops/umami/docker-compose.yml"), "Umami compose file must exist.");
required(exists("ops/nginx/lancloudtech.com.conf"), "Versioned Nginx config must exist.");
const nginx = read("ops/nginx/lancloudtech.com.conf");
required(nginx.includes("server_name www.lancloudtech.com"), "Nginx must isolate the www vhost.");
required(nginx.includes("return 301 https://lancloudtech.com$request_uri"), "www and HTTP must 301 to apex.");
required(nginx.includes("try_files $uri $uri/ $uri.html =404"), "Nginx must hard-404 unknown paths.");
required(nginx.includes("location ^~ /leadshunter"), "Nginx must 301 /leadshunter to the product site.");
required(nginx.includes("$lan_index_canonical"), "Nginx must canonicalize client /index.html without looping directory indexes.");

console.log(
  `PASS: SEO adapters OK — ${PUBLIC_ROUTES.length} routes × ${SITE_LOCALES.length} locales, robots.txt, sitemap.xml, JSON-LD, generated locale trees, and hard 404.`
);
