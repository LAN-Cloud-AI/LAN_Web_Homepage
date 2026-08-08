import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Prefer ~/.config/lanxin/env/cloudflare/pages.env for Pages/DNS operations
 * so the daily ops token (no Pages Write) is not required.
 */
export const loadCloudflarePagesEnv = () => {
  const file = path.join(os.homedir(), ".config/lanxin/env/cloudflare/pages.env");
  if (!fs.existsSync(file)) {
    console.warn(`Missing ${file}; falling back to process env CLOUDFLARE_API_TOKEN.`);
    return;
  }
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    process.env[key] = value;
  }
};
