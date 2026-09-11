import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** 读取 ~/.config/lanxin/env/baidu/ziyuan.env，不要把 token 写进仓库。 */
export const loadBaiduZiyuanEnv = () => {
  const file = path.join(os.homedir(), ".config/lanxin/env/baidu/ziyuan.env");
  if (!fs.existsSync(file)) {
    console.warn(`Missing ${file}; falling back to process env BAIDU_ZIYUAN_TOKEN.`);
    return;
  }
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
};
