/**
 * Prepare dist/ for Cloudflare Pages (same as origin assets + Pages _headers).
 * Starts from repo-root `_headers` and ensures X-Robots-Tag: noindex for the global host.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareWorkerAssets } from "./prepare-worker-assets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const FALLBACK_HEADERS = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Robots-Tag: noindex, follow
`;

const withNoindex = (raw) => {
  if (raw.includes("X-Robots-Tag:")) return raw;
  if (raw.startsWith("/*")) {
    return raw.replace(/^(\/\*\n)/, "$1  X-Robots-Tag: noindex, follow\n");
  }
  return `${raw.trimEnd()}\n\n/*\n  X-Robots-Tag: noindex, follow\n`;
};

export const preparePagesAssets = async () => {
  await prepareWorkerAssets({ root, output: dist });
  let headers = FALLBACK_HEADERS;
  try {
    headers = withNoindex(await fs.readFile(path.join(root, "_headers"), "utf8"));
  } catch {
    /* fallback */
  }
  await fs.writeFile(path.join(dist, "_headers"), headers, "utf8");
  return dist;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await preparePagesAssets();
  console.log("Pages asset directory prepared: dist/ (with _headers noindex)");
}
