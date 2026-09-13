import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicAssetFiles } from "./website-versions.mjs";
import { upsertAnalytics } from "./seo-html.mjs";
import { siteEventsScriptTag } from "../site-analytics.js";

import { fingerprintAssets } from "./fingerprint-assets.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Only the current site is public. The legacy snapshot stays in Git for recovery. */
export const prepareWorkerAssets = async ({ root = projectRoot, output = path.join(root, "dist") } = {}) => {
  const resolvedRoot = await fs.realpath(root);
  const resolvedOutput = path.resolve(output);
  if (resolvedOutput !== path.join(resolvedRoot, "dist")) throw new Error("The release output must be the repository dist/ directory.");
  const files = await publicAssetFiles(resolvedRoot);
  if (!files.includes("site-events.js")) throw new Error("Shared site-events.js is required before packaging.");
  await fs.rm(resolvedOutput, { recursive: true, force: true });
  await fs.mkdir(resolvedOutput, { recursive: true });
  for (const relative of files) {
    const destination = path.join(resolvedOutput, relative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    let data = await fs.readFile(path.join(resolvedRoot, relative));
    if (relative.endsWith(".html") && /<body\b/i.test(data.toString("utf8"))) {
      let html = data.toString("utf8");
      html = html.replace(/<body\b([^>]*)>/i, (_, attributes) => `<body${attributes.replace(/\sdata-site-version\s*=\s*["'][^"']*["']/gi, "")} data-site-version="current">`);
      html = upsertAnalytics(html, "lan");
      html = html.replace(/\s*<script\b(?=[^>]*(?:data-lan-events|src=["']\/?site-events\.js["']))[^>]*>\s*<\/script>/gi, "");
      html = html.replace(/<\/head>/i, `  ${siteEventsScriptTag()}\n</head>`);
      data = Buffer.from(html);
    }
    await fs.writeFile(destination, data);
  }
  await fingerprintAssets(resolvedOutput, files);
  return resolvedOutput;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareWorkerAssets();
  console.log("Production assets prepared: current website at root; no legacy or preview copy.");
}
