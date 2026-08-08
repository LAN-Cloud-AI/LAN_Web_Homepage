export const SITE_ORIGIN = "https://lancloudtech.com";

export const OSS_SHARE_BASE =
  "https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images/generated/share";

/** @typedef {"home"|"leadshunter"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"} ShareRouteId */

/**
 * Canonical share cards for each HTML route.
 * Static Chinese copy in HTML meta is the crawler source of truth;
 * locale variants here feed WeChat JS-SDK after language switches.
 */
export const SHARE_BY_ROUTE = {
  home: {
    path: "/",
    image: `${OSS_SHARE_BASE}/og-home-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "兰芯云朵 · LAN Cloud AI",
        desc: "看见 → 理解 → 调度 → 判断。先在真实门店验证，再契约先行地 SaaS 化。",
      },
      "zh-Hant": {
        title: "蘭芯雲朵 · LAN Cloud AI",
        desc: "看見 → 理解 → 調度 → 判斷。先在真實門店驗證，再契約先行地 SaaS 化。",
      },
      en: {
        title: "LAN Cloud AI",
        desc: "See → Understand → Orchestrate → Decide. Prove in real stores, then SaaS with contracts first.",
      },
    },
  },
  leadshunter: {
    path: "/leadshunter/",
    image: `${OSS_SHARE_BASE}/og-leadshunter-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "LeadsHunter 线索猎手 · LAN Cloud AI",
        desc: "用 AI 识别公开内容中的真实购车意向，把高价值线索直接交给销售。",
      },
      "zh-Hant": {
        title: "LeadsHunter 線索獵手 · LAN Cloud AI",
        desc: "用 AI 識別公開內容中的真實購車意向，把高價值線索直接交給銷售。",
      },
      en: {
        title: "LeadsHunter · LAN Cloud AI",
        desc: "Use AI to spot real purchase intent in public content and deliver high-value leads to sales.",
      },
    },
  },
  "internal-expense": {
    path: "/internal-expense/",
    image: `${OSS_SHARE_BASE}/og-internal-expense-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "云朵记账 · 开源订阅与报销管理 · LAN Cloud AI",
        desc: "面向中小企业的开源订阅资产与报销管理产品，让固定支出与报销批次都清楚可追溯。",
      },
      "zh-Hant": {
        title: "雲朵記賬 · 開源訂閱與報銷管理 · LAN Cloud AI",
        desc: "面向中小企業的開源訂閱資產與報銷管理產品，讓固定支出與報銷批次都清楚可追溯。",
      },
      en: {
        title: "Cloud Ledger · LAN Cloud AI",
        desc: "Open-source subscription assets and reimbursement for SMBs — clear, traceable recurring spend.",
      },
    },
  },
  "ai-course": {
    path: "/ai-course/",
    image: `${OSS_SHARE_BASE}/og-ai-course-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "从 AI 应用到一线 FDE · 企业 AI 转型人才培养 · 兰芯云朵",
        desc: "兰芯云朵企业 AI 转型人才培养体系：84 课时通用 FDE 培养路径，以及三天企业 AI 工具 MVP 定制课。",
      },
      "zh-Hant": {
        title: "從 AI 應用到一線 FDE · 企業 AI 轉型人才培養 · 蘭芯雲朵",
        desc: "蘭芯雲朵企業 AI 轉型人才培養體系：84 課時通用 FDE 培養路徑，以及三天企業 AI 工具 MVP 定制課。",
      },
      en: {
        title: "From AI apps to frontline FDE · LAN Cloud AI",
        desc: "Enterprise AI talent paths: an 84-hour FDE curriculum and a three-day custom MVP workshop.",
      },
    },
  },
  "ai-course-fde": {
    path: "/ai-course/fde/",
    image: `${OSS_SHARE_BASE}/og-ai-course-fde-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "FDE 公开课表 · 21 课能力进阶 · 兰芯云朵",
        desc: "公开课表版 FDE 培养路径：初阶、中阶、高阶共 21 课，建立从 AI 应用到生产交付的完整能力。",
      },
      "zh-Hant": {
        title: "FDE 公開課表 · 21 課能力進階 · 蘭芯雲朵",
        desc: "公開課表版 FDE 培養路徑：初階、中階、高階共 21 課，建立從 AI 應用到生產交付的完整能力。",
      },
      en: {
        title: "FDE public syllabus · 21 lessons · LAN Cloud AI",
        desc: "Public FDE path across foundation, builder, and delivery stages — 21 lessons from AI use to production.",
      },
    },
  },
  "ai-course-mvp-3day": {
    path: "/ai-course/mvp-3day/",
    image: `${OSS_SHARE_BASE}/og-ai-course-mvp-3day-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "企业定制三天课 · 业务到 MVP · 兰芯云朵",
        desc: "三天企业定制工作坊：从真实业务问题出发，做出可运行的 AI 工具 MVP。",
      },
      "zh-Hant": {
        title: "企業定制三天課 · 業務到 MVP · 蘭芯雲朵",
        desc: "三天企業定制工作坊：從真實業務問題出發，做出可運行的 AI 工具 MVP。",
      },
      en: {
        title: "3-day custom workshop · business to MVP · LAN Cloud AI",
        desc: "A three-day enterprise workshop that turns a real business problem into a runnable AI tool MVP.",
      },
    },
  },
  wecom: {
    path: "/contact/wecom/",
    image: `${OSS_SHARE_BASE}/og-wecom-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "联系兰芯云朵销售经理 · LAN Cloud AI",
        desc: "添加兰芯云朵销售经理企业微信，了解产品与合作。",
      },
      "zh-Hant": {
        title: "聯繫蘭芯雲朵銷售經理 · LAN Cloud AI",
        desc: "新增蘭芯雲朵銷售經理企業微信，了解產品與合作。",
      },
      en: {
        title: "Contact LAN Cloud AI sales · WeCom",
        desc: "Add our sales manager on WeCom to talk products and partnership.",
      },
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
    link: `${SITE_ORIGIN}${route.path}`,
    imgUrl: route.image,
    imageWidth: route.imageWidth,
    imageHeight: route.imageHeight,
  };
};

export const SHARE_ROUTE_IDS = Object.keys(SHARE_BY_ROUTE);
