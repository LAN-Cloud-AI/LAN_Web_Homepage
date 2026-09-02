/**
 * WorkBuddy 课堂资源下载：国内走阿里云 CDN（灰云 DNS，不经 CF 代理），海外走 GitHub raw。
 * 对象在桶 lan-cloud-webpage，公开前缀 lanxin/webpage/assets/（已 public-read）。
 */

export const COURSE_DOWNLOAD_GITHUB_REPO = "LAN-Cloud-AI/LAN_AI_Course_System";
export const COURSE_DOWNLOAD_GITHUB_REF = "codex/workbuddy-complete-course-release";
export const COURSE_DOWNLOAD_GITHUB_DIR =
  "docs/demos/lanxin-workbuddy-beginner-2h/WorkBuddy完整入门-发布包";

export const COURSE_DOWNLOAD_OSS_PREFIX =
  "https://img.lancloudtech.com/lanxin/webpage/assets/ai-course/workbuddy-beginner";

const GITHUB_RAW_PREFIX = `https://github.com/${COURSE_DOWNLOAD_GITHUB_REPO}/raw/${COURSE_DOWNLOAD_GITHUB_REF}/${encodeURI(
  COURSE_DOWNLOAD_GITHUB_DIR
).replace(/#/g, "%23")}`;

const COOKIE_NAME = "lan_geo_host";
const CN_HOSTS = new Set(["lancloudtech.com", "www.lancloudtech.com"]);
const GLOBAL_HOST = "global.lancloudtech.com";

const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  const parts = String(document.cookie || "")
    .split(";")
    .map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return decodeURIComponent(part.slice(name.length + 1));
  }
  return "";
};

const isLocalDev = (host) =>
  host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

export const COURSE_DOWNLOADS = {
  textbook: {
    id: "textbook",
    filename: "Workbuddy完整入门.html",
    ossKey: "lanxin/webpage/assets/ai-course/workbuddy-beginner/Workbuddy完整入门.html",
    githubPath: `${COURSE_DOWNLOAD_GITHUB_DIR}/Workbuddy完整入门.html`,
    cn: `${COURSE_DOWNLOAD_OSS_PREFIX}/Workbuddy%E5%AE%8C%E6%95%B4%E5%85%A5%E9%97%A8.html`,
    global: `${GITHUB_RAW_PREFIX}/Workbuddy%E5%AE%8C%E6%95%B4%E5%85%A5%E9%97%A8.html`,
    disposition: "inline",
    contentType: "text/html; charset=utf-8",
  },
  practice: {
    id: "practice",
    filename: "WorkBuddy课堂练习包.zip",
    ossKey: "lanxin/webpage/assets/ai-course/workbuddy-beginner/WorkBuddy课堂练习包.zip",
    githubPath: `${COURSE_DOWNLOAD_GITHUB_DIR}/WorkBuddy课堂练习包.zip`,
    cn: `${COURSE_DOWNLOAD_OSS_PREFIX}/WorkBuddy%E8%AF%BE%E5%A0%82%E7%BB%83%E4%B9%A0%E5%8C%85.zip`,
    global: `${GITHUB_RAW_PREFIX}/WorkBuddy%E8%AF%BE%E5%A0%82%E7%BB%83%E4%B9%A0%E5%8C%85.zip`,
    disposition: "attachment",
    contentType: "application/zip",
  },
};

/** 与 geo-host.js 同一套 ?host= / cookie / 主机名；本机默认国内链，便于直连 OSS。 */
export const preferMainlandDownloads = () => {
  if (typeof location === "undefined") return true;

  const params = new URLSearchParams(location.search);
  const forced = params.get("host");
  if (forced === "cn") return true;
  if (forced === "global") return false;

  const cached = readCookie(COOKIE_NAME);
  if (cached === "cn") return true;
  if (cached === "global") return false;

  const host = location.hostname;
  if (CN_HOSTS.has(host)) return true;
  if (host === GLOBAL_HOST) return false;
  if (isLocalDev(host)) return true;
  return true;
};

export const hrefForCourseDownload = (item, mainland = preferMainlandDownloads()) =>
  mainland ? item.cn : item.global;

export const applyCourseDownloads = (root = typeof document === "undefined" ? null : document) => {
  if (!root) return preferMainlandDownloads();
  const mainland = preferMainlandDownloads();
  root.querySelectorAll("[data-course-download]").forEach((el) => {
    const id = el.getAttribute("data-course-download");
    const item = COURSE_DOWNLOADS[id];
    if (!item) return;
    const href = hrefForCourseDownload(item, mainland);
    el.setAttribute("href", href);
    el.dataset.downloadHost = mainland ? "cn" : "global";
    if (item.disposition === "attachment") {
      el.setAttribute("download", item.filename);
    } else {
      el.removeAttribute("download");
    }
  });
  return mainland;
};
