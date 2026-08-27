export const SITE_ORIGIN = "https://lancloudtech.com";

export const OSS_SHARE_BASE =
  "https://img.lancloudtech.com/lanxin/webpage/images/generated/share";

/** @typedef {"home"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"} ShareRouteId */

/**
 * Canonical share cards for each HTML route.
 * Keep titles/descriptions short so WeChat shows one clean card without truncation spam.
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
        title: "兰芯云朵",
        desc: "汽车经营智能系统",
      },
      "zh-Hant": {
        title: "蘭芯雲朵",
        desc: "汽車經營智能系統",
      },
      en: {
        title: "LAN Cloud AI",
        desc: "Automotive ops intelligence",
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
        title: "云朵记账",
        desc: "开源订阅与报销",
      },
      "zh-Hant": {
        title: "雲朵記賬",
        desc: "開源訂閱與報銷",
      },
      en: {
        title: "Cloud Ledger",
        desc: "Subscriptions & expenses",
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
        title: "AI 课程",
        desc: "企业 AI 人才培养",
      },
      "zh-Hant": {
        title: "AI 課程",
        desc: "企業 AI 人才培養",
      },
      en: {
        title: "AI Course",
        desc: "Enterprise AI talent paths",
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
        title: "FDE 公开课表",
        desc: "21 课能力进阶",
      },
      "zh-Hant": {
        title: "FDE 公開課表",
        desc: "21 課能力進階",
      },
      en: {
        title: "FDE Schedule",
        desc: "21 lessons to delivery",
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
    image: `${OSS_SHARE_BASE}/og-wecom-v2.png`,
    imageWidth: 1000,
    imageHeight: 1000,
    locales: {
      "zh-Hans": {
        title: "联系兰芯云朵",
        desc: "添加销售经理企微",
      },
      "zh-Hant": {
        title: "聯繫蘭芯雲朵",
        desc: "新增銷售經理企微",
      },
      en: {
        title: "Contact Us",
        desc: "Add sales on WeCom",
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
