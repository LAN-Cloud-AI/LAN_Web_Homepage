import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HTML_LANG, SITE_LOCALES, absoluteLocaleUrl, getPageCopy } from "../site-identity.js";
import { PUBLIC_ROUTES, SITE_ORIGIN, buildWebPageJsonLd } from "../site-seo.js";
import { SHARE_BY_ROUTE } from "../share-meta.js";
import { applySeoHead, localeHtmlPath } from "./seo-html.mjs";
import { llmsBody } from "./generate-locale-pages.mjs";
import { getI18nTable } from "../i18n.js";
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

const verifyBusinessSchema = (graph, route, label) => {
  const webPage = graph.find((node) => node["@type"] === "WebPage");
  required(webPage, `${label} must contain a WebPage.`);
  if (["home", "solutions"].includes(route.id)) {
    for (const name of ["VECT", "TACT"]) {
      const service = webPage.mentions?.find((node) => node.name === name);
      required(service?.["@type"] === "Service", `${label} ${name} must describe a service, not an available SaaS application.`);
      required(service.url.endsWith(`/solutions/#${name.toLowerCase()}`), `${label} ${name} must link to its solution section.`);
      required(service.description?.includes("SaaS"), `${label} ${name} must explain SaaS readiness.`);
      required(!service.offers, `${label} ${name} must not invent a self-service offer.`);
    }
  }
  if (route.id.startsWith("ai-course")) {
    required(webPage.isAccessibleForFree === true, `${label} public schedule page is free to read.`);
    const courses = graph.filter((node) => node["@type"] === "Course");
    required(courses.length === (route.id === "ai-course" ? 0 : 1), `${label} course hub and individual training must remain distinct.`);
    for (const course of courses) {
      required(course.isAccessibleForFree === false, `${label} must not label paid training as free.`);
      required(webPage.mainEntity?.["@id"] === course["@id"], `${label} must link the public page to its training.`);
      required(!course.offers, `${label} must not invent a price or offer.`);
    }
  }
};

const verifyPageMetadata = (html, route, locale, label) => {
  const copy = getPageCopy(route.id, locale);
  required(html.includes(`<title>${copy.title}</title>`), `${label} needs current localized title.`);
  required(html.includes(`lang="${HTML_LANG[locale]}"`), `${label} needs correct HTML language.`);
  const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  required(blocks.length === 1, `${label} needs exactly one JSON-LD graph.`);
  const graph = JSON.parse(blocks[0][1])["@graph"];
  verifyBusinessSchema(graph, route, label);
  for (const key of ["description", "robots", "twitter:card"]) {
    required((html.match(new RegExp(`<meta\\s+name="${key}"`, "g")) || []).length === 1, `${label} must have one ${key} meta tag.`);
  }
  if (route.inShareMeta) {
    const share = SHARE_BY_ROUTE[route.id];
    required(html.includes(`property="og:image" content="${share.image}"`), `${label} needs configured OG cover.`);
    required(html.includes(`itemprop="image" content="${share.image}"`), `${label} needs configured itemprop cover.`);
  }
};

// Source-only checks are useful while new HTML and locale trees are being integrated.
// They render heads in memory and never update generated files or call external services.
for (const route of PUBLIC_ROUTES) {
  for (const locale of SITE_LOCALES) {
    const label = `${route.id}/${locale}`;
    verifyBusinessSchema(buildWebPageJsonLd(route.id, {}, locale)["@graph"], route, label);
    let html = '<!doctype html><html><head><title>Old title</title><meta name="description" content="Old description" /></head><body></body></html>';
    html = applySeoHead(applySeoHead(html, route, locale), route, locale);
    verifyPageMetadata(html, route, locale, label);
    required(html.includes(`rel="canonical" href="${absoluteLocaleUrl(route.path, locale)}"`), `${label} canonical must use the apex.`);
    required((html.match(/hreflang=/g) || []).length === 4, `${label} needs three languages and x-default without duplicates.`);
    if (route.inShareMeta) {
      required(SHARE_BY_ROUTE[route.id]?.path === route.path, `${label} share route must match SEO route.`);
      required(SHARE_BY_ROUTE[route.id]?.locales[locale], `${label} needs localized share copy.`);
    }
  }
}
for (const locale of SITE_LOCALES) {
  const body = llmsBody(locale);
  for (const route of PUBLIC_ROUTES) {
    required(body.includes(absoluteLocaleUrl(route.path, locale)), `${locale} llms.txt must cover ${route.id}.`);
  }
  required(body.includes("SaaS"), `${locale} llms.txt must explain solution maturity.`);
}
if (process.argv.includes("--source-only")) {
  console.log(`PASS: SEO source metadata — ${PUBLIC_ROUTES.length} routes × ${SITE_LOCALES.length} locales, business schema, sharing, head updates, and llms outlines (no files generated).`);
  process.exit(0);
}

required(exists("robots.txt"), "robots.txt must exist.");
required(exists("sitemap.xml"), "sitemap.xml must exist.");
required(exists("site-seo.js"), "site-seo.js must exist.");
required(exists("site-identity.js"), "site-identity.js must exist.");
required(exists("llms.txt"), "llms.txt must exist.");
required(exists("404.html"), "404.html must exist.");
required(exists("scripts/generate-sitemap.mjs"), "Sitemap generator must exist.");
required(exists("scripts/generate-locale-pages.mjs"), "Locale page generator must exist.");
required(exists("scripts/baidu-submit.mjs"), "Baidu URL submit script must exist.");
required(read("scripts/baidu-submit.mjs").includes("BAIDU_ZIYUAN_TOKEN"), "Baidu submit must read the lanxin token env.");
required(!/token=[A-Za-z0-9]{8,}/.test(read("scripts/baidu-submit.mjs")), "Baidu submit must not hardcode the API token.");

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
for (const locale of SITE_LOCALES) {
  const table = getI18nTable(locale);
  required(table["new.hero1"] && table["new.hero2"], `${locale} must include the redesigned homepage slogan.`);
}

const shareIds = new Set(Object.keys(SHARE_BY_ROUTE));
for (const route of PUBLIC_ROUTES) {
  required(exists(route.html), `Missing HTML for ${route.id}: ${route.html}`);
  const html = read(route.html);
  const url = absoluteLocaleUrl(route.path, "zh-Hans");
  verifyPageMetadata(html, route, "zh-Hans", route.html);
  required(/src="(?:\/|(?:\.\.?\/)*)geo-host\.js"/.test(html), `${route.html} must preserve geographic steering.`);

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
    verifyPageMetadata(generatedHtml, route, locale, generated);
    required(generatedHtml.includes('src="/geo-host.js"'), `${generated} must preserve geographic steering.`);
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
required(home.includes('data-i18n="new.hero1"') && home.includes('data-i18n="new.hero2"'), "Homepage H1 must use the redesigned two-line slogan keys.");
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
required(
  nginx.includes("baidu_verify_[A-Za-z0-9-]+"),
  "Nginx must serve hyphenated Baidu verify files on www without a cross-host 301.",
);
const baiduVerify = fs.readdirSync(root).filter((name) => /^baidu_verify_[A-Za-z0-9-]+\.html$/.test(name));
required(baiduVerify.length > 0, "A Baidu site-verification HTML file must live at the site root.");
required(nginx.includes("try_files $uri $uri/ $uri.html =404"), "Nginx must hard-404 unknown paths.");
required(nginx.includes("location ^~ /leadshunter"), "Nginx must 301 /leadshunter to the product site.");
required(nginx.includes("$lan_index_canonical"), "Nginx must canonicalize client /index.html without looping directory indexes.");

console.log(
  `PASS: SEO adapters OK — ${PUBLIC_ROUTES.length} routes × ${SITE_LOCALES.length} locales, robots.txt, sitemap.xml, JSON-LD, generated locale trees, and hard 404.`
);
