import { getSharePayload } from "./share-meta.js";

const JWEIXIN_SRC = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
// Grey-cloud site DNS stays on Nginx. Signing uses the Worker's dedicated
// custom domain because workers.dev is not reliably reachable in mainland China.
const SIGN_ENDPOINT = "https://wechat.lancloudtech.com/api/wechat/jssdk";
const SDK_TIMEOUT_MS = 10000;
const SIGN_TIMEOUT_MS = 8000;

let activeRouteId = null;
let localeGetter = () => "zh-Hans";
let wxReady = null;
let sdkReady = null;
let shareRevision = 0;

const isWeChatBrowser = () =>
  typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);

// Sign the actual document (including WeChat-added query parameters), never its
// canonical/share URL. Hash navigation does not change the JS-SDK signature.
const pageUrlForSign = () => window.location.href.split("#")[0];

const loadScript = (src) => {
  if (typeof window.wx?.config === "function") return Promise.resolve();
  if (sdkReady) return sdkReady;
  sdkReady = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    const el = existing || document.createElement("script");
    const finish = (error) => {
      clearTimeout(timer);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      if (error) {
        // A failed script must not make later retries look already loaded.
        el.remove();
        reject(error);
      } else resolve();
    };
    const onLoad = () => finish(typeof window.wx?.config === "function"
      ? null : new Error("WeChat SDK unavailable after load"));
    const onError = () => finish(new Error("WeChat SDK load failed"));
    const timer = setTimeout(() => finish(new Error("WeChat SDK load timed out")), SDK_TIMEOUT_MS);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    if (!existing) {
      el.src = src;
      el.async = true;
      document.head.appendChild(el);
    }
  }).catch((error) => {
    sdkReady = null;
    throw error;
  });
  return sdkReady;
};

const fetchSignature = async (url) => {
  const endpoint = `${SIGN_ENDPOINT}?url=${encodeURIComponent(url)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SIGN_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`jssdk sign HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.appId || !data?.signature || !data?.nonceStr || !(Number(data?.timestamp) > 0)) {
      throw new Error("jssdk sign payload incomplete");
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
};

const registerShare = (wx, modern, legacy, fields) => {
  if (typeof wx[modern] !== "function") {
    if (typeof wx[legacy] !== "function") return Promise.reject(new Error("WeChat share API unavailable"));
    // Legacy callbacks report a user's later share action, not registration.
    wx[legacy](fields);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error("WeChat share setup timed out")), SDK_TIMEOUT_MS);
    const finish = (error) => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    try {
      wx[modern]({
        ...fields,
        success: () => finish(),
        fail: (error) => {
          // A newer jweixin.js also exposes modern methods on older clients.
          // Only an unsupported API may fall back; domain/permission failures
          // must remain failures rather than pretending the card was accepted.
          if (/not exist|not support|unsupported/i.test(error?.errMsg || "") && typeof wx[legacy] === "function") {
            try { wx[legacy](fields); finish(); } catch (failure) { finish(failure); }
          } else finish(new Error("WeChat share setup failed"));
        },
      });
    } catch (error) {
      finish(error);
    }
  });
};

const applyShareFields = async (routeId, locale) => {
  const wx = window.wx;
  if (!wx) throw new Error("WeChat SDK unavailable");
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

  await Promise.all([
    registerShare(wx, "updateAppMessageShareData", "onMenuShareAppMessage", friend),
    registerShare(wx, "updateTimelineShareData", "onMenuShareTimeline", timeline),
  ]);
};

const ensureWxConfigured = async () => {
  if (wxReady) return wxReady;
  wxReady = (async () => {
    await loadScript(JWEIXIN_SRC);
    const sign = await fetchSignature(pageUrlForSign());
    const wx = window.wx;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error("WeChat config timed out")), SDK_TIMEOUT_MS);
      const finish = (error) => {
        clearTimeout(timer);
        if (error) reject(error);
        else resolve();
      };
      wx.error((err) => finish(err || new Error("wx.config failed")));
      try {
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
        wx.ready(() => finish());
      } catch (error) {
        finish(error);
      }
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
  const revision = ++shareRevision;
  if (typeof options.getLocale === "function") localeGetter = options.getLocale;
  if (!isWeChatBrowser()) return false;
  try {
    await ensureWxConfigured();
    if (revision !== shareRevision) return false;
    await applyShareFields(routeId, localeGetter());
    return true;
  } catch {
    // Static OG metadata remains available to crawlers when JS-SDK setup fails.
    // This does not imply WeChat accepted custom share fields.
    return false;
  }
};

/**
 * Refresh share copy after locale changes (WeChat in-app only).
 * @param {string} [locale]
 */
export const refreshWechatShare = async (locale) => {
  if (!activeRouteId || !isWeChatBrowser()) return false;
  const revision = ++shareRevision;
  try {
    await ensureWxConfigured();
    if (revision !== shareRevision) return false;
    await applyShareFields(activeRouteId, locale || localeGetter());
    return true;
  } catch {
    return false;
  }
};
