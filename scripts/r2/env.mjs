import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const R2_WEBSITE_ENV = path.join(os.homedir(), ".config/lanxin/env/cloudflare/r2-website.env");

const applyEnvFile = (file) => {
  if (!fs.existsSync(file)) return false;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key]) continue;
    process.env[key] = value;
  }
  return true;
};

export const loadR2WebsiteEnv = () => {
  applyEnvFile(R2_WEBSITE_ENV);
  const token = process.env.R2_WEBSITE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_WEBSITE_BUCKET || "lan-ai-course";
  const publicHost = process.env.R2_WEBSITE_PUBLIC_HOST || "files.lancloudtech.com";
  const publicBaseUrl = (process.env.R2_WEBSITE_PUBLIC_BASE_URL || `https://${publicHost}`).replace(/\/$/, "");
  if (!token) {
    throw new Error(`Need ${R2_WEBSITE_ENV} with R2_WEBSITE_API_TOKEN.`);
  }
  if (!accountId) {
    throw new Error("Need CLOUDFLARE_ACCOUNT_ID for R2 uploads.");
  }
  return {
    token,
    accountId,
    bucket,
    publicHost,
    publicBaseUrl,
    zoneId: process.env.CLOUDFLARE_ZONE_ID || "12d261b22fda850521cbfc9dba0bc644",
    envFile: R2_WEBSITE_ENV,
  };
};
