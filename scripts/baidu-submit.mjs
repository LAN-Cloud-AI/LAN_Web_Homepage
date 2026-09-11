/**
 * Push sitemap URLs to Baidu 普通收录.
 * Token lives in ~/.config/lanxin/env/baidu/ziyuan.env
 */
import { loadBaiduZiyuanEnv } from "./load-baidu-ziyuan-env.mjs";
import { SITE_LOCALES, absoluteLocaleUrl } from "../site-identity.js";
import { PUBLIC_ROUTES } from "../site-seo.js";

loadBaiduZiyuanEnv();

const site = process.env.BAIDU_ZIYUAN_SITE || "https://lancloudtech.com";
const token = process.env.BAIDU_ZIYUAN_TOKEN;
const endpoint = process.env.BAIDU_ZIYUAN_ENDPOINT || "http://data.zz.baidu.com/urls";
const batchSize = Number(process.env.BAIDU_ZIYUAN_BATCH || 10);
const zhOnly = process.argv.includes("--zh-only");
const dryRun = process.argv.includes("--dry-run");

if (!token) {
  console.error("Set BAIDU_ZIYUAN_TOKEN in ~/.config/lanxin/env/baidu/ziyuan.env");
  process.exit(1);
}

const locales = zhOnly ? ["zh-Hans"] : SITE_LOCALES;
const urls = locales.flatMap((locale) => PUBLIC_ROUTES.map((route) => absoluteLocaleUrl(route.path, locale)));

const chunks = [];
for (let i = 0; i < urls.length; i += batchSize) chunks.push(urls.slice(i, i + batchSize));

console.log(`Baidu 普通收录 · ${site} · ${urls.length} URLs · ${chunks.length} batches`);
if (dryRun) {
  for (const url of urls) console.log(url);
  process.exit(0);
}

const postBatch = async (batch) => {
  // Baidu rejects percent-encoded site=https%3A%2F%2F... as "site init fail".
  const api = `${endpoint}?site=${site}&token=${encodeURIComponent(token)}`;
  const res = await fetch(api, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: batch.join("\n"),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Baidu returned non-JSON (${res.status})`);
  }
  return { status: res.status, data };
};

const isInitFail = (data) => String(data.message || "").includes("site init fail");

let submitted = 0;
for (const [index, batch] of chunks.entries()) {
  let { status, data } = await postBatch(batch);
  if (data.error && isInitFail(data)) {
    console.log("site not initialized yet; warming up with the homepage, then retrying.");
    const warmup = await postBatch([`${site.replace(/\/$/, "")}/`]);
    if (warmup.data.error) {
      console.error(`warmup failed: ${warmup.data.message || warmup.data.error}`);
      process.exit(1);
    }
    submitted += Number(warmup.data.success || 0);
    ({ status, data } = await postBatch(batch));
  }
  if (data.error) {
    console.error(`batch ${index + 1}/${chunks.length} HTTP ${status}: ${data.message || data.error}`);
    process.exit(1);
  }
  submitted += Number(data.success || 0);
  console.log(
    `batch ${index + 1}/${chunks.length}: success=${data.success ?? 0} remain=${data.remain ?? "?"} not_same_site=${data.not_same_site ?? 0} not_valid=${data.not_valid ?? 0}`,
  );
  if (Number(data.remain) === 0 && index < chunks.length - 1) {
    console.log("Daily quota used up; remaining URLs were not sent.");
    break;
  }
}

console.log(`Done. Accepted this run: ${submitted}`);
