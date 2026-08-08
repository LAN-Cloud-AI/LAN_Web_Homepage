#!/usr/bin/env node
/**
 * Build dist/ with Pages _headers and deploy to Cloudflare Pages project.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCloudflarePagesEnv } from "./load-cloudflare-pages-env.mjs";
import { preparePagesAssets } from "./prepare-pages-assets.mjs";

loadCloudflarePagesEnv();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = process.env.CF_PAGES_PROJECT || "lan-homepage-global";

await preparePagesAssets();

const result = spawnSync(
  "npx",
  ["wrangler", "pages", "deploy", "dist", `--project-name=${PROJECT}`, "--commit-dirty=true"],
  { cwd: root, stdio: "inherit", env: process.env }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Deployed Cloudflare Pages project: ${PROJECT}`);
