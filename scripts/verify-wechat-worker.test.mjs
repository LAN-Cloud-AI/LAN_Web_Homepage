import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import worker from "../workers/wechat-jssdk/src/index.js";

const endpoint = "https://wechat.lancloudtech.com/api/wechat/jssdk";
const fakeTicket = "unit-test-ticket-not-a-credential";
const env = {
  WECHAT_OA_APP_ID: "unit-test-app",
  WECHAT_OA_APP_SECRET: "unit-test-secret",
  WECHAT_CACHE: {
    async get(key) {
      assert.equal(key, "wechat:jsapi_ticket");
      return { value: fakeTicket, expiresAt: Date.now() + 60000 };
    },
  },
};
const request = (url) => new Request(`${endpoint}?url=${encodeURIComponent(url)}`);

test("apex, www and global sign exact localized preview URLs using the cached ticket", async () => {
  for (const host of ["lancloudtech.com", "www.lancloudtech.com", "global.lancloudtech.com"]) {
    for (const path of ["/", "/preview/", "/preview/en/solutions/?from=timeline&query=a%26b", "/preview/zh-Hant/sitemap/"]) {
      const url = `https://${host}${path}`;
      const response = await worker.fetch(request(url), env);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(response.headers.get("access-control-allow-origin"), "*");
      const data = await response.json();
      assert.equal(data.appId, env.WECHAT_OA_APP_ID);
      assert.ok(data.nonceStr && data.timestamp);
      const expected = createHash("sha1").update(`jsapi_ticket=${fakeTicket}&noncestr=${data.nonceStr}&timestamp=${data.timestamp}&url=${url}`).digest("hex");
      assert.equal(data.signature, expected);
      assert.equal(Object.hasOwn(data, "ticket"), false);
      assert.equal(Object.hasOwn(data, "secret"), false);
    }
  }
});

test("signing rejects unrelated origins, deceptive hosts, credentials, hashes and non-HTTPS URLs", async () => {
  for (const url of [
    "https://evil.example/", "https://lancloudtech.com.evil.example/",
    "https://evil.lancloudtech.com/", "https://global.lancloudtech.com.evil.example/",
    "https://evil.example@lancloudtech.com/", "https://user:password@global.lancloudtech.com/",
    "http://lancloudtech.com/", "https://lancloudtech.com:444/", "https://lancloudtech.com/preview/#contact",
    "file:///preview/", "javascript:alert(1)", "not-a-url", "",
  ]) {
    const response = await worker.fetch(request(url), env);
    assert.equal(response.status, 400, url);
    assert.equal((await response.json()).error, "invalid_url");
  }
});

test("unprovisioned Worker reports a safe 503 and method/route handling is explicit", async () => {
  const missing = await worker.fetch(request("https://lancloudtech.com/preview/"), {});
  assert.equal(missing.status, 503);
  assert.deepEqual(await missing.json(), { error: "not_provisioned" });
  const options = await worker.fetch(new Request(endpoint, { method: "OPTIONS" }), {});
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("access-control-allow-methods"), "GET, OPTIONS");
  assert.equal((await worker.fetch(new Request(endpoint, { method: "POST" }), env)).status, 405);
  assert.equal((await worker.fetch(new Request("https://lan-wechat-jssdk.example/not-found"), env)).status, 404);
});

test("deployment preserves existing API-only routes and adds one custom domain without capturing homepages", () => {
  const config = fs.readFileSync(new URL("../workers/wechat-jssdk/wrangler.toml", import.meta.url), "utf8");
  const active = config.split("\n").filter(line => !line.trim().startsWith("#")).join("\n");
  assert.match(active, /name\s*=\s*"lan-wechat-jssdk"/);
  assert.match(active, /\[\[routes\]\]\s*pattern\s*=\s*"wechat\.lancloudtech\.com"\s*custom_domain\s*=\s*true/);
  assert.equal((active.match(/custom_domain\s*=\s*true/g) || []).length, 1);
  const patterns = [...active.matchAll(/pattern\s*=\s*"([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(patterns.sort(), [
    "lancloudtech.com/api/wechat/*",
    "wechat.lancloudtech.com",
    "www.lancloudtech.com/api/wechat/*",
  ]);
  assert.equal((active.match(/zone_name\s*=\s*"lancloudtech\.com"/g) || []).length, 2);
  assert.doesNotMatch(active, /pattern\s*=\s*"(?:www\.)?lancloudtech\.com(?:\/\*|\/)?"/);
});
