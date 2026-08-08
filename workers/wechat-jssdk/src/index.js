const ALLOWED_ORIGINS = new Set(["https://lancloudtech.com", "https://www.lancloudtech.com"]);
const TOKEN_CACHE_KEY = "wechat:access_token";
const TICKET_CACHE_KEY = "wechat:jsapi_ticket";

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      ...headers,
    },
  });

const corsPreflight = () =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Accept, Content-Type",
      "access-control-max-age": "86400",
    },
  });

const randomNonce = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const sha1Hex = async (text) => {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const isAllowedUrl = (raw) => {
  try {
    const url = new URL(raw);
    if (url.hash) return false;
    if (!ALLOWED_ORIGINS.has(url.origin)) return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
};

const readCache = async (env, key) => {
  if (!env.WECHAT_CACHE) return null;
  const raw = await env.WECHAT_CACHE.get(key, "json");
  if (!raw?.value || !raw?.expiresAt) return null;
  if (Date.now() >= raw.expiresAt) return null;
  return raw.value;
};

const writeCache = async (env, key, value, expiresInSec) => {
  if (!env.WECHAT_CACHE) return;
  const ttl = Math.max(60, Number(expiresInSec) - 120);
  const expiresAt = Date.now() + ttl * 1000;
  await env.WECHAT_CACHE.put(key, JSON.stringify({ value, expiresAt }), {
    expirationTtl: ttl,
  });
};

const fetchAccessToken = async (env) => {
  const cached = await readCache(env, TOKEN_CACHE_KEY);
  if (cached) return cached;

  const appId = env.WECHAT_OA_APP_ID;
  const secret = env.WECHAT_OA_APP_SECRET;
  if (!appId || !secret) {
    throw new Error("WECHAT_OA credentials not provisioned");
  }

  const endpoint =
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential` +
    `&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(secret)}`;
  const res = await fetch(endpoint);
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(data.errmsg || "failed to fetch access_token");
  }
  await writeCache(env, TOKEN_CACHE_KEY, data.access_token, data.expires_in || 7200);
  return data.access_token;
};

const fetchJsapiTicket = async (env) => {
  const cached = await readCache(env, TICKET_CACHE_KEY);
  if (cached) return cached;

  const token = await fetchAccessToken(env);
  const endpoint =
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(token)}&type=jsapi`;
  const res = await fetch(endpoint);
  const data = await res.json();
  if (!data.ticket) {
    throw new Error(data.errmsg || "failed to fetch jsapi_ticket");
  }
  await writeCache(env, TICKET_CACHE_KEY, data.ticket, data.expires_in || 7200);
  return data.ticket;
};

const signJsSdk = async (env, url) => {
  const ticket = await fetchJsapiTicket(env);
  const nonceStr = randomNonce();
  const timestamp = Math.floor(Date.now() / 1000);
  const plain =
    `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const signature = await sha1Hex(plain);
  return {
    appId: env.WECHAT_OA_APP_ID,
    timestamp,
    nonceStr,
    signature,
  };
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return corsPreflight();
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);

    const { pathname, searchParams } = new URL(request.url);
    if (pathname !== "/api/wechat/jssdk" && pathname !== "/jssdk") {
      return json({ error: "not_found" }, 404);
    }

    if (!env.WECHAT_OA_APP_ID || !env.WECHAT_OA_APP_SECRET) {
      return json({ error: "not_provisioned" }, 503);
    }

    const url = searchParams.get("url");
    if (!url || !isAllowedUrl(url)) {
      return json({ error: "invalid_url" }, 400);
    }

    try {
      const payload = await signJsSdk(env, url);
      return json(payload);
    } catch (error) {
      return json(
        {
          error: "sign_failed",
          message: error instanceof Error ? error.message : "unknown",
        },
        502
      );
    }
  },
};
