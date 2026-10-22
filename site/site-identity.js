export const SITE_ORIGIN = "https://lancloudtech.com";
// The same source runs at the preview mount after packaging. Determine the
// mount from this module, so language switches and WeChat shares stay in it.
export const SITE_BASE_PATH = new URL(import.meta.url).pathname.startsWith("/preview/") ? "/preview" : "";

const splitVersionPath = (pathname) => {
  const path = String(pathname || "/");
  const preview = path === "/preview" || path.startsWith("/preview/");
  return { base: preview ? "/preview" : "", path: preview ? path.slice(8) || "/" : path };
};

/** @typedef {"zh-Hans"|"zh-Hant"|"en"} SiteLocale */
/** @typedef {"home"|"solutions"|"practice"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"|"sitemap"|"not-found"} SeoCopyId */

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
    tagline: "兰芯云朵提供汽车行业 AI 产品、售后数字化方案与企业 AI 实战培训，连接公域获客、客户关系和车间协同，让 AI 进入真实业务。",
    company: "四川兰芯云朵智能科技有限公司",
    imageAlt: "兰芯云朵标志",
  },
  "zh-Hant": {
    siteName: "蘭芯雲朵 · LAN Cloud AI",
    brand: "蘭芯雲朵",
    tagline: "蘭芯雲朵提供汽車行業 AI 產品、售後數位化方案與企業 AI 實戰培訓，連接公域獲客、客戶關係和車間協同，讓 AI 進入真實業務。",
    company: "四川蘭芯雲朵智能科技有限公司",
    imageAlt: "蘭芯雲朵標誌",
  },
  en: {
    siteName: "LAN Cloud AI",
    brand: "LAN Cloud AI",
    tagline:
      "LAN Cloud AI provides automotive AI products, aftersales workflow solutions, and hands-on enterprise AI training across customer acquisition, relationships, and workshop coordination.",
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
      title: "兰芯云朵 · 汽车行业 AI 产品与企业实战培训",
      description: IDENTITY["zh-Hans"].tagline,
      imageAlt: "兰芯云朵官网分享图",
    },
    "zh-Hant": {
      title: "蘭芯雲朵 · 汽車行業 AI 產品與企業實戰培訓",
      description: IDENTITY["zh-Hant"].tagline,
      imageAlt: "蘭芯雲朵官網分享圖",
    },
    en: {
      title: "Automotive AI Products & Enterprise Training · LAN Cloud AI",
      description: IDENTITY.en.tagline,
      imageAlt: "LAN Cloud AI homepage share image",
    },
  },
  solutions: {
    "zh-Hans": {
      title: "汽车零售与售后 AI 方案 · 兰芯云朵",
      description: "从 LeadsHunter 公域获客到 VECT 客户关系、TACT 车间协同，了解兰芯云朵的汽车业务方案。VECT、TACT 已有飞书方案验证，自有 SaaS 正在筹备与建设。",
      imageAlt: "兰芯云朵汽车业务方案分享图",
    },
    "zh-Hant": {
      title: "汽車零售與售後 AI 方案 · 蘭芯雲朵",
      description: "從 LeadsHunter 公域獲客到 VECT 客戶關係、TACT 車間協同，了解蘭芯雲朵的汽車業務方案。VECT、TACT 已有飛書方案驗證，自有 SaaS 正在籌備與建設。",
      imageAlt: "蘭芯雲朵汽車業務方案分享圖",
    },
    en: {
      title: "Automotive Retail & Aftersales AI Solutions · LAN Cloud AI",
      description: "Explore LeadsHunter for public-channel acquisition, VECT for customer relationships, and TACT for workshop coordination. VECT and TACT have Feishu-based validation; standalone SaaS versions are in preparation.",
      imageAlt: "LAN Cloud AI automotive solutions share image",
    },
  },
  practice: {
    "zh-Hans": {
      title: "业务实践与交付方法 · 兰芯云朵",
      description: "了解兰芯云朵如何把业务规则、数据和 AI 转为可执行的产品与流程，查看汽车业务、经营工具和企业实战培训的交付实践与适用边界。",
      imageAlt: "兰芯云朵业务实践分享图",
    },
    "zh-Hant": {
      title: "業務實踐與交付方法 · 蘭芯雲朵",
      description: "了解蘭芯雲朵如何把業務規則、資料和 AI 轉為可執行的產品與流程，查看汽車業務、經營工具和企業實戰培訓的交付實踐與適用邊界。",
      imageAlt: "蘭芯雲朵業務實踐分享圖",
    },
    en: {
      title: "Business Practice & Delivery Approach · LAN Cloud AI",
      description: "See how LAN Cloud AI turns business rules, data, and AI into usable products and workflows, with delivery examples from automotive operations, business tools, and enterprise training.",
      imageAlt: "LAN Cloud AI business practice share image",
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
      title: "企业 AI 实战培训 · 实战课、MVP 定制与 FDE 培养 · 兰芯云朵",
      description:
        "兰芯云朵企业 AI 实战培训有三条路径：AI 实战课、企业 MVP 三天定制课，以及 21 课、84 课时的 FDE 培养。课表可免费浏览，培训方案与费用另行沟通。",
      imageAlt: "兰芯云朵 AI 课程分享图",
    },
    "zh-Hant": {
      title: "企業 AI 實戰培訓 · 實戰課、MVP 定製與 FDE 培養 · 蘭芯雲朵",
      description:
        "蘭芯雲朵企業 AI 實戰培訓有三條路徑：AI 實戰課、企業 MVP 三天定製課，以及 21 課、84 課時的 FDE 培養。課表可免費瀏覽，培訓方案與費用另行溝通。",
      imageAlt: "蘭芯雲朵 AI 課程分享圖",
    },
    en: {
      title: "Hands-on Enterprise AI Training · LAN Cloud AI Academy",
      description:
        "Three enterprise AI training paths: practical AI classes, a three-day MVP workshop, and 21-lesson, 84-hour FDE training. Schedules are free to view; training scope and fees are agreed separately.",
      imageAlt: "LAN Cloud AI course share image",
    },
  },
  "ai-course-fde": {
    "zh-Hans": {
      title: "从 AI 应用到一线 FDE · 公开课表 · 兰芯云朵",
      description: "免费浏览兰芯云朵 FDE 公开课表：84 课时、21 课、三阶段培养路径。公开课表不等于免费培训，企业培训方案与费用另行沟通。",
      imageAlt: "FDE 公开课表分享图",
    },
    "zh-Hant": {
      title: "從 AI 應用到一線 FDE · 公開課表 · 蘭芯雲朵",
      description: "免費瀏覽蘭芯雲朵 FDE 公開課表：84 課時、21 課、三階段培養路徑。公開課表不等於免費培訓，企業培訓方案與費用另行溝通。",
      imageAlt: "FDE 公開課表分享圖",
    },
    en: {
      title: "From AI application to frontline FDE · Public schedule · LAN Cloud AI",
      description: "View the FDE schedule for free: 84 hours, 21 lessons, and three stages. Enterprise training is a separate paid service with scope and fees agreed individually.",
      imageAlt: "FDE schedule share image",
    },
  },
  "ai-course-mvp-3day": {
    "zh-Hans": {
      title: "从业务场景到 AI 工具 MVP · 企业定制三天课 · 兰芯云朵",
      description: "面向企业真实业务的三天 AI 应用定制培训：从场景识别、工作流设计到 MVP 实现与验证。可免费查看课程安排，培训范围与费用另行沟通。",
      imageAlt: "企业定制三天课分享图",
    },
    "zh-Hant": {
      title: "從業務場景到 AI 工具 MVP · 企業定製三天課 · 蘭芯雲朵",
      description: "面向企業真實業務的三天 AI 應用定製培訓：從場景識別、工作流設計到 MVP 實現與驗證。可免費查看課程安排，培訓範圍與費用另行溝通。",
      imageAlt: "企業定製三天課分享圖",
    },
    en: {
      title: "From a business scene to an AI tool MVP · 3-day workshop · LAN Cloud AI",
      description:
        "A three-day enterprise workshop covering use-case selection, workflow design, and MVP implementation. View the schedule for free; training scope and fees are agreed separately.",
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
      description: "兰芯云朵官网公开页面索引：汽车业务方案、交付实践、AI 实战培训、产品与联系入口。",
      imageAlt: "兰芯云朵网站地图分享图",
    },
    "zh-Hant": {
      title: "網站地圖 · 蘭芯雲朵",
      description: "蘭芯雲朵官網公開頁面索引：汽車業務方案、交付實踐、AI 實戰培訓、產品與聯繫入口。",
      imageAlt: "蘭芯雲朵網站地圖分享圖",
    },
    en: {
      title: "Sitemap · LAN Cloud AI",
      description: "Public LAN Cloud AI pages: automotive solutions, delivery practice, hands-on AI training, products, and contact.",
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
  const { path } = splitVersionPath(pathname);
  if (path === "/zh-Hant" || path.startsWith("/zh-Hant/")) return "zh-Hant";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "zh-Hans";
};

export const stripLocalePrefix = (pathname = "/") => {
  let { base, path } = splitVersionPath(pathname);
  if (path === "/zh-Hant" || path.startsWith("/zh-Hant/")) path = path.slice("/zh-Hant".length) || "/";
  else if (path === "/en" || path.startsWith("/en/")) path = path.slice("/en".length) || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return `${base}${path}`;
};

export const withLocalePrefix = (path, locale) => {
  const { base, path: clean } = splitVersionPath(stripLocalePrefix(path));
  const mount = base || SITE_BASE_PATH;
  const prefix = localePrefix(locale);
  if (!prefix) return `${mount}${clean}`;
  if (clean === "/") return `${mount}${prefix}/`;
  return `${mount}${prefix}${clean}`;
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
