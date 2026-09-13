import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
const plainModule = (source) => source
  .replace(/^import .*?;\n/gm, "")
  .replace(/^export \{[^}]*\};\n/gm, "")
  .replace(/\bexport (?=(?:const|let|function))/g, "");
const flush = async () => { for (let n = 0; n < 12; n++) await Promise.resolve(); };

function browser({ url = "https://lancloudtech.com/preview/", wechat = true, loaded = true, existing = false } = {}) {
  const calls = { scripts: 0, signs: [], configs: [], friend: [], timeline: [], legacy: [] };
  const timers = new Map();
  let timerId = 0;
  let script = null;
  const state = { signStatus: 200, signExtra: {}, hangFetch: false, configError: false, hangConfig: false, autoLoad: true, shareError: false, hangShare: false, unsupportedShare: false };
  const shareResult = (value) => {
    if (!state.hangShare) queueMicrotask(() => {
      if (state.unsupportedShare) value.fail({ errMsg: "updateAppMessageShareData:fail, function not exist" });
      else if (state.shareError) value.fail({ errMsg: "updateAppMessageShareData:fail, permission denied" });
      else value.success();
    });
  };
  const wx = {
    config(value) { calls.configs.push(value); },
    error(callback) { this.errorCallback = callback; },
    ready(callback) {
      if (state.hangConfig) return;
      queueMicrotask(() => state.configError ? this.errorCallback({ errMsg: "config:fail" }) : callback());
    },
    updateAppMessageShareData(value) { calls.friend.push(value); shareResult(value); },
    updateTimelineShareData(value) { calls.timeline.push(value); shareResult(value); },
    onMenuShareAppMessage(value) { calls.legacy.push(value); },
    onMenuShareTimeline(value) { calls.legacy.push(value); },
  };
  const window = { location: new URL(url), ...(loaded ? { wx } : {}) };
  const createScript = () => {
    const listeners = new Map();
    return {
      addEventListener(name, callback) { listeners.set(name, callback); },
      removeEventListener(name) { listeners.delete(name); },
      remove() { if (script === this) script = null; },
      dispatch(name) { listeners.get(name)?.(); },
    };
  };
  if (existing) script = createScript();
  const document = {
    querySelector: () => script,
    createElement: createScript,
    head: { appendChild(value) {
      calls.scripts++;
      script = value;
      if (state.autoLoad) queueMicrotask(() => { window.wx = wx; script.dispatch("load"); });
    } },
  };
  const moduleUrl = new URL(window.location.pathname.startsWith("/preview/") ? "/preview/site-identity.js" : "/site-identity.js", url).href;
  const source = [
    plainModule(read("site-identity.js").replaceAll("import.meta.url", JSON.stringify(moduleUrl))),
    plainModule(read("share-meta.js")),
    plainModule(read("wechat-share.js")),
    "globalThis.api = { initWechatShare, refreshWechatShare, SHARE_BY_ROUTE, SITE_LOCALES };",
  ].join("\n");
  const context = vm.createContext({
    window, document, navigator: { userAgent: wechat ? "MicroMessenger/8.0" : "Mozilla/5.0" },
    URL, AbortController,
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
    fetch: async (endpoint, options) => {
      calls.signs.push({ endpoint: new URL(endpoint).origin + new URL(endpoint).pathname, url: new URL(endpoint).searchParams.get("url"), credentials: options.credentials });
      if (state.hangFetch) return new Promise((_, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted"))));
      return {
        ok: state.signStatus === 200, status: state.signStatus,
        json: async () => ({ appId: "test-app", timestamp: 123, nonceStr: "test-nonce", signature: "test-signature", ...state.signExtra }),
      };
    },
  });
  vm.runInContext(source, context);
  return {
    ...context.api, calls, state, wx,
    expire() { for (const callback of [...timers.values()]) callback(); },
    load() { window.wx = wx; script.dispatch("load"); },
    failLoad() { script.dispatch("error"); },
    get pendingTimers() { return timers.size; },
  };
}

test("all nine routes and three locales retain exactly one preview prefix on both production hosts", async () => {
  for (const host of ["lancloudtech.com", "global.lancloudtech.com"]) {
    const page = browser({ url: `https://${host}/preview/en/solutions/?from=timeline&x=a%26b#vect` });
    assert.equal(Object.keys(page.SHARE_BY_ROUTE).length, 9);
    for (const [id, route] of Object.entries(page.SHARE_BY_ROUTE)) {
      for (const locale of page.SITE_LOCALES) {
        assert.equal(await page.initWechatShare(id, { getLocale: () => locale }), true);
        const friend = page.calls.friend.at(-1);
        const timeline = page.calls.timeline.at(-1);
        const prefix = locale === "zh-Hans" ? "" : `/${locale}`;
        assert.equal(friend.link, `https://lancloudtech.com/preview${prefix}${route.path}`);
        assert.equal(friend.title, route.locales[locale].title);
        assert.equal(friend.desc, route.locales[locale].desc);
        assert.equal(friend.imgUrl, route.image);
        assert.equal(timeline.link, friend.link);
        assert.equal(timeline.title, friend.title);
      }
    }
    assert.equal(page.calls.configs.length, 1);
    assert.equal(page.calls.signs.length, 1);
    assert.equal(page.calls.signs[0].endpoint, "https://wechat.lancloudtech.com/api/wechat/jssdk");
    assert.equal(page.calls.signs[0].url, `https://${host}/preview/en/solutions/?from=timeline&x=a%26b`);
    assert.equal(page.calls.signs[0].credentials, "omit");
    assert.equal(page.calls.legacy.length, 0);
    assert.equal(page.pendingTimers, 0);
  }
});

test("ordinary browsers do not load the SDK or request a signature", async () => {
  const page = browser({ wechat: false, loaded: false });
  assert.equal(await page.initWechatShare("home"), false);
  assert.equal(page.calls.scripts, 0);
  assert.equal(page.calls.signs.length, 0);
});

test("existing SDK script still loading is awaited, with latest locale winning concurrent updates", async () => {
  const page = browser({ loaded: false, existing: true });
  const first = page.initWechatShare("home");
  const latest = page.refreshWechatShare("en");
  await flush();
  assert.equal(page.calls.signs.length, 0);
  page.load();
  assert.equal(await first, false);
  assert.equal(await latest, true);
  assert.equal(page.calls.scripts, 0);
  assert.equal(page.calls.signs.length, 1);
  assert.equal(page.calls.friend.length, 1);
  assert.equal(page.calls.friend[0].title, page.SHARE_BY_ROUTE.home.locales.en.title);
});

test("SDK failures and timeouts clear failed elements so a later attempt can recover", async () => {
  for (const failure of ["error", "timeout"]) {
    const page = browser({ loaded: false });
    page.state.autoLoad = false;
    const first = page.initWechatShare("home");
    await flush();
    if (failure === "error") page.failLoad(); else page.expire();
    assert.equal(await first, false);
    page.state.autoLoad = true;
    assert.equal(await page.initWechatShare("home"), true);
    assert.equal(page.calls.scripts, 2);
    assert.equal(page.pendingTimers, 0);
  }
});

test("incomplete signatures and HTTP errors never reach wx.config and remain retryable", async () => {
  for (const mode of ["http", "nonce", "timestamp"]) {
    const page = browser();
    if (mode === "http") page.state.signStatus = 503;
    else page.state.signExtra[mode === "nonce" ? "nonceStr" : "timestamp"] = null;
    assert.equal(await page.initWechatShare("home"), false);
    assert.equal(page.calls.configs.length, 0);
    page.state.signStatus = 200;
    page.state.signExtra = {};
    assert.equal(await page.initWechatShare("home"), true);
  }
});

test("network/config timeouts and wx.error resolve false and support recovery", async () => {
  for (const mode of ["hangFetch", "hangConfig", "configError"]) {
    const page = browser();
    page.state[mode] = true;
    const first = page.initWechatShare("home");
    await flush();
    if (mode !== "configError") page.expire();
    assert.equal(await first, false);
    page.state[mode] = false;
    assert.equal(await page.initWechatShare("home"), true);
    assert.equal(page.pendingTimers, 0);
  }
});

test("legacy clients receive both fallback registrations without waiting for a real share", async () => {
  const page = browser({ url: "https://lancloudtech.com/en/" });
  delete page.wx.updateAppMessageShareData;
  delete page.wx.updateTimelineShareData;
  assert.equal(await page.initWechatShare("home", { getLocale: () => "en" }), true);
  assert.equal(page.calls.legacy.length, 2);
  assert.equal(page.calls.legacy[0].link, "https://lancloudtech.com/en/");
});

test("modern share API rejection or missing callbacks cannot be reported as configured", async () => {
  for (const mode of ["shareError", "hangShare"]) {
    const page = browser();
    page.state[mode] = true;
    const first = page.initWechatShare("home");
    await flush();
    if (mode === "hangShare") page.expire();
    assert.equal(await first, false);
    page.state[mode] = false;
    assert.equal(await page.refreshWechatShare(), true);
    assert.equal(page.calls.configs.length, 1);
    assert.equal(page.pendingTimers, 0);
  }
});

test("an old native client can use legacy sharing even when the loaded SDK exposes modern methods", async () => {
  const page = browser();
  page.state.unsupportedShare = true;
  assert.equal(await page.initWechatShare("home"), true);
  assert.equal(page.calls.legacy.length, 2);
});
