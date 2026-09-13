import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { analyticsScriptTag, UMAMI_WEBSITE_IDS } from "../site-analytics.js";

export const LEGACY_COMMIT = "956573d025de564b3bd1294414ba4b312e160eab";
export const PREVIEW_PREFIX = "/preview";
export const SITE_ORIGIN = "https://lancloudtech.com";
export const PUBLIC_DIRECTORIES = new Set([
  "ai-course", "contact", "en", "zh-Hant", "internal-expense", "leadshunter", "sitemap", "solutions", "practice",
]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = promisify(execFile);
const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");

/** Deliberate public allowlist: a new repository directory is never published implicitly. */
export const isPublicAsset = (relative) => {
  const parts = relative.split("/");
  if (parts.some((part) => !part || part.startsWith(".") || /[\\\x00-\x1f]/.test(part))) return false;
  if (parts.length > 1 && !PUBLIC_DIRECTORIES.has(parts[0])) return false;
  if (parts.some((part) => ["scripts", "docs", "workers", "ops", "node_modules", "legacy-site", "images"].includes(part))) return false;
  const name = parts.at(-1);
  if (["_headers", "_redirects"].includes(relative)) return true;
  if (["robots.txt", "llms.txt", "ping.txt"].includes(name)) return true;
  return /\.(?:html|css|js|xml)$/.test(name);
};

export async function publicAssetFiles(directory, relative = "") {
  const files = [];
  for (const entry of await fs.readdir(path.join(directory, relative), { withFileTypes: true })) {
    const next = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || (!relative && !PUBLIC_DIRECTORIES.has(entry.name))) continue;
      if (["scripts", "docs", "workers", "ops", "node_modules", "legacy-site", "images"].includes(entry.name)) continue;
      files.push(...await publicAssetFiles(directory, next));
    } else if (entry.isFile() && isPublicAsset(next)) files.push(next);
  }
  return files.sort();
}

/** An explicit, one-time capture. Normal builds consume the committed snapshot, never HEAD. */
export async function captureLegacySnapshot(projectRoot = root) {
  const destination = path.join(projectRoot, "legacy-site");
  try {
    await fs.access(destination);
    throw new Error("legacy-site already exists; refusing to overwrite the reviewed snapshot.");
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  const { stdout } = await git("git", ["ls-tree", "-r", "--name-only", "-z", LEGACY_COMMIT], { cwd: projectRoot });
  const files = [];
  for (const relative of stdout.split("\0").filter(isPublicAsset).sort()) {
    const { stdout: bytes } = await git("git", ["show", `${LEGACY_COMMIT}:${relative}`], { cwd: projectRoot, encoding: "buffer", maxBuffer: 8 * 1024 * 1024 });
    await fs.mkdir(path.dirname(path.join(destination, relative)), { recursive: true });
    await fs.writeFile(path.join(destination, relative), bytes);
    files.push({ path: relative, bytes: bytes.length, sha256: digest(bytes) });
  }
  const manifest = {
    schemaVersion: 1,
    sourceRepository: "https://github.com/LAN-Cloud-AI/LAN_Web_Homepage",
    sourceCommit: LEGACY_COMMIT,
    scope: "Public static site files only. Images remain on the existing OSS CDN. Repository, operations and generator files are excluded.",
    files,
  };
  await fs.writeFile(path.join(destination, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function readLegacySnapshot(projectRoot = root) {
  const directory = path.join(projectRoot, "legacy-site");
  const manifest = JSON.parse(await fs.readFile(path.join(directory, "manifest.json"), "utf8"));
  if (manifest.sourceCommit !== LEGACY_COMMIT || manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) throw new Error("Invalid legacy snapshot source.");
  const paths = new Set();
  for (const entry of manifest.files) {
    if (!isPublicAsset(entry.path) || paths.has(entry.path)) throw new Error(`Invalid snapshot path: ${entry.path}`);
    paths.add(entry.path);
    const file = path.join(directory, entry.path);
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Snapshot must contain regular files: ${entry.path}`);
    const bytes = await fs.readFile(file);
    if (bytes.length !== entry.bytes || digest(bytes) !== entry.sha256) throw new Error(`Legacy snapshot changed: ${entry.path}`);
  }
  const actual = await publicAssetFiles(directory);
  if (actual.length !== paths.size || actual.some((file) => !paths.has(file))) throw new Error("Unmanifested public file in legacy snapshot.");
  return { directory, manifest, paths };
}

export const toPreviewPath = (value) => {
  if (!value.startsWith("/") || value.startsWith("//") || /^\/preview(?:\/|[?#]|$)/.test(value)) return value;
  return `${PREVIEW_PREFIX}${value}`;
};

export const rebaseApexUrls = (text) => text
  .replace(/https:\/\/lancloudtech\.com(?=\/|[\s"'<>]|$)(?!\/preview(?:\/|[?#]|$))/g, `${SITE_ORIGIN}${PREVIEW_PREFIX}`)
  .replace(/https:\/\/lancloudtech\.com\/preview(?=[\s"'<>]|$)/g, `${SITE_ORIGIN}${PREVIEW_PREFIX}/`);

export function rebasePreviewHtml(html) {
  let result = rebaseApexUrls(html);
  // Canonical / hreflang stay absolute; navigation stays on the current host.
  result = result.replace(/<(?:a|area)\b[^>]*>/gi, (tag) => tag.replace(/(\bhref\s*=\s*["'])https:\/\/lancloudtech\.com(?=\/)/gi, "$1"));
  result = result.replace(/\b(href|src|action|poster)\s*=\s*(["'])(\/(?!\/)[^"']*)\2/gi,
    (_, attribute, quote, value) => `${attribute}=${quote}${toPreviewPath(value)}${quote}`);
  result = result.replace(/\bsrcset\s*=\s*(["'])([\s\S]*?)\1/gi, (_, quote, value) =>
    `srcset=${quote}${value.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/g, (match, separator, url) => `${separator}${toPreviewPath(url)}`)}${quote}`);
  // Locale 404 pages contain an inline module with a root-relative import.
  result = result.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])(\/(?!\/)[^"']+)\2/g,
    (_, keyword, quote, value) => `${keyword}${quote}${toPreviewPath(value)}${quote}`);
  return result;
}

const LOCALES = {
  en: { try: "Try new website", back: "Back to original", label: "Website version" },
  "zh-Hant": { try: "體驗新版", back: "返回舊版", label: "網站版本" },
  "zh-Hans": { try: "体验新版", back: "返回旧版", label: "网站版本" },
};
export const localeForFile = (relative) => relative.startsWith("en/") ? "en" : relative.startsWith("zh-Hant/") ? "zh-Hant" : "zh-Hans";
const htmlUrl = (relative) => `/${relative.replace(/(?:^|\/)index\.html$/, (match) => match.startsWith("/") ? "/" : "")}`;

export function versionSwitchTarget(relative, version, legacyPaths) {
  const locale = localeForFile(relative);
  const fallback = locale === "zh-Hans" ? "/" : `/${locale}/`;
  const isError = /(?:^|\/)404\.html$/.test(relative);
  if (version === "legacy") return `${PREVIEW_PREFIX}${isError ? fallback : htmlUrl(relative)}`;
  return !isError && legacyPaths.has(relative) ? htmlUrl(relative) : fallback;
}

export const VERSION_SWITCH_CSS = `/* Shared prelaunch control: scoped so frozen legacy styling stays intact. */
.website-version-switch{position:fixed;z-index:200;left:12px;bottom:max(12px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:8px;max-width:calc(100vw - 96px);box-sizing:border-box;min-height:44px;padding:10px 14px;border:1px solid #c1d5d3;border-radius:999px;background:#f7fffe;color:#123d38;box-shadow:0 4px 20px #123d381a;font:600 13px/1.3 system-ui,sans-serif;text-decoration:none;letter-spacing:0;overflow-wrap:anywhere;transition:background .15s ease}
.website-version-switch:hover{background:#e8f7f3;color:#123d38}
.website-version-switch:focus-visible{outline:3px solid #167d72;outline-offset:4px}
.website-version-switch__badge{flex:none;padding:3px 5px;border-radius:5px;background:#17675e;color:#fff;font:700 9px/1 system-ui,sans-serif;letter-spacing:.06em}
.website-version-switch__arrow{flex:none;font-size:16px}
@media(prefers-color-scheme:dark){.website-version-switch{background:#16332f;border-color:#476c66;color:#edfffa;box-shadow:0 4px 20px #0003}.website-version-switch:hover{background:#20443e;color:#edfffa}.website-version-switch__badge{background:#96d8c7;color:#123d38}}
@media(prefers-reduced-motion:reduce){.website-version-switch{transition:none}}
`;

export function versionedHtml(original, { relative, version, legacyPaths }) {
  // Search-engine verification tokens are not pages and must remain byte-for-byte exact.
  if (!/<body\b/i.test(original)) return original;
  let html = version === "preview" ? rebasePreviewHtml(original) : original;
  if (version === "preview") {
    html = html.replace(/\s*<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/gi, "");
    html = html.replace(/<\/head>/i, '  <meta name="robots" content="noindex,follow" />\n</head>');
  }
  html = html.replace(/<body\b([^>]*)>/i, (_, attributes) => `<body${attributes.replace(/\sdata-site-version\s*=\s*["'][^"']*["']/gi, "")} data-site-version="${version}">`);
  // Both versions use the existing company property, exactly once per document.
  html = html.replace(/\s*<script\b(?=[^>]*(?:data-lan-analytics\s*=\s*["']umami["']|src\s*=\s*["']https:\/\/stats\.lancloudtech\.com\/u\.js["']))[^>]*>\s*<\/script>/gi, "");
  if (UMAMI_WEBSITE_IDS.lan !== "d93294b3-1e1c-4127-9289-1fb8bdc42293") throw new Error("The prelaunch package must retain the existing LAN Umami property.");
  html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="/website-versions.css" />\n  ${analyticsScriptTag("lan")}\n  <script type="module" src="/site-events.js"></script>\n</head>`);
  const locale = localeForFile(relative);
  const copy = LOCALES[locale];
  const destination = versionSwitchTarget(relative, version, legacyPaths);
  const targetVersion = version === "legacy" ? "preview" : "legacy";
  const label = version === "legacy" ? copy.try : copy.back;
  const badge = version === "legacy" ? '<span class="website-version-switch__badge" aria-hidden="true">NEW</span>' : "";
  const control = `<a class="website-version-switch" href="${destination}" aria-label="${label}" data-site-version-switch data-umami-event="website_version_switch" data-umami-event-site_version="${version}" data-umami-event-language="${locale}" data-umami-event-from_version="${version}" data-umami-event-to_version="${targetVersion}">${badge}<span>${label}</span><span class="website-version-switch__arrow" aria-hidden="true">${version === "legacy" ? "↗" : "↶"}</span></a>`;
  return html.replace(/<\/body>/i, `  ${control}\n</body>`);
}

export function previewRedirects(text) {
  return text.split("\n").map((line) => {
    if (!line.trim() || line.trimStart().startsWith("#")) return line;
    const parts = line.trim().split(/\s+/);
    parts[0] = toPreviewPath(parts[0]);
    if (parts[1]) parts[1] = toPreviewPath(parts[1]);
    return parts.join("    ");
  }).join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] !== "--capture-legacy" || process.argv.length !== 3) throw new Error("Usage: node scripts/website-versions.mjs --capture-legacy");
  const manifest = await captureLegacySnapshot();
  console.log(`Captured ${manifest.files.length} public files from ${LEGACY_COMMIT}.`);
}
