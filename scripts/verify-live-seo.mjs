#!/usr/bin/env node
/**
 * Production smoke checks after Nginx / rsync / Pages / LH deploys.
 */
const required = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
};

const fetchText = async (url, init = {}) => {
  const res = await fetch(url, { redirect: "manual", ...init });
  const text = res.status === 301 || res.status === 302 || res.status === 308 ? "" : await res.text();
  return { res, text, location: res.headers.get("location") || "" };
};

const { res: www } = await fetchText("https://www.lancloudtech.com/en/");
required(www.status === 301 || www.status === 308, `www must 301, got ${www.status}`);
required(
  www.headers.get("location")?.startsWith("https://lancloudtech.com/en/"),
  `www must keep /en/ on apex, got ${www.headers.get("location")}`,
);

const { res: indexHtml } = await fetchText("https://lancloudtech.com/index.html");
required(indexHtml.status === 301 || indexHtml.status === 308, `/index.html must 301, got ${indexHtml.status}`);

const { res: hop } = await fetchText("https://lancloudtech.com/leadshunter/");
required(
  hop.status === 301 || hop.status === 308,
  `/leadshunter/ must 301, got ${hop.status}`,
);
required(
  (hop.headers.get("location") || "").includes("leadshunter.lancloudtech.com"),
  `/leadshunter/ must go to the product site`,
);

const { res: missing, text: missingBody } = await fetchText("https://lancloudtech.com/this-path-does-not-exist-seo/");
required(missing.status === 404, `unknown path must 404, got ${missing.status}`);
required(!missingBody.includes('data-i18n="hero.h1"'), "404 body must not be the homepage.");

const { res: en, text: enHtml } = await fetchText("https://lancloudtech.com/en/");
required(en.status === 200, `/en/ must 200, got ${en.status}`);
required(/<html[^>]*lang="en"/.test(enHtml), "/en/ must set html lang=en");
required(enHtml.includes('hreflang="zh-Hant"'), "/en/ must include hreflang");

const { res: hant, text: hantHtml } = await fetchText("https://lancloudtech.com/zh-Hant/");
required(hant.status === 200, `/zh-Hant/ must 200, got ${hant.status}`);
required(/<html[^>]*lang="zh-Hant"/.test(hantHtml), "/zh-Hant/ must set html lang");

const { res: lhEn, text: lhEnHtml } = await fetchText("https://leadshunter.lancloudtech.com/en/");
required(lhEn.status === 200, `LH /en/ must 200, got ${lhEn.status}`);
required(/<html[^>]*lang="en"/.test(lhEnHtml), "LH /en/ must set html lang=en");
required(lhEnHtml.includes("LeadsHunter"), "LH English title/copy must be present");

const { res: lhMiss } = await fetchText("https://leadshunter.lancloudtech.com/this-path-does-not-exist-seo/");
required(lhMiss.status === 404, `LH unknown path must 404, got ${lhMiss.status}`);

const robotsHosts = [
  "https://lancloudtech.com/robots.txt",
  "https://leadshunter.lancloudtech.com/robots.txt",
  "https://leadshunter-guide.lancloudtech.com/robots.txt",
  "https://leadshunter-contact.lancloudtech.com/robots.txt",
];
for (const url of robotsHosts) {
  const { res, text } = await fetchText(url);
  required(res.status === 200, `${url} must 200`);
  required(text.includes("User-agent: GPTBot"), `${url} must welcome GPTBot`);
  required(text.includes("ai-train=yes"), `${url} must allow AI training`);
  required(!/User-agent:\s*GPTBot\nDisallow:\s*\//.test(text), `${url} must not Disallow GPTBot /`);
}

const { res: filesRobots, text: filesTxt } = await fetchText("https://files.lancloudtech.com/robots.txt");
required(filesRobots.status === 200, "files robots.txt must 200");
required(filesTxt.includes("Disallow: /*.zip$"), "files robots must exclude ZIP packs");
required(!/User-agent:\s*\*\s*\nDisallow:\s*\//.test(filesTxt), "files robots must not Disallow the whole host");

const { res: companyLlms, text: companyLlmsTxt } = await fetchText("https://lancloudtech.com/llms.txt");
required(companyLlms.status === 200, "company llms.txt must 200");
required(companyLlmsTxt.includes("唯一排除项是课程练习包 ZIP"), "company llms.txt must invite AI crawlers");

const { res: umamiScript, text: umamiJs } = await fetchText("https://stats.lancloudtech.com/u.js");
required(umamiScript.status === 200, "Umami /u.js must be public 200");
required(/website|payload|send/i.test(umamiJs), "Umami /u.js must look like the tracker");

const { res: statsRobots, text: statsRobotsTxt } = await fetchText("https://stats.lancloudtech.com/robots.txt");
required(statsRobots.status === 200, "stats robots.txt must 200");
required(statsRobotsTxt.includes("Disallow: /"), "stats robots.txt must Disallow /");
required((statsRobots.headers.get("x-robots-tag") || "").includes("noindex"), "stats must send X-Robots-Tag noindex");

const { res: home, text: homeHtml } = await fetchText("https://lancloudtech.com/");
required(home.status === 200, "apex home must 200");
required(homeHtml.includes("stats.lancloudtech.com/u.js"), "apex home must embed Umami");
required(homeHtml.includes("d93294b3-1e1c-4127-9289-1fb8bdc42293"), "apex home must use the company Umami id");
required(missingBody.includes("stats.lancloudtech.com/u.js"), "company 404 must embed Umami");

const { res: lhHome, text: lhHtml } = await fetchText("https://leadshunter.lancloudtech.com/");
required(lhHome.status === 200, "LH home must 200");
required(lhHtml.includes("stats.lancloudtech.com/u.js"), "LH home must embed Umami");
required(lhHtml.includes("ee4b1080-73af-42b3-8a8f-b675afd51f0b"), "LH home must use the product Umami id");

const { res: guideHome, text: guideHtml } = await fetchText("https://leadshunter-guide.lancloudtech.com/");
required(guideHome.status === 200, "guide home must 200");
required(guideHtml.includes("stats.lancloudtech.com/u.js"), "guide home must embed Umami");
required(guideHtml.includes("022c8956-5069-4b9f-9141-8b7fa35f603a"), "guide home must use the guide Umami id");

const { res: contactHome, text: contactHtml } = await fetchText("https://leadshunter-contact.lancloudtech.com/");
required(contactHome.status === 200, "contact home must 200");
required(contactHtml.includes("stats.lancloudtech.com/u.js"), "contact home must embed Umami");
required(contactHtml.includes("50d0080c-d9f9-40b4-832b-b1ca8d67b063"), "contact home must use the contact Umami id");

const collect = await fetch("https://stats.lancloudtech.com/api/a", {
  method: "POST",
  redirect: "manual",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://lancloudtech.com",
  },
  body: JSON.stringify({
    type: "event",
    payload: {
      website: "d93294b3-1e1c-4127-9289-1fb8bdc42293",
      hostname: "lancloudtech.com",
      language: "zh-CN",
      referrer: "",
      screen: "1440x900",
      title: "seo-live-check",
      url: "/seo-live-check",
    },
  }),
});
required(collect.status === 200, `Umami /api/a must accept pageviews, got ${collect.status}`);
required((collect.headers.get("access-control-allow-origin") || "") !== "", "Umami /api/a must send CORS");

const { res: consoleRes, text: consoleHtml, location: consoleLocation } = await fetchText(
  "https://stats.lancloudtech.com/",
);
required(consoleRes.status === 200, `Umami console must be reachable without Access, got ${consoleRes.status}`);
required(
  !/cloudflareaccess|cdn-cgi\/access/i.test(`${consoleLocation} ${consoleHtml}`),
  "Umami console must not redirect to Cloudflare Access",
);
const { res: websites } = await fetchText("https://stats.lancloudtech.com/api/websites");
required(websites.status === 401, `Umami /api/websites must be 401 without login, got ${websites.status}`);

const zipUrl =
  "https://files.lancloudtech.com/ai-course/workbuddy-beginner/%E7%AC%AC%E4%B8%80%E8%AF%BE%E7%BB%83%E4%B9%A0%E5%8C%85.zip";
for (const ua of ["GPTBot", "ClaudeBot", "Bytespider"]) {
  const zip = await fetch(zipUrl, {
    redirect: "manual",
    headers: { "User-Agent": ua },
  });
  required(zip.status === 403, `files ZIP must 403 for ${ua}, got ${zip.status}`);
}

required(!companyLlmsTxt.includes("stats.lancloudtech.com"), "llms.txt must not advertise the stats host");

console.log("PASS: live SEO smoke — www/index/leadshunter 301, hard 404, locale HTML, AI-welcome robots, Umami, ZIP UA block.");
