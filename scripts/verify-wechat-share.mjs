import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHARE_BY_ROUTE, getSharePayload } from "../share-meta.js";
import { PUBLIC_ROUTES } from "../site-seo.js";
import { SITE_LOCALES, absoluteLocaleUrl } from "../site-identity.js";
import { localeHtmlPath } from "./seo-html.mjs";
import { isPublicAsset } from "./website-versions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));

/** WeChat friend-card title/desc stay on one line when kept short. */
const MAX_SHARE_TITLE = 16;
const MAX_SHARE_DESC = 22;

const required = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
};

const OSS_SHARE =
  "https://img.lancloudtech.com/lanxin/webpage/images/generated/share";

const routes = [
  {
    id: "home",
    html: "index.html",
    url: "https://lancloudtech.com/",
    image: `${OSS_SHARE}/og-home-v3.jpg`,
    wiredIn: "company.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "solutions",
    html: "solutions/index.html",
    url: "https://lancloudtech.com/solutions/",
    image: `${OSS_SHARE}/og-solutions-v3.jpg`,
    wiredIn: "company.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "practice",
    html: "practice/index.html",
    url: "https://lancloudtech.com/practice/",
    image: `${OSS_SHARE}/og-practice-v3.jpg`,
    wiredIn: "company.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "internal-expense",
    html: "internal-expense/index.html",
    url: "https://lancloudtech.com/internal-expense/",
    image: `${OSS_SHARE}/og-internal-expense-v3.jpg`,
    wiredIn: "locale-boot.js",
    wireNeedle: "initWechatShare(shareRoute",
  },
  {
    id: "ai-course",
    html: "ai-course/index.html",
    url: "https://lancloudtech.com/ai-course/",
    image: `${OSS_SHARE}/og-ai-course-v3.jpg`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "ai-course-fde",
    html: "ai-course/fde/index.html",
    url: "https://lancloudtech.com/ai-course/fde/",
    image: `${OSS_SHARE}/og-ai-course-fde-v3.jpg`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "ai-course-mvp-3day",
    html: "ai-course/mvp-3day/index.html",
    url: "https://lancloudtech.com/ai-course/mvp-3day/",
    image: `${OSS_SHARE}/og-ai-course-mvp-3day-v3.jpg`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "wecom",
    html: "contact/wecom/index.html",
    url: "https://lancloudtech.com/contact/wecom/",
    image: `${OSS_SHARE}/og-wecom-v3.jpg`,
    wiredIn: "locale-boot.js",
    wireNeedle: "initWechatShare(shareRoute",
  },
  {
    id: "sitemap",
    html: "sitemap/index.html",
    url: "https://lancloudtech.com/sitemap/",
    image: `${OSS_SHARE}/og-sitemap-v3.jpg`,
    wiredIn: "locale-boot.js",
    wireNeedle: "initWechatShare(shareRoute",
  },
];

required(routes.length === PUBLIC_ROUTES.length && PUBLIC_ROUTES.every(route => route.inShareMeta && routes.some(card => card.id === route.id)), "Every public route must have a dedicated share card, including sitemap.");
required(exists("share-meta.js"), "share-meta.js must exist.");
required(exists("wechat-share.js"), "wechat-share.js must exist.");
required(exists("workers/wechat-jssdk/src/index.js"), "WeChat JS-SDK Worker must exist.");
required(exists("workers/wechat-jssdk/wrangler.toml"), "Worker wrangler.toml must exist.");
required(exists("workers/wechat-jssdk/.dev.vars.example"), "Worker .dev.vars.example must exist.");

const shareMeta = read("share-meta.js");
const wechatShare = read("wechat-share.js");
const worker = read("workers/wechat-jssdk/src/index.js");
const prepare = read("scripts/prepare-worker-assets.mjs");

required(shareMeta.includes("SHARE_BY_ROUTE"), "share-meta.js must export SHARE_BY_ROUTE.");
required(wechatShare.includes("https://wechat.lancloudtech.com/api/wechat/jssdk"), "wechat-share.js must call the dedicated first-party jssdk endpoint.");
required(wechatShare.includes("updateAppMessageShareData"), "wechat-share.js must configure friend share.");
required(wechatShare.includes("updateTimelineShareData"), "wechat-share.js must configure timeline share.");
required(worker.includes("WECHAT_OA_APP_ID"), "Worker must read OA AppID secret.");
required(worker.includes("jsapi_ticket"), "Worker must fetch jsapi_ticket.");
required(prepare.includes("publicAssetFiles") && !isPublicAsset("workers/wechat-jssdk/src/index.js") && !isPublicAsset("workers/wechat-jssdk/.dev.vars"), "Production allowlist must exclude WeChat Worker code and secrets.");

const images = new Set();
const urls = new Set();

for (const route of routes) {
  const html = read(route.html);
  const localImage = `images/generated/share/${path.basename(route.image)}`;
  const share = SHARE_BY_ROUTE[route.id];
  required(share, `share-meta.js missing route ${route.id}`);
  const zh = share.locales["zh-Hans"];
  required(zh?.title && zh?.desc, `${route.id} needs zh-Hans title/desc`);
  required(
    [...zh.title].length <= MAX_SHARE_TITLE,
    `${route.id} zh title too long for one WeChat card (${[...zh.title].length}>${MAX_SHARE_TITLE}): ${zh.title}`
  );
  required(
    [...zh.desc].length <= MAX_SHARE_DESC,
    `${route.id} zh desc too long for one WeChat card (${[...zh.desc].length}>${MAX_SHARE_DESC}): ${zh.desc}`
  );
  for (const [locale, copy] of Object.entries(share.locales)) {
    required(
      [...copy.title].length <= MAX_SHARE_TITLE + 8,
      `${route.id} ${locale} title too long: ${copy.title}`
    );
    required(
      [...copy.desc].length <= MAX_SHARE_DESC + 10,
      `${route.id} ${locale} desc too long: ${copy.desc}`
    );
  }
  required(exists(localImage), `Missing share image ${localImage}`);
  const bytes = fs.readFileSync(path.join(root, localImage));
  required(bytes[0] === 0xff && bytes[1] === 0xd8, `${route.id}: thumbnail must really be JPEG`);
  required(bytes.length < 100 * 1024, `${route.id}: keep thumbnail under the project 100 KiB transfer budget`);
  let dimensions;
  for (let offset = 2; offset < bytes.length - 9;) {
    required(bytes[offset] === 0xff, `${route.id}: malformed JPEG marker`);
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      dimensions = { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
      break;
    }
    offset += length + 2;
  }
  required(dimensions?.width === 600 && dimensions?.height === 600, `${route.id}: square thumbnail must be 600 × 600`);
  required(share.imageWidth === dimensions.width && share.imageHeight === dimensions.height, `${route.id}: metadata dimensions must match the actual image`);
  required(html.includes(`property="og:url" content="${route.url}"`), `${route.id} needs og:url`);
  required(html.includes(`property="og:image" content="${route.image}"`), `${route.id} needs route-specific og:image`);
  required(html.includes(`itemprop="image" content="${route.image}"`), `${route.id} needs itemprop image`);
  required(
    html.includes(`property="og:title" content="${zh.title}"`),
    `${route.id} og:title must match short share-meta copy`
  );
  required(
    html.includes(`property="og:description" content="${zh.desc}"`),
    `${route.id} og:description must match short share-meta copy`
  );
  required(
    html.includes(`itemprop="name" content="${zh.title}"`),
    `${route.id} itemprop name must match short share-meta copy`
  );
  required(
    html.includes(`itemprop="description" content="${zh.desc}"`),
    `${route.id} itemprop description must match short share-meta copy`
  );
  required(html.includes(`data-share-route="${route.id}"`), `${route.id} needs data-share-route`);
  required(read(route.wiredIn).includes(route.wireNeedle), `${route.id} must wire WeChat share via ${route.wiredIn}`);
  if (route.wiredIn === "company.js") {
    required(html.includes("company.js"), `${route.id} must load the shared company page controller.`);
    required(read("company.js").includes("dataset.shareRoute"), "Company pages must select their own share route.");
  }
  if (route.wiredIn === "locale-boot.js") {
    required(html.includes("locale-boot.js"), `${route.id} must load locale and share initialization.`);
    required(read("locale-boot.js").includes("dataset?.shareRoute"), "Shared locale initialization must select the page's own share route.");
  }
  if (route.reuseImageFrom) {
    required(route.image === SHARE_BY_ROUTE[route.reuseImageFrom].image, `${route.id} must reuse only its declared brand cover.`);
  }
  const imageName = path.basename(route.image);
  required(shareMeta.includes(imageName), `share-meta.js must reference ${imageName}`);
  required(shareMeta.includes("OSS_SHARE_BASE"), "share-meta.js must define OSS_SHARE_BASE.");
  images.add(route.image);
  urls.add(route.url);
}

const i18n = read("i18n.js");
required(i18n.includes("meta.shareTitle"), "Homepage i18n must define meta.shareTitle.");
required(i18n.includes("meta.shareDescription"), "Homepage i18n must define meta.shareDescription.");
required(!i18n.includes('document.title = title'), "Shared UI translation must not overwrite route-specific static SEO titles.");

required(images.size === routes.length, "Each public route must have its own image, without homepage fallback reuse.");
required(urls.size === routes.length, "Each route must have a unique og:url.");

const main = read("company.js");
required(main.includes("initWechatShare"), "Homepage main.js must init WeChat share.");
required(main.includes("setLocale(button.dataset.locale)"), "Company language buttons must navigate to the selected locale.");
required(i18n.includes("location.assign(localeAwareUrl("), "Locale changes must reload localized metadata and initialize sharing for the selected page.");

const courseJs = read("ai-course/ai-course.js");
required(courseJs.includes("initWechatShare"), "Course pages must init WeChat share.");
required(courseJs.includes("refreshWechatShare"), "Course pages must refresh share on locale change.");

const escape = value => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const includeDist = process.argv.includes("--dist");
for (const route of PUBLIC_ROUTES) {
  for (const locale of SITE_LOCALES) {
    const share = getSharePayload(route.id, locale);
    const relative = localeHtmlPath(route.html, locale);
    for (const base of includeDist ? ["", "dist/"] : [""]) {
      const html = read(`${base}${relative}`);
      const url = share.link;
      for (const [attr, key, value] of [
        ["property", "og:title", share.title], ["property", "og:description", share.desc],
        ["property", "og:url", url], ["property", "og:image", share.imgUrl],
        ["property", "og:image:secure_url", share.imgUrl], ["property", "og:image:type", "image/jpeg"],
        ["property", "og:image:width", 600], ["property", "og:image:height", 600],
        ["itemprop", "image", share.imgUrl], ["itemprop", "name", share.title], ["itemprop", "description", share.desc],
        ["name", "twitter:image", share.imgUrl],
      ]) {
        required(html.includes(`${attr}="${key}" content="${escape(value)}"`), `${base}${relative}: ${key} must match its localized card`);
        const tagKey = new RegExp(`<meta[^>]+${attr}="${key.replaceAll(".", "\\.")}"`, "g");
        required([...html.matchAll(tagKey)].length === 1, `${base}${relative}: ${key} must occur once`);
      }
      required(html.includes(`data-share-route="${route.id}"`), `${base}${relative}: runtime share route must be present`);
      const imageGroup = [...html.matchAll(/<meta\b[^>]*property="(og:image(?::[\w]+)?)"[^>]*>/g)].map(match => match[1]);
      required(imageGroup.join(",") === "og:image,og:image:secure_url,og:image:type,og:image:width,og:image:height,og:image:alt", `${base}${relative}: OGP image properties must follow their image root in one complete group`);
      required(share.link === absoluteLocaleUrl(route.path, locale), `${relative}: sharing must preserve its locale`);
    }
  }
}
console.log(`PASS: 9 unique square JPEG cards, 27 localized metadata sets${includeDist ? " plus 27 production routes" : ""}, and JS-SDK wiring.`);
