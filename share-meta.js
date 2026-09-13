import { SITE_ORIGIN, absoluteLocaleUrl } from "./site-identity.js";

export { SITE_ORIGIN };

export const OSS_SHARE_BASE =
  "https://img.lancloudtech.com/lanxin/webpage/images/generated/share";

/** @typedef {"home"|"solutions"|"practice"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"|"sitemap"} ShareRouteId */

/**
 * Canonical share cards for each HTML route.
 * Keep titles/descriptions short so WeChat shows one clean card without truncation spam.
 * Static Chinese copy in HTML meta is the crawler source of truth;
 * locale variants here feed WeChat JS-SDK after language switches.
 */
export const SHARE_BY_ROUTE = {
  home: {
    path: "/",
    image: `${OSS_SHARE_BASE}/og-home-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "兰芯云朵",
        desc: "汽车行业 AI 产品与企业实战培训",
      },
      "zh-Hant": {
        title: "蘭芯雲朵",
        desc: "汽車行業 AI 產品與企業實戰培訓",
      },
      en: {
        title: "LAN Cloud AI",
        desc: "Automotive AI & team training",
      },
    },
  },
  solutions: {
    path: "/solutions/",
    image: `${OSS_SHARE_BASE}/og-solutions-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": { title: "汽车业务 AI 方案", desc: "从公域获客到客户关系与车间协同" },
      "zh-Hant": { title: "汽車業務 AI 方案", desc: "從公域獲客到客戶關係與車間協同" },
      en: { title: "Automotive AI Solutions", desc: "Leads, care & workshop flow" },
    },
  },
  practice: {
    path: "/practice/",
    image: `${OSS_SHARE_BASE}/og-practice-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": { title: "兰芯业务实践", desc: "业务规则、数据与 AI 的交付实践" },
      "zh-Hant": { title: "蘭芯業務實踐", desc: "業務規則、資料與 AI 的交付實踐" },
      en: { title: "Business Practice", desc: "Rules, data & AI at work" },
    },
  },
  "internal-expense": {
    path: "/internal-expense/",
    image: `${OSS_SHARE_BASE}/og-internal-expense-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "云朵记账",
        desc: "开源订阅资产与报销管理",
      },
      "zh-Hant": {
        title: "雲朵記賬",
        desc: "開源訂閱資產與報銷管理",
      },
      en: {
        title: "Cloud Ledger",
        desc: "Subscriptions & expenses",
      },
    },
  },
  "ai-course": {
    path: "/ai-course/",
    image: `${OSS_SHARE_BASE}/og-ai-course-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "企业 AI 实战培训",
        desc: "实战课｜3天MVP｜84课时FDE",
      },
      "zh-Hant": {
        title: "企業 AI 實戰培訓",
        desc: "實戰課｜3天MVP｜84課時FDE",
      },
      en: {
        title: "Enterprise AI Training",
        desc: "Practice · 3-day MVP · 84h FDE",
      },
    },
  },
  "ai-course-fde": {
    path: "/ai-course/fde/",
    image: `${OSS_SHARE_BASE}/og-ai-course-fde-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "FDE 公开课表",
        desc: "21 课 · 84 课时 · 三阶段进阶",
      },
      "zh-Hant": {
        title: "FDE 公開課表",
        desc: "21 課 · 84 課時 · 三階段進階",
      },
      en: {
        title: "FDE Schedule",
        desc: "21 lessons to delivery",
      },
    },
  },
  "ai-course-mvp-3day": {
    path: "/ai-course/mvp-3day/",
    image: `${OSS_SHARE_BASE}/og-ai-course-mvp-3day-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "企业定制三天课",
        desc: "三天做出 MVP",
      },
      "zh-Hant": {
        title: "企業定制三天課",
        desc: "三天做出 MVP",
      },
      en: {
        title: "3-Day Workshop",
        desc: "Ship an MVP in 3 days",
      },
    },
  },
  wecom: {
    path: "/contact/wecom/",
    image: `${OSS_SHARE_BASE}/og-wecom-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": {
        title: "联系兰芯云朵",
        desc: "产品演示与企业培训咨询",
      },
      "zh-Hant": {
        title: "聯繫蘭芯雲朵",
        desc: "產品展示與企業培訓諮詢",
      },
      en: {
        title: "Contact Us",
        desc: "Products & training on WeCom",
      },
    },
  },
  sitemap: {
    path: "/sitemap/",
    image: `${OSS_SHARE_BASE}/og-sitemap-v3.jpg`,
    imageWidth: 600,
    imageHeight: 600,
    locales: {
      "zh-Hans": { title: "兰芯官网导航", desc: "产品、实践、课程与联系入口" },
      "zh-Hant": { title: "蘭芯官網導覽", desc: "產品、實踐、課程與聯繫入口" },
      en: { title: "Explore LAN Cloud AI", desc: "Products, practice & learning" },
    },
  },
};

/**
 * @param {ShareRouteId} routeId
 * @param {string} [locale]
 */
export const getSharePayload = (routeId, locale = "zh-Hans") => {
  const route = SHARE_BY_ROUTE[routeId];
  if (!route) throw new Error(`Unknown share route: ${routeId}`);
  const copy = route.locales[locale] || route.locales["zh-Hans"];
  return {
    title: copy.title,
    desc: copy.desc,
    link: absoluteLocaleUrl(route.path, locale),
    imgUrl: route.image,
    imageWidth: route.imageWidth,
    imageHeight: route.imageHeight,
  };
};

export const SHARE_ROUTE_IDS = Object.keys(SHARE_BY_ROUTE);
