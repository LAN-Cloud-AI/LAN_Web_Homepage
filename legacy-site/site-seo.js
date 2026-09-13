import { SHARE_BY_ROUTE } from "./share-meta.js";
import {
  DEFAULT_LOCALE,
  JSON_LD_LANG,
  SITE_LOCALES,
  SITE_ORIGIN,
  absoluteLocaleUrl,
  getIdentity,
  getPageCopy,
  hreflangLinks,
} from "./site-identity.js";

export { SITE_ORIGIN };
export { SITE_NAME } from "./site-identity.js";
export {
  DEFAULT_LOCALE,
  SITE_LOCALES,
  absoluteLocaleUrl,
  getIdentity,
  getPageCopy,
  hreflangLinks,
} from "./site-identity.js";

/** 线索猎手独立官网；公司站 /leadshunter/ 仅作跳转，不再作为产品页。 */
export const LEADSHUNTER_SITE = "https://leadshunter.lancloudtech.com/";

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "四川兰芯云朵智能科技有限公司",
  alternateName: ["兰芯云朵", "LAN Cloud AI"],
  url: `${SITE_ORIGIN}/`,
  logo: {
    "@type": "ImageObject",
    url: "https://img.lancloudtech.com/lanxin/webpage/images/logo/WEB-logo.svg",
  },
  email: "lance@lancloudtech.com",
  telephone: "+86-17380566771",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "中国（四川）自由贸易试验区成都高新区新程南一路19号3栋15层1501-1504号",
    addressLocality: "成都",
    addressRegion: "四川",
    addressCountry: "CN",
  },
  sameAs: ["https://github.com/LAN-Cloud-AI", LEADSHUNTER_SITE],
};

/** @typedef {"home"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"|"sitemap"} SeoRouteId */

/**
 * Public indexable routes. Paths must stay in sync with SHARE_BY_ROUTE (+ sitemap HTML).
 * @type {Array<{
 *   id: SeoRouteId,
 *   path: string,
 *   html: string,
 *   priority: string,
 *   changefreq: "always"|"hourly"|"daily"|"weekly"|"monthly"|"yearly"|"never",
 *   inShareMeta: boolean,
 * }>}
 */
export const PUBLIC_ROUTES = [
  {
    id: "home",
    path: "/",
    html: "index.html",
    priority: "1.0",
    changefreq: "weekly",
    inShareMeta: true,
  },
  {
    id: "internal-expense",
    path: "/internal-expense/",
    html: "internal-expense/index.html",
    priority: "0.9",
    changefreq: "weekly",
    inShareMeta: true,
  },
  {
    id: "ai-course",
    path: "/ai-course/",
    html: "ai-course/index.html",
    priority: "0.9",
    changefreq: "weekly",
    inShareMeta: true,
  },
  {
    id: "ai-course-fde",
    path: "/ai-course/fde/",
    html: "ai-course/fde/index.html",
    priority: "0.8",
    changefreq: "weekly",
    inShareMeta: true,
  },
  {
    id: "ai-course-mvp-3day",
    path: "/ai-course/mvp-3day/",
    html: "ai-course/mvp-3day/index.html",
    priority: "0.8",
    changefreq: "weekly",
    inShareMeta: true,
  },
  {
    id: "wecom",
    path: "/contact/wecom/",
    html: "contact/wecom/index.html",
    priority: "0.7",
    changefreq: "monthly",
    inShareMeta: true,
  },
  {
    id: "sitemap",
    path: "/sitemap/",
    html: "sitemap/index.html",
    priority: "0.3",
    changefreq: "monthly",
    inShareMeta: false,
  },
];

export const absoluteUrl = (path, locale = DEFAULT_LOCALE) => absoluteLocaleUrl(path, locale);

const productMentions = (locale) => {
  const names = {
    "zh-Hans": {
      lh: "线索猎手",
      vect: "VECT",
      tact: "TACT",
      ledger: "云朵记账",
    },
    "zh-Hant": {
      lh: "線索獵手",
      vect: "VECT",
      tact: "TACT",
      ledger: "雲朵記賬",
    },
    en: {
      lh: "LeadsHunter",
      vect: "VECT",
      tact: "TACT",
      ledger: "Cloud Ledger",
    },
  }[locale];
  return [
    {
      "@type": "SoftwareApplication",
      name: names.lh,
      alternateName: "LeadsHunter",
      url: LEADSHUNTER_SITE,
      author: { "@id": ORGANIZATION["@id"] },
    },
    {
      "@type": "SoftwareApplication",
      name: names.vect,
      url: `${SITE_ORIGIN}/#vect`,
      author: { "@id": ORGANIZATION["@id"] },
    },
    {
      "@type": "SoftwareApplication",
      name: names.tact,
      url: `${SITE_ORIGIN}/#tact`,
      author: { "@id": ORGANIZATION["@id"] },
    },
    {
      "@type": "SoftwareApplication",
      name: names.ledger,
      alternateName: "Cloud Ledger",
      url: absoluteLocaleUrl("/internal-expense/", locale),
      author: { "@id": ORGANIZATION["@id"] },
    },
  ];
};

const courseExtra = (routeId, locale) => {
  const copy = getPageCopy(routeId, locale);
  const names = {
    "ai-course": {
      "zh-Hans": "企业 AI 转型人才培养",
      "zh-Hant": "企業 AI 轉型人才培養",
      en: "Enterprise AI talent paths",
    },
    "ai-course-fde": {
      "zh-Hans": "FDE 公开课表",
      "zh-Hant": "FDE 公開課表",
      en: "FDE public schedule",
    },
    "ai-course-mvp-3day": {
      "zh-Hans": "企业定制三天课",
      "zh-Hant": "企業定製三天課",
      en: "3-day enterprise workshop",
    },
  };
  if (!names[routeId]) return null;
  const course = {
    "@type": "Course",
    name: names[routeId][locale],
    description: copy.description,
    provider: { "@id": ORGANIZATION["@id"] },
    inLanguage: JSON_LD_LANG[locale],
    isAccessibleForFree: true,
  };
  if (routeId === "ai-course-fde") {
    course.timeRequired = "PT84H";
  }
  if (routeId === "ai-course") {
    course.timeRequired = "PT84H";
  }
  if (routeId === "ai-course-mvp-3day") {
    course.timeRequired = "P3D";
  }
  return course;
};

const breadcrumb = (routeId, locale, url) => {
  if (routeId === "home") return null;
  const homeName = getIdentity(locale).brand;
  const page = getPageCopy(routeId, locale);
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: absoluteLocaleUrl("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: url,
      },
    ],
  };
};

/**
 * @param {SeoRouteId} routeId
 * @param {{ title?: string, description?: string, type?: string }} [page]
 * @param {import("./site-identity.js").SiteLocale} [locale]
 */
export const buildWebPageJsonLd = (routeId, page = {}, locale = DEFAULT_LOCALE) => {
  const route = PUBLIC_ROUTES.find((item) => item.id === routeId);
  if (!route) throw new Error(`Unknown SEO route: ${routeId}`);
  const copy = getPageCopy(routeId, locale);
  const identity = getIdentity(locale);
  const share = route.inShareMeta ? SHARE_BY_ROUTE[routeId] : null;
  const url = absoluteLocaleUrl(route.path, locale);
  const image = share?.image;
  const title = page.title || copy.title;
  const description = page.description || copy.description;
  const inLanguage = JSON_LD_LANG[locale];

  const graph = [
    ORGANIZATION,
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: identity.siteName,
      alternateName: ["兰芯云朵", "蘭芯雲朵", "LAN Cloud AI"],
      description: identity.tagline,
      publisher: { "@id": ORGANIZATION["@id"] },
      inLanguage: SITE_LOCALES.map((item) => JSON_LD_LANG[item]),
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@id": ORGANIZATION["@id"] },
      inLanguage,
      ...(image
        ? {
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: image,
              width: share.imageWidth,
              height: share.imageHeight,
            },
          }
        : {}),
      ...(page.type ? { additionalType: page.type } : {}),
      ...(routeId === "home" ? { mentions: productMentions(locale) } : {}),
    },
  ];

  const crumbs = breadcrumb(routeId, locale, url);
  if (crumbs) graph.push(crumbs);
  const course = courseExtra(routeId, locale);
  if (course) graph.push(course);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
