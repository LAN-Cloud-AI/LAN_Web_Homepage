export const SITE_ORIGIN = "https://lancloudtech.com";

/** @typedef {"zh-Hans"|"zh-Hant"|"en"} SiteLocale */
/** @typedef {"home"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"|"sitemap"|"not-found"} SeoCopyId */

export const DEFAULT_LOCALE = "zh-Hans";

export const SITE_LOCALES = ["zh-Hans", "zh-Hant", "en"];

export const LOCALE_PREFIX = {
  "zh-Hans": "",
  "zh-Hant": "/zh-Hant",
  en: "/en",
};

export const HTML_LANG = {
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-Hant",
  en: "en",
};

export const HREFLANG = {
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-Hant",
  en: "en",
};

export const OG_LOCALE = {
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW",
  en: "en_US",
};

export const JSON_LD_LANG = {
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-Hant",
  en: "en",
};

/** @type {Record<SiteLocale, { siteName: string, brand: string, tagline: string, company: string, imageAlt: string }>} */
export const IDENTITY = {
  "zh-Hans": {
    siteName: "兰芯云朵 · LAN Cloud AI",
    brand: "兰芯云朵",
    tagline: "兰芯云朵用 AI 重新定义汽车零售与售后：看见公域信号，理解客户关系，调度车间流转。",
    company: "四川兰芯云朵智能科技有限公司",
    imageAlt: "兰芯云朵标志",
  },
  "zh-Hant": {
    siteName: "蘭芯雲朵 · LAN Cloud AI",
    brand: "蘭芯雲朵",
    tagline: "蘭芯雲朵用 AI 重新定義汽車零售與售後：看見公域訊號，理解客戶關係，調度車間流轉。",
    company: "四川蘭芯雲朵智能科技有限公司",
    imageAlt: "蘭芯雲朵標誌",
  },
  en: {
    siteName: "LAN Cloud AI",
    brand: "LAN Cloud AI",
    tagline:
      "LAN Cloud AI redefines automotive retail and aftersales with AI: see public signals, understand customer relationships, orchestrate workshop flow.",
    company: "Sichuan Lanxin Yunduo Intelligent Technology Co., Ltd.",
    imageAlt: "LAN Cloud AI logo",
  },
};

/** Default zh-Hans site name used by older verify scripts. */
export const SITE_NAME = IDENTITY["zh-Hans"].siteName;

/**
 * SEO document title / long description / image alt per route and locale.
 * WeChat share cards stay in share-meta.js.
 * @type {Record<SeoCopyId, Record<SiteLocale, { title: string, description: string, imageAlt: string }>>}
 */
export const PAGE_COPY = {
  home: {
    "zh-Hans": {
      title: "兰芯云朵 · LAN Cloud AI",
      description: IDENTITY["zh-Hans"].tagline,
      imageAlt: "兰芯云朵官网分享图",
    },
    "zh-Hant": {
      title: "蘭芯雲朵 · LAN Cloud AI",
      description: IDENTITY["zh-Hant"].tagline,
      imageAlt: "蘭芯雲朵官網分享圖",
    },
    en: {
      title: "LAN Cloud AI",
      description: IDENTITY.en.tagline,
      imageAlt: "LAN Cloud AI homepage share image",
    },
  },
  "internal-expense": {
    "zh-Hans": {
      title: "云朵记账 · 开源订阅与报销管理 · LAN Cloud AI",
      description:
        "云朵记账：面向中小企业的开源订阅资产与报销管理产品，让固定支出与报销批次都清楚可追溯。",
      imageAlt: "云朵记账分享图",
    },
    "zh-Hant": {
      title: "雲朵記賬 · 開源訂閱與報銷管理 · LAN Cloud AI",
      description:
        "雲朵記賬：面向中小企業的開源訂閱資產與報銷管理產品，讓固定支出與報銷批次都清楚可追溯。",
      imageAlt: "雲朵記賬分享圖",
    },
    en: {
      title: "Cloud Ledger · Open-source subscriptions and expenses · LAN Cloud AI",
      description:
        "Cloud Ledger is an open-source subscription and reimbursement tool for small teams, so recurring spend and expense batches stay traceable.",
      imageAlt: "Cloud Ledger share image",
    },
  },
  "ai-course": {
    "zh-Hans": {
      title: "从 AI 应用到一线 FDE · 企业 AI 转型人才培养 · 兰芯云朵",
      description:
        "兰芯云朵企业 AI 转型人才培养体系：84 课时通用 FDE 培养路径，以及三天企业 AI 工具 MVP 定制课。",
      imageAlt: "兰芯云朵 AI 课程分享图",
    },
    "zh-Hant": {
      title: "從 AI 應用到一線 FDE · 企業 AI 轉型人才培養 · 蘭芯雲朵",
      description:
        "蘭芯雲朵企業 AI 轉型人才培養體系：84 課時通用 FDE 培養路徑，以及三天企業 AI 工具 MVP 定製課。",
      imageAlt: "蘭芯雲朵 AI 課程分享圖",
    },
    en: {
      title: "From AI application to frontline FDE · LAN Cloud AI Academy",
      description:
        "LAN Cloud AI talent paths: an 84-hour general FDE curriculum, plus a three-day enterprise AI tool MVP workshop.",
      imageAlt: "LAN Cloud AI course share image",
    },
  },
  "ai-course-fde": {
    "zh-Hans": {
      title: "从 AI 应用到一线 FDE · 公开课表 · 兰芯云朵",
      description: "兰芯云朵 FDE 公开课表：84 课时、21 课、三阶段通用 FDE 培养路径。",
      imageAlt: "FDE 公开课表分享图",
    },
    "zh-Hant": {
      title: "從 AI 應用到一線 FDE · 公開課表 · 蘭芯雲朵",
      description: "蘭芯雲朵 FDE 公開課表：84 課時、21 課、三階段通用 FDE 培養路徑。",
      imageAlt: "FDE 公開課表分享圖",
    },
    en: {
      title: "From AI application to frontline FDE · Public schedule · LAN Cloud AI",
      description: "LAN Cloud AI FDE public schedule: 84 hours, 21 lessons, three stages to delivery.",
      imageAlt: "FDE schedule share image",
    },
  },
  "ai-course-mvp-3day": {
    "zh-Hans": {
      title: "从业务场景到 AI 工具 MVP · 企业定制三天课 · 兰芯云朵",
      description: "面向企业真实业务的三天 AI 应用实战课程：场景识别、工作流设计到 AI 工具 MVP 实现与验证。",
      imageAlt: "企业定制三天课分享图",
    },
    "zh-Hant": {
      title: "從業務場景到 AI 工具 MVP · 企業定製三天課 · 蘭芯雲朵",
      description: "面向企業真實業務的三天 AI 應用實戰課程：場景識別、工作流設計到 AI 工具 MVP 實現與驗證。",
      imageAlt: "企業定製三天課分享圖",
    },
    en: {
      title: "From a business scene to an AI tool MVP · 3-day workshop · LAN Cloud AI",
      description:
        "A three-day enterprise workshop: spot the scene, design the workflow, and ship a verifiable AI tool MVP.",
      imageAlt: "3-day workshop share image",
    },
  },
  wecom: {
    "zh-Hans": {
      title: "联系兰芯云朵销售经理 · LAN Cloud AI",
      description: "添加兰芯云朵销售经理企业微信，了解产品与合作。",
      imageAlt: "兰芯云朵销售经理企微分享图",
    },
    "zh-Hant": {
      title: "聯繫蘭芯雲朵銷售經理 · LAN Cloud AI",
      description: "新增蘭芯雲朵銷售經理企業微信，了解產品與合作。",
      imageAlt: "蘭芯雲朵銷售經理企微分享圖",
    },
    en: {
      title: "Contact LAN Cloud AI sales · LAN Cloud AI",
      description: "Add the LAN Cloud AI sales manager on WeCom to talk products and partnership.",
      imageAlt: "LAN Cloud AI sales WeCom share image",
    },
  },
  sitemap: {
    "zh-Hans": {
      title: "网站地图 · 兰芯云朵",
      description: "兰芯云朵官网公开页面索引：产品、AI 课程、联系与开源入口。",
      imageAlt: "兰芯云朵网站地图分享图",
    },
    "zh-Hant": {
      title: "網站地圖 · 蘭芯雲朵",
      description: "蘭芯雲朵官網公開頁面索引：產品、AI 課程、聯繫與開源入口。",
      imageAlt: "蘭芯雲朵網站地圖分享圖",
    },
    en: {
      title: "Sitemap · LAN Cloud AI",
      description: "Index of public LAN Cloud AI pages: products, AI courses, contact, and open source.",
      imageAlt: "LAN Cloud AI sitemap share image",
    },
  },
  "not-found": {
    "zh-Hans": {
      title: "页面不存在 · 兰芯云朵",
      description: "您打开的地址不存在。请返回兰芯云朵官网首页。",
      imageAlt: IDENTITY["zh-Hans"].imageAlt,
    },
    "zh-Hant": {
      title: "頁面不存在 · 蘭芯雲朵",
      description: "您開啟的地址不存在。請返回蘭芯雲朵官網首頁。",
      imageAlt: IDENTITY["zh-Hant"].imageAlt,
    },
    en: {
      title: "Page not found · LAN Cloud AI",
      description: "This address does not exist. Return to the LAN Cloud AI homepage.",
      imageAlt: IDENTITY.en.imageAlt,
    },
  },
};

export const isSiteLocale = (value) => SITE_LOCALES.includes(value);

export const localePrefix = (locale) => LOCALE_PREFIX[locale] ?? "";

export const localeFromPathname = (pathname = "/") => {
  const path = String(pathname || "/");
  if (path === "/zh-Hant" || path.startsWith("/zh-Hant/")) return "zh-Hant";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "zh-Hans";
};

export const stripLocalePrefix = (pathname = "/") => {
  let path = String(pathname || "/");
  if (path === "/zh-Hant" || path.startsWith("/zh-Hant/")) path = path.slice("/zh-Hant".length) || "/";
  else if (path === "/en" || path.startsWith("/en/")) path = path.slice("/en".length) || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path;
};

export const withLocalePrefix = (path, locale) => {
  const clean = stripLocalePrefix(path);
  const prefix = localePrefix(locale);
  if (!prefix) return clean;
  if (clean === "/") return `${prefix}/`;
  return `${prefix}${clean}`;
};

export const localeAwareUrl = (urlOrPath, locale) => {
  const raw = String(urlOrPath || "/");
  const hashIndex = raw.indexOf("#");
  const hash = hashIndex >= 0 ? raw.slice(hashIndex + 1) : "";
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const queryIndex = withoutHash.indexOf("?");
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  return `${withLocalePrefix(path || "/", locale)}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
};

export const absoluteLocaleUrl = (path, locale = DEFAULT_LOCALE) =>
  `${SITE_ORIGIN}${withLocalePrefix(path, locale)}`;

export const getIdentity = (locale = DEFAULT_LOCALE) =>
  IDENTITY[isSiteLocale(locale) ? locale : DEFAULT_LOCALE];

export const getPageCopy = (routeId, locale = DEFAULT_LOCALE) => {
  const copies = PAGE_COPY[routeId];
  if (!copies) throw new Error(`Unknown SEO copy route: ${routeId}`);
  return copies[isSiteLocale(locale) ? locale : DEFAULT_LOCALE];
};

export const hreflangLinks = (path) => {
  const clean = stripLocalePrefix(path);
  return [
    ...SITE_LOCALES.map((locale) => ({
      hreflang: HREFLANG[locale],
      href: absoluteLocaleUrl(clean, locale),
    })),
    { hreflang: "x-default", href: absoluteLocaleUrl(clean, DEFAULT_LOCALE) },
  ];
};
