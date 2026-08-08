/**
 * One-shot / idempotent SEO head sync for public HTML routes.
 * Run: node scripts/patch-seo-heads.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SHARE_BY_ROUTE } from "../share-meta.js";
import { buildWebPageJsonLd, PUBLIC_ROUTES, SITE_NAME } from "../site-seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pageCopy = {
  home: {
    title: "兰芯云朵 · LAN Cloud AI",
    description:
      "兰芯云朵用 AI 重新定义汽车零售与售后：看见公域信号，理解客户关系，调度车间流转。",
    ogDescription: "看见 → 理解 → 调度 → 判断。先在真实门店验证，再契约先行地 SaaS 化。",
  },
  leadshunter: {
    title: "LeadsHunter 线索猎手 · LAN Cloud AI",
    description:
      "LeadsHunter 线索猎手：用 AI 识别公开内容中的真实购车意向，把高价值线索直接交给销售。",
    ogDescription: "用 AI 识别公开内容中的真实购车意向，把高价值线索直接交给销售。",
  },
  "internal-expense": {
    title: "云朵记账 · 开源订阅与报销管理 · LAN Cloud AI",
    description:
      "云朵记账：面向中小企业的开源订阅资产与报销管理产品，让固定支出与报销批次都清楚可追溯。",
    ogDescription: "面向中小企业的开源订阅资产与报销管理产品，让固定支出与报销批次都清楚可追溯。",
  },
  "ai-course": {
    title: "从 AI 应用到一线 FDE · 企业 AI 转型人才培养 · 兰芯云朵",
    description:
      "兰芯云朵企业 AI 转型人才培养体系：84 课时通用 FDE 培养路径，以及三天企业 AI 工具 MVP 定制课。",
  },
  "ai-course-fde": {
    title: "FDE 公开课表 · 21 课能力进阶 · 兰芯云朵",
    description:
      "公开课表版 FDE 培养路径：初阶、中阶、高阶共 21 课，建立从 AI 应用到生产交付的完整能力。",
  },
  "ai-course-mvp-3day": {
    title: "企业定制三天课 · 业务到 MVP · 兰芯云朵",
    description: "三天企业定制工作坊：从真实业务问题出发，做出可运行的 AI 工具 MVP。",
  },
  wecom: {
    title: "联系兰芯云朵销售经理 · LAN Cloud AI",
    description: "添加兰芯云朵销售经理企业微信，了解产品与合作。",
  },
  sitemap: {
    title: "网站地图 · 兰芯云朵",
    description: "兰芯云朵官网公开页面索引：产品、AI 课程、联系与开源入口。",
  },
};

const upsertMeta = (html, { attr, key, content }) => {
  const re = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`,
    "i"
  );
  const tag = `<meta ${attr}="${key}" content="${content}" />`;
  if (re.test(html)) return html.replace(re, tag);
  // Insert after canonical when present.
  if (html.includes('rel="canonical"')) {
    return html.replace(
      /(<link\s+rel="canonical"[^>]*>)/i,
      `$1\n  ${tag}`
    );
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
};

const upsertTwitter = (html, name, content) =>
  upsertMeta(html, { attr: "name", key: name, content });

const upsertOg = (html, property, content) =>
  upsertMeta(html, { attr: "property", key: property, content });

const upsertLdJson = (html, json) => {
  const block = `  <script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n  </script>`;
  if (/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
    return html.replace(
      /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
      block.trimStart()
    );
  }
  return html.replace(/<\/head>/i, `${block}\n</head>`);
};

for (const route of PUBLIC_ROUTES) {
  const copy = pageCopy[route.id];
  if (!copy) throw new Error(`Missing page copy for ${route.id}`);
  const file = path.join(root, route.html);
  let html = fs.readFileSync(file, "utf8");

  const share = route.inShareMeta ? SHARE_BY_ROUTE[route.id] : null;
  const ogDesc = copy.ogDescription || copy.description;
  const twitterTitle = share?.locales?.["zh-Hans"]?.title || copy.title;
  const twitterDesc = share?.locales?.["zh-Hans"]?.desc || ogDesc;

  html = upsertMeta(html, {
    attr: "name",
    key: "robots",
    content: "index,follow,max-image-preview:large",
  });
  html = upsertOg(html, "og:site_name", SITE_NAME);
  html = upsertOg(html, "og:locale", "zh_CN");
  // Keep a single alternate pair by rewriting both if present; ensure at least zh_TW + en_US.
  if (!html.includes('property="og:locale:alternate"')) {
    html = html.replace(
      /(<meta\s+property="og:locale"[^>]*>)/i,
      `$1\n  <meta property="og:locale:alternate" content="zh_TW" />\n  <meta property="og:locale:alternate" content="en_US" />`
    );
  }
  html = upsertTwitter(html, "twitter:title", twitterTitle);
  html = upsertTwitter(html, "twitter:description", twitterDesc);

  const jsonLd = buildWebPageJsonLd(route.id, {
    title: copy.title,
    description: copy.description,
  });
  html = upsertLdJson(html, jsonLd);

  fs.writeFileSync(file, html, "utf8");
  console.log(`SEO head synced: ${route.html}`);
}
