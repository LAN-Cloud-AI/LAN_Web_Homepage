import { SHARE_BY_ROUTE, SITE_ORIGIN } from "./share-meta.js";

export { SITE_ORIGIN };

export const SITE_NAME = "兰芯云朵 · LAN Cloud AI";

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "四川兰芯云朵智能科技有限公司",
  alternateName: ["兰芯云朵", "LAN Cloud AI"],
  url: `${SITE_ORIGIN}/`,
  logo: {
    "@type": "ImageObject",
    url: "https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images/logo/WEB-logo.svg",
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
  sameAs: ["https://github.com/LAN-Cloud-AI"],
};

/** @typedef {"home"|"leadshunter"|"internal-expense"|"ai-course"|"ai-course-fde"|"ai-course-mvp-3day"|"wecom"|"sitemap"} SeoRouteId */

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
    id: "leadshunter",
    path: "/leadshunter/",
    html: "leadshunter/index.html",
    priority: "0.9",
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

export const absoluteUrl = (path) => `${SITE_ORIGIN}${path}`;

/**
 * @param {SeoRouteId} routeId
 * @param {{ title: string, description: string, type?: string }} page
 */
export const buildWebPageJsonLd = (routeId, page) => {
  const route = PUBLIC_ROUTES.find((r) => r.id === routeId);
  if (!route) throw new Error(`Unknown SEO route: ${routeId}`);
  const share = route.inShareMeta ? SHARE_BY_ROUTE[routeId] : null;
  const url = absoluteUrl(route.path);
  const image = share?.image;

  const graph = [
    ORGANIZATION,
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      publisher: { "@id": ORGANIZATION["@id"] },
      inLanguage: ["zh-CN", "zh-TW", "en"],
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@id": ORGANIZATION["@id"] },
      inLanguage: "zh-CN",
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
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
