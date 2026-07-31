/** Shared OSS public image base (no trailing slash). */
export const OSS_IMAGES_BASE =
  process.env.ALIYUN_OSS_PUBLIC_BASE_URL?.replace(/\/$/, "")
    ? `${process.env.ALIYUN_OSS_PUBLIC_BASE_URL.replace(/\/$/, "")}/lanxin/webpage/images`
    : "https://lan-cloud-webpage.oss-cn-wuhan-lr.aliyuncs.com/lanxin/webpage/images";

export const isOssImageUrl = (value) =>
  typeof value === "string" && value.startsWith(OSS_IMAGES_BASE + "/");
