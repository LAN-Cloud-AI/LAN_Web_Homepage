import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readLegacySnapshot, localeForFile } from "./website-versions.mjs";
import { withGlobalNoindex } from "./prepare-pages-assets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const snapshot = await readLegacySnapshot(root);
const origin = "https://lancloudtech.com";
const shared = new Set(["/site-events.js", "/website-versions.css"]);
const read = (file) => fs.readFile(path.join(dist, file), "utf8");
const fileUrl = (file) => `/${file.replace(/index\.html$/, "")}`;
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
const stripPackaging = (html) => html
  .replace(/\s*<script\b[^>]*data-lan-analytics=["']umami["'][^>]*>\s*<\/script>/gi, "")
  .replace(/\s*<script\b[^>]*src=["']\/site-events\.js["'][^>]*>\s*<\/script>/gi, "")
  .replace(/\s*<link\b[^>]*href=["']\/website-versions\.css["'][^>]*>/gi, "")
  .replace(/\sdata-site-version=["'](?:legacy|preview)["']/gi, "")
  .replace(/\s*<a\b[^>]*data-site-version-switch[^>]*>[\s\S]*?<\/a>/gi, "")
  .replace(/\s*<\/head>/i, "</head>")
  .replace(/\s*<\/body>/i, "</body>");

async function targetExists(url, from) {
  const candidate = path.join(dist, decodeURIComponent(url.pathname));
  let stat;
  try { stat = await fs.stat(candidate); } catch { assert.fail(`${from}: missing local target ${url.pathname}`); }
  if (stat.isDirectory()) await fs.access(path.join(candidate, "index.html")).catch(() => assert.fail(`${from}: no index for ${url.pathname}`));
}

async function verifyHtml(file, version) {
  const html = await read(file);
  if (!/<body\b/i.test(html)) return;
  const base = new URL(fileUrl(file), origin);
  const localFile = file.replace(/^preview\//, "");
  assert.match(html, new RegExp(`<body\\b[^>]*data-site-version="${version}"`), `${file}: body version`);
  const trackers = [...html.matchAll(/<script\b[^>]*data-website-id=["']([^"']+)["'][^>]*>/gi)];
  assert.equal(trackers.length, 1, `${file}: exactly one analytics tracker`);
  assert.equal(trackers[0][1], "d93294b3-1e1c-4127-9289-1fb8bdc42293", `${file}: company analytics identity`);
  assert.match(trackers[0][0], /data-domains="lancloudtech\.com,www\.lancloudtech\.com,global\.lancloudtech\.com"/, `${file}: production domain allowlist`);
  assert.equal([...html.matchAll(/<script\b[^>]*src=["']\/site-events\.js["']/g)].length, 1, `${file}: shared events loaded once`);
  const switches = [...html.matchAll(/<a\b[^>]*\bdata-site-version-switch(?:\s|>)[^>]*>/gi)];
  assert.equal(switches.length, 1, `${file}: visible version entry`);
  const switchTag = switches[0][0];
  assert.equal(attr(switchTag, "data-umami-event"), "website_version_switch");
  assert.equal(attr(switchTag, "data-umami-event-from_version"), version);
  assert.equal(attr(switchTag, "data-umami-event-to_version"), version === "legacy" ? "preview" : "legacy");
  const destination = new URL(attr(switchTag, "href"), base);
  assert.equal(destination.origin, base.origin, `${file}: same-host version switch`);
  assert.equal(destination.pathname.startsWith("/preview/"), version === "legacy", `${file}: switch changes version`);
  assert.equal(localeForFile(destination.pathname.replace(/^\/preview\//, "").replace(/^\//, "")), localeForFile(localFile), `${file}: switch preserves language`);
  await targetExists(destination, file);
  const robots = [...html.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)];
  if (version === "preview") {
    assert.equal(robots.length, 1, `${file}: one robots declaration`);
    assert.equal(attr(robots[0][0], "content"), "noindex,follow", `${file}: preview is noindex`);
    for (const match of html.matchAll(/https:\/\/lancloudtech\.com([^\s"'<>]*)/g)) {
      assert.ok(/^\/preview(?:\/|[?#]|$)/.test(match[1]), `${file}: metadata escaped preview: ${match[0]}`);
    }
    for (const match of html.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["'](\/[^"']+)["']/g)) {
      assert.ok(match[1].startsWith("/preview/"), `${file}: inline import escaped preview`);
    }
  }
  for (const match of html.matchAll(/<(a|area|link|script|img|source|iframe|form)\b[^>]*>/gi)) {
    const tag = match[0];
    const values = [attr(tag, "href"), attr(tag, "src"), attr(tag, "action")].filter(Boolean);
    const srcset = attr(tag, "srcset");
    if (srcset) values.push(...srcset.split(",").map((item) => item.trim().split(/\s+/)[0]));
    for (const value of values) {
      if (value.startsWith("#")) continue;
      const url = new URL(value.replaceAll("&amp;", "&"), base);
      if (url.origin !== origin) continue;
      if (version === "preview" && !tag.includes("data-site-version-switch") && !shared.has(url.pathname)) {
        assert.ok(url.pathname.startsWith("/preview/"), `${file}: internal target escaped preview: ${value}`);
      }
      await targetExists(url, file);
    }
  }
}

for (const file of snapshot.paths) {
  const original = await fs.readFile(path.join(snapshot.directory, file), "utf8");
  const current = await read(file);
  if (file.endsWith(".html")) {
    assert.equal(stripPackaging(current), stripPackaging(original), `${file}: old content changed beyond the version control and analytics`);
    await verifyHtml(file, "legacy");
  } else if (!["_headers", "_redirects"].includes(file)) {
    assert.equal(current, original, `${file}: frozen legacy asset changed`);
  }
}

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(path.relative(dist, full).split(path.sep).join("/"));
  }
  return files;
}
const previewFiles = await walk(path.join(dist, "preview"));
for (const file of previewFiles.filter((file) => file.endsWith(".html"))) await verifyHtml(file, "preview");
for (const file of previewFiles.filter((file) => /\.(?:js|css)$/.test(file))) {
  assert.equal(await read(file), await fs.readFile(path.join(root, file.slice("preview/".length)), "utf8"), `${file}: preview source asset was altered`);
}
const oldSitemap = await read("sitemap.xml");
assert.ok(!oldSitemap.includes("/preview/"), "Legacy sitemap must not advertise preview routes");
const previewSitemap = await read("preview/sitemap.xml");
assert.ok(previewSitemap.includes("https://lancloudtech.com/preview/"));
for (const match of previewSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1]);
  assert.ok(url.pathname.startsWith("/preview/"));
  await targetExists(url, "preview/sitemap.xml");
}
const headers = await read("_headers");
assert.match(headers, /^\/preview\/\*\n\s+X-Robots-Tag: noindex, follow/m);
// A preview-specific tag must not stop Pages receiving a separate global rule.
const pagesHeaders = withGlobalNoindex("/*\n  X-Frame-Options: DENY\n\n/preview/*\n  X-Robots-Tag: noindex, follow\n");
assert.match(pagesHeaders, /^\/\*\n\s+X-Robots-Tag: noindex, follow/m);
assert.equal(withGlobalNoindex(pagesHeaders), pagesHeaders);
console.log(`Prelaunch verified: ${snapshot.paths.size} immutable legacy files; ${previewFiles.length} preview assets; language switches, noindex, analytics and internal links.`);
