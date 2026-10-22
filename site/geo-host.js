/**
 * Steer visitors between CN origin and Cloudflare Pages global host.
 * mainland (CN only) → lancloudtech.com
 * overseas (incl. HK / MO / TW) → global.lancloudtech.com
 */

const CN_HOST = "lancloudtech.com";
const WWW_HOST = "www.lancloudtech.com";
const GLOBAL_HOST = "global.lancloudtech.com";
const GEO_ENDPOINT = "https://lan-geo.mingxuan400.workers.dev/";
const COOKIE_NAME = "lan_geo_host";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

const BOT_RE =
  /(?:bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|linkedinbot|pinterest|redditbot|applebot|duckduckbot|yandex|baiduspider|sogou|bytespider|semrush|ahrefs|petalbot|gptbot|claudebot|google-extended)/i;
const WECHAT_RE = /(?:MicroMessenger|wxwork)/i;

const readCookie = (name) => {
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return decodeURIComponent(part.slice(name.length + 1));
  }
  return "";
};

const writeCookie = (name, value) => {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
};

const isLocalDev = () => {
  const host = location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
};

const isCnHost = (host) => host === CN_HOST || host === WWW_HOST;
const isGlobalHost = (host) => host === GLOBAL_HOST;

const targetHostForPref = (pref) => (pref === "global" ? GLOBAL_HOST : CN_HOST);

const shouldSkip = () => {
  if (isLocalDev()) return true;
  const ua = navigator.userAgent || "";
  if (WECHAT_RE.test(ua) || BOT_RE.test(ua)) return true;
  const host = location.hostname;
  return !isCnHost(host) && !isGlobalHost(host);
};

const stripHostParam = (url) => {
  url.searchParams.delete("host");
  return url;
};

const redirectToHost = (host) => {
  const url = new URL(location.href);
  url.hostname = host;
  url.protocol = "https:";
  stripHostParam(url);
  if (url.href === location.href) return;
  location.replace(url.href);
};

const applyPreference = (pref) => {
  if (pref !== "cn" && pref !== "global") return false;
  writeCookie(COOKIE_NAME, pref);
  const desired = targetHostForPref(pref);
  if (location.hostname !== desired && (isCnHost(location.hostname) || isGlobalHost(location.hostname))) {
    redirectToHost(desired);
    return true;
  }
  return false;
};

const steerByRegion = (region) => {
  const pref = region === "mainland" ? "cn" : "global";
  writeCookie(COOKIE_NAME, pref);
  const desired = targetHostForPref(pref);
  if (location.hostname === desired) return;
  if (isCnHost(location.hostname) || isGlobalHost(location.hostname)) {
    redirectToHost(desired);
  }
};

const initGeoHost = async () => {
  if (shouldSkip()) return;

  const params = new URLSearchParams(location.search);
  const forced = params.get("host");
  if (forced === "cn" || forced === "global") {
    applyPreference(forced);
    return;
  }

  const cached = readCookie(COOKIE_NAME);
  if (cached === "cn" || cached === "global") {
    applyPreference(cached);
    return;
  }

  try {
    const res = await fetch(GEO_ENDPOINT, {
      credentials: "omit",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.region === "mainland" || data?.region === "overseas") {
      steerByRegion(data.region);
    }
  } catch {
    /* stay on current host */
  }
};

initGeoHost();
