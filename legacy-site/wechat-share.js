import { getSharePayload } from "./share-meta.js";

const JWEIXIN_SRC = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
// Grey-cloud DNS sends site traffic to origin Nginx; JS-SDK signing stays on Workers.
const SIGN_ENDPOINT = "https://lan-wechat-jssdk.mingxuan400.workers.dev/api/wechat/jssdk";

let activeRouteId = null;
let localeGetter = () => "zh-Hans";
let wxReady = null;

const isWeChatBrowser = () =>
  typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);

const pageUrlForSign = () => {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`;
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });

const fetchSignature = async (url) => {
  const endpoint = `${SIGN_ENDPOINT}?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`jssdk sign HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.appId || !data?.signature) throw new Error("jssdk sign payload incomplete");
  return data;
};

const applyShareFields = (routeId, locale) => {
  if (typeof wx === "undefined") return;
  const payload = getSharePayload(routeId, locale);
  const friend = {
    title: payload.title,
    desc: payload.desc,
    link: payload.link,
    imgUrl: payload.imgUrl,
  };
  const timeline = {
    title: payload.title,
    link: payload.link,
    imgUrl: payload.imgUrl,
  };

  if (typeof wx.updateAppMessageShareData === "function") {
    wx.updateAppMessageShareData({ ...friend, success() {}, fail() {} });
  }
  if (typeof wx.updateTimelineShareData === "function") {
    wx.updateTimelineShareData({ ...timeline, success() {}, fail() {} });
  }
  // Legacy fallbacks for older WeChat clients
  if (typeof wx.onMenuShareAppMessage === "function") {
    wx.onMenuShareAppMessage(friend);
  }
  if (typeof wx.onMenuShareTimeline === "function") {
    wx.onMenuShareTimeline(timeline);
  }
};

const ensureWxConfigured = async () => {
  if (wxReady) return wxReady;
  wxReady = (async () => {
    await loadScript(JWEIXIN_SRC);
    const sign = await fetchSignature(pageUrlForSign());
    await new Promise((resolve, reject) => {
      wx.config({
        debug: false,
        appId: sign.appId,
        timestamp: sign.timestamp,
        nonceStr: sign.nonceStr,
        signature: sign.signature,
        jsApiList: [
          "updateAppMessageShareData",
          "updateTimelineShareData",
          "onMenuShareAppMessage",
          "onMenuShareTimeline",
        ],
        openTagList: [],
      });
      wx.ready(() => resolve());
      wx.error((err) => reject(err || new Error("wx.config failed")));
    });
  })().catch((err) => {
    wxReady = null;
    throw err;
  });
  return wxReady;
};

/**
 * @param {import("./share-meta.js").ShareRouteId} routeId
 * @param {{ getLocale?: () => string }} [options]
 */
export const initWechatShare = async (routeId, options = {}) => {
  activeRouteId = routeId;
  if (typeof options.getLocale === "function") localeGetter = options.getLocale;
  if (!isWeChatBrowser()) return false;
  try {
    await ensureWxConfigured();
    applyShareFields(routeId, localeGetter());
    return true;
  } catch {
    // Silent degrade: link-preview cards still use static OG meta.
    return false;
  }
};

/**
 * Refresh share copy after locale changes (WeChat in-app only).
 * @param {string} [locale]
 */
export const refreshWechatShare = async (locale) => {
  if (!activeRouteId || !isWeChatBrowser()) return false;
  try {
    await ensureWxConfigured();
    applyShareFields(activeRouteId, locale || localeGetter());
    return true;
  } catch {
    return false;
  }
};
