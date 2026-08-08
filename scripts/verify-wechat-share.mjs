import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHARE_BY_ROUTE } from "../share-meta.js";

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
  "https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images/generated/share";

const routes = [
  {
    id: "home",
    html: "index.html",
    url: "https://lancloudtech.com/",
    image: `${OSS_SHARE}/og-home-v2.png`,
    wiredIn: "main.js",
    wireNeedle: 'initWechatShare("home"',
  },
  {
    id: "leadshunter",
    html: "leadshunter/index.html",
    url: "https://lancloudtech.com/leadshunter/",
    image: `${OSS_SHARE}/og-leadshunter-v2.png`,
    wiredIn: "leadshunter/index.html",
    wireNeedle: 'initWechatShare("leadshunter")',
  },
  {
    id: "internal-expense",
    html: "internal-expense/index.html",
    url: "https://lancloudtech.com/internal-expense/",
    image: `${OSS_SHARE}/og-internal-expense-v2.png`,
    wiredIn: "internal-expense/index.html",
    wireNeedle: 'initWechatShare("internal-expense")',
  },
  {
    id: "ai-course",
    html: "ai-course/index.html",
    url: "https://lancloudtech.com/ai-course/",
    image: `${OSS_SHARE}/og-ai-course-v2.png`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "ai-course-fde",
    html: "ai-course/fde/index.html",
    url: "https://lancloudtech.com/ai-course/fde/",
    image: `${OSS_SHARE}/og-ai-course-fde-v2.png`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "ai-course-mvp-3day",
    html: "ai-course/mvp-3day/index.html",
    url: "https://lancloudtech.com/ai-course/mvp-3day/",
    image: `${OSS_SHARE}/og-ai-course-mvp-3day-v2.png`,
    wiredIn: "ai-course/ai-course.js",
    wireNeedle: "initWechatShare",
  },
  {
    id: "wecom",
    html: "contact/wecom/index.html",
    url: "https://lancloudtech.com/contact/wecom/",
    image: `${OSS_SHARE}/og-wecom-v2.png`,
    wiredIn: "contact/wecom/index.html",
    wireNeedle: 'initWechatShare("wecom")',
  },
];

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
required(wechatShare.includes("workers.dev") && wechatShare.includes("/api/wechat/jssdk"), "wechat-share.js must call the workers.dev jssdk endpoint.");
required(wechatShare.includes("updateAppMessageShareData"), "wechat-share.js must configure friend share.");
required(wechatShare.includes("updateTimelineShareData"), "wechat-share.js must configure timeline share.");
required(worker.includes("WECHAT_OA_APP_ID"), "Worker must read OA AppID secret.");
required(worker.includes("jsapi_ticket"), "Worker must fetch jsapi_ticket.");
required(prepare.includes('"workers"'), "prepare-worker-assets must exclude workers/.");

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
  const imageName = path.basename(route.image);
  required(shareMeta.includes(imageName), `share-meta.js must reference ${imageName}`);
  required(shareMeta.includes("OSS_SHARE_BASE"), "share-meta.js must define OSS_SHARE_BASE.");
  images.add(route.image);
  urls.add(route.url);
}

const i18n = read("i18n.js");
required(i18n.includes("meta.shareTitle"), "Homepage i18n must define meta.shareTitle.");
required(i18n.includes("meta.shareDescription"), "Homepage i18n must define meta.shareDescription.");
required(
  i18n.includes('meta[property="og:title"]') && i18n.includes("shareTitle"),
  "Homepage i18n must apply short shareTitle to og:title."
);

required(images.size === routes.length, "Each route must have a unique og:image.");
required(urls.size === routes.length, "Each route must have a unique og:url.");

const main = read("main.js");
required(main.includes("initWechatShare"), "Homepage main.js must init WeChat share.");
required(main.includes("refreshWechatShare"), "Homepage must refresh share on locale change.");

const courseJs = read("ai-course/ai-course.js");
required(courseJs.includes("initWechatShare"), "Course pages must init WeChat share.");
required(courseJs.includes("refreshWechatShare"), "Course pages must refresh share on locale change.");

console.log("PASS: WeChat share cards, per-route OG images, and JS-SDK wiring are present.");
