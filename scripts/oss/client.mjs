import OSS from "ali-oss";
import { getOssEnv } from "./env.mjs";

export const createOssClient = (overrides = {}) => {
  const env = getOssEnv();
  return new OSS({
    region: env.region,
    bucket: env.bucket,
    endpoint: env.endpoint,
    accessKeyId: env.accessKeyId,
    accessKeySecret: env.accessKeySecret,
    secure: true,
    timeout: 120_000,
    ...overrides,
  });
};

export const publicUrlForKey = (key, env = getOssEnv()) => {
  const clean = String(key).replace(/^\/+/, "");
  return `${env.publicBaseUrl}/${clean}`;
};

export const joinKey = (...parts) =>
  parts
    .flatMap((part) => String(part || "").split("/"))
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
