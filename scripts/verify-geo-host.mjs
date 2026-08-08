import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN } from "../site-seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
};

const htmlRoutes = [
  "index.html",
  "leadshunter/index.html",
  "internal-expense/index.html",
  "ai-course/index.html",
  "ai-course/fde/index.html",
  "ai-course/mvp-3day/index.html",
  "contact/wecom/index.html",
  "sitemap/index.html",
];

required(exists("geo-host.js"), "geo-host.js must exist.");
required(exists("workers/geo/src/index.js"), "lan-geo Worker source must exist.");
required(exists("workers/geo/wrangler.toml"), "lan-geo wrangler.toml must exist.");
required(exists("scripts/prepare-pages-assets.mjs"), "prepare-pages-assets.mjs must exist.");
required(exists("scripts/deploy-pages.mjs"), "deploy-pages.mjs must exist.");
required(exists("scripts/cf-dns-global-pages.mjs"), "cf-dns-global-pages.mjs must exist.");
required(exists("scripts/load-cloudflare-pages-env.mjs"), "Pages env loader must exist.");

const geoHost = read("geo-host.js");
const geoWorker = read("workers/geo/src/index.js");
const preparePages = read("scripts/prepare-pages-assets.mjs");
const dnsGlobal = read("scripts/cf-dns-global-pages.mjs");

required(geoHost.includes('GLOBAL_HOST = "global.lancloudtech.com"'), "geo-host.js must target global.lancloudtech.com.");
required(geoHost.includes("lan-geo.mingxuan400.workers.dev"), "geo-host.js must call lan-geo workers.dev.");
required(geoHost.includes("MicroMessenger"), "geo-host.js must skip WeChat UA.");
required(geoHost.includes("BOT_RE") || geoHost.includes("bot"), "geo-host.js must skip crawler UA.");
required(geoHost.includes('params.get("host")'), "geo-host.js must honor ?host= override.");

required(geoWorker.includes('country === "CN"') || geoWorker.includes('code === "CN"'), "Geo Worker must treat only CN as mainland.");
required(geoWorker.includes("overseas"), "Geo Worker must label non-CN as overseas.");
required(geoWorker.includes("access-control-allow-origin"), "Geo Worker must send CORS headers.");

required(preparePages.includes("X-Robots-Tag: noindex"), "Pages prepare must emit noindex _headers.");
required(dnsGlobal.includes("global.lancloudtech.com"), "DNS script must manage global host.");
required(dnsGlobal.includes("proxied: true"), "global CNAME must be orange-cloud.");
required(!dnsGlobal.includes("upsertA(\"lancloudtech.com\")"), "DNS global script must not rewrite apex.");

for (const file of htmlRoutes) {
  const html = read(file);
  required(html.includes('src="/geo-host.js"'), `${file} must load /geo-host.js.`);
  required(
    html.includes(`rel="canonical" href="${SITE_ORIGIN}`) || html.includes('rel="canonical" href="https://lancloudtech.com'),
    `${file} canonical must stay on apex lancloudtech.com.`
  );
  required(!html.includes("https://global.lancloudtech.com"), `${file} must not hardcode global as canonical host.`);
}

const pkg = read("package.json");
required(pkg.includes("deploy:pages"), "package.json must expose deploy:pages.");
required(pkg.includes("deploy:geo-worker"), "package.json must expose deploy:geo-worker.");

console.log(`PASS: Geo host steering — ${htmlRoutes.length} pages, lan-geo Worker, Pages _headers, global DNS script.`);
