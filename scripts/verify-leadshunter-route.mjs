import fs from "node:fs";
import path from "node:path";
import { LEADSHUNTER_SITE } from "../site-seo.js";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const official = LEADSHUNTER_SITE;

required(official === "https://leadshunter.lancloudtech.com/", "LEADSHUNTER_SITE must be the dedicated official origin.");
required(exists("leadshunter/index.html"), "Legacy /leadshunter/ path must remain as a hop page.");
required(exists("_redirects"), "Cloudflare Pages _redirects must exist for /leadshunter/.");

const home = read("index.html");
const hop = read("leadshunter/index.html");
const redirects = read("_redirects");
const sitemapHub = read("sitemap/index.html");
const siteSeo = read("site-seo.js");
const shareMeta = read("share-meta.js");

const homeLeadshunterStart = home.search(/<article\b[^>]*\bid="leadshunter"[^>]*>/);
const homeLeadshunterEnd = home.indexOf("</article>", homeLeadshunterStart);
const homeLeadshunter = home.slice(homeLeadshunterStart, homeLeadshunterEnd);
required(homeLeadshunterStart >= 0, "Homepage must keep the LeadsHunter product card anchor #leadshunter.");
required(homeLeadshunter.includes(`href="${official}"`), "Homepage LeadsHunter card must link to the dedicated official site.");
required(!homeLeadshunter.includes('href="./leadshunter/"'), "Homepage LeadsHunter card must not keep the retired in-site product page.");
required(!homeLeadshunter.includes("github.com/LAN-Cloud-AI/leadsHunter"), "Homepage LeadsHunter card must not expose the private repository.");
required(!homeLeadshunter.includes("github.com/LAN-Cloud-AI/"), "Homepage LeadsHunter card must only link to the LH official site.");
required(!homeLeadshunter.includes("LH_Training_Ground"), "Homepage LeadsHunter card must not present the training-ground repository.");
const footer = home.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0] || "";
const footerProductLink = [...footer.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
  .map((match) => match[0]).find((anchor) => anchor.includes(`href="${official}"`));
required(footerProductLink?.includes("LeadsHunter"), "Homepage footer must name LeadsHunter and link to its dedicated official site.");
if (footerProductLink?.includes('target="_blank"')) {
  required(footerProductLink.includes("noopener"), "New-tab product links must retain noopener.");
}

required(sitemapHub.includes(`href="${official}"`), "Human sitemap must index the dedicated LeadsHunter official site.");
required(!sitemapHub.includes('href="../leadshunter/"'), "Human sitemap must not list the retired in-site product page as the destination.");

required(hop.includes(`rel="canonical" href="${official}"`), "Legacy hop page canonical must point at the official site.");
required(hop.includes('http-equiv="refresh"'), "Legacy hop page must meta-refresh to the official site.");
required(hop.includes(`location.replace("${official}")`), "Legacy hop page must JS-redirect to the official site.");
required(hop.includes('name="robots" content="noindex,follow"'), "Legacy hop page must stay out of the company-site index.");
required(hop.includes(`href="${official}"`), "Legacy hop page must keep a no-JS link to the official site.");
required(!hop.includes("initWechatShare"), "Legacy hop page must not keep the retired product-page WeChat share wiring.");

required(redirects.includes("/leadshunter"), "_redirects must cover the old /leadshunter path.");
required(redirects.includes(official), "_redirects must send /leadshunter traffic to the official site.");
required(redirects.includes("301"), "_redirects must use a permanent hop.");
required(!/\/\*\s+\/index\.html\s+200/.test(redirects), "Pages _redirects must not soft-404 via SPA catch-all.");

required(siteSeo.includes("LEADSHUNTER_SITE"), "site-seo.js must export the official LeadsHunter origin.");
required(siteSeo.includes(official), "Company Organization sameAs / mentions must include the official LeadsHunter site.");
required(!shareMeta.includes('id: "leadshunter"') && !shareMeta.includes("path: \"/leadshunter/\""), "Retired product page must leave SHARE_BY_ROUTE.");

const openSectionStart = home.search(/<section\b[^>]*\bid="open"[^>]*>/);
const openSectionEnd = home.indexOf("</section>", openSectionStart);
const openSection = home.slice(openSectionStart, openSectionEnd);
required(openSection.includes('href="https://github.com/LAN-Cloud-AI/LH_Training_Ground"'), "Open-source section must link to the public training ground.");

console.log("PASS: LeadsHunter official site is the public product destination; /leadshunter/ only hops.");
