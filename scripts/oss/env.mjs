import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lanxinEnvRoot = process.env.LANXIN_ENV_ROOT
  || path.join(process.env.HOME || "", ".config/lanxin/env");

for (const candidate of [
  path.join(lanxinEnvRoot, "aliyun/oss.env"),
  path.join(lanxinEnvRoot, "projects/lan-web-homepage.env"),
  path.join(projectRoot, ".env"),
]) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
}

const required = [
  "ALIYUN_ACCESS_KEY_ID",
  "ALIYUN_ACCESS_KEY_SECRET",
  "ALIYUN_OSS_REGION",
  "ALIYUN_OSS_BUCKET",
  "ALIYUN_OSS_ENDPOINT",
  "ALIYUN_OSS_PUBLIC_BASE_URL",
];

export const getOssEnv = ({ requireKeys = true } = {}) => {
  const env = {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || "",
    region: process.env.ALIYUN_OSS_REGION || "oss-cn-wuhan-lr",
    bucket: process.env.ALIYUN_OSS_BUCKET || "lan-cloud-webpage",
    endpoint: process.env.ALIYUN_OSS_ENDPOINT || "https://oss-cn-wuhan-lr.aliyuncs.com",
    publicBaseUrl: (process.env.ALIYUN_OSS_PUBLIC_BASE_URL || "").replace(/\/$/, ""),
    rootPrefix: (process.env.ALIYUN_OSS_ROOT_PREFIX || "lanxin").replace(/^\/|\/$/g, ""),
    projectRoot,
  };

  if (!env.publicBaseUrl) {
    env.publicBaseUrl = `https://${env.bucket}.${env.region}.aliyuncs.com`;
  }

  if (requireKeys) {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(
        `Missing OSS env: ${missing.join(", ")}. See ~/.config/lanxin/AGENTS.md (aliyun/oss.env).`,
      );
    }
  }

  return env;
};

export const webpagePrefix = (env = getOssEnv({ requireKeys: false })) =>
  `${env.rootPrefix}/webpage`;

export const sharedPrefix = (env = getOssEnv({ requireKeys: false })) =>
  `${env.rootPrefix}/shared`;

export const miniprogramPrefix = (env = getOssEnv({ requireKeys: false })) =>
  `${env.rootPrefix}/apps/miniprogram`;

export const assertEnvFileExists = () => {
  const candidates = [
    path.join(lanxinEnvRoot, "aliyun/oss.env"),
    path.join(lanxinEnvRoot, "projects/lan-web-homepage.env"),
    path.join(projectRoot, ".env"),
  ];
  const envPath = candidates.find((p) => fs.existsSync(p));
  if (!envPath) {
    throw new Error(
      `OSS env not found. Expected ~/.config/lanxin/env/aliyun/oss.env (see ~/.config/lanxin/AGENTS.md).`,
    );
  }
  return envPath;
};
