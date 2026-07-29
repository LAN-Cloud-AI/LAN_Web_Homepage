import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const payload = "https://work.weixin.qq.com/ct/wcde518f3ee4ac1b506616d06dedf1fb6f60";
const defaultCopyUnits = ["我是兰芯云朵销售经理，", "这是我的企业微信，", "请您使用微信扫描二维码", "与我取得联系"];
const wechatCopyUnits = ["我是兰芯云朵销售经理，", "请您长按二维码，", "添加我的企业微信"];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const requiredAssets = [
  "contact/wecom/index.html",
  "contact/wecom/wecom-card.css",
  "contact/wecom/wecom-card.js",
  "images/contact/wecom-sales-manager-qr.png",
  "scripts/generate-wecom-qr.swift",
];

for (const asset of requiredAssets) {
  required(exists(asset), `Missing WeCom card route asset: ${asset}`);
}

const home = read("index.html");
const styles = read("styles.css");
const main = read("main.js");
const i18n = read("i18n.js");
const productPage = read("leadshunter/index.html");
const card = read("contact/wecom/index.html");
const cardCss = read("contact/wecom/wecom-card.css");
const cardJs = read("contact/wecom/wecom-card.js");
const qrGenerator = read("scripts/generate-wecom-qr.swift");

const contactStart = home.indexOf('<section class="section contact" id="contact">');
const contactEnd = home.indexOf("</section>", contactStart);
const contact = home.slice(contactStart, contactEnd);
required(contactStart >= 0, "Homepage must retain its contact section.");
required(contact.includes('class="text-link" href="./contact/wecom/"'), "Homepage contact section must present WeCom as a peer text link.");
required(home.includes('class="wechat-float"'), "Homepage needs a desktop WeCom floating entry.");
required(home.includes('href="./contact/wecom/"'), "Homepage WeCom entry must use the local card route.");
required(!styles.includes(".contact-wecom"), "Homepage contact must not promote WeCom as a separate filled button.");
required(styles.includes(".wechat-float"), "Homepage floating entry needs dedicated styling.");
required(styles.includes("@media (min-width: 1025px) and (hover: hover) and (pointer: fine)"), "Floating entry must stay desktop-only and use a fine pointer media query.");
required(main.includes("is-wechat-float-visible"), "Scroll behavior must control the floating entry state.");
required(main.includes("window.scrollY > 240"), "Floating entry must wait until the visitor has scrolled the page.");
required(main.includes('window.addEventListener("load", onScroll, { once: true });'), "Floating entry must sync after initial deep-link layout.");
required(i18n.includes('"contact.wecom": "添加企业微信"'), "Simplified Chinese needs the WeChat CTA label.");
required(i18n.includes('"contact.wecom": "新增企業微信"'), "Traditional Chinese needs the WeChat CTA label.");
required(i18n.includes('"contact.wecom": "Add Work WeChat"'), "English needs the WeChat CTA label.");
required(productPage.includes('href="../contact/wecom/">添加企业微信</a>'), "LeadsHunter contact actions must link to the official WeChat card.");

required(card.includes('<html lang="zh-CN">'), "WeCom card must declare Chinese page language.");
required(card.includes('href="#main-content"'), "WeCom card must provide a skip link.");
required(card.includes('<main id="main-content" tabindex="-1">'), "WeCom card main content must receive keyboard focus.");
required(card.includes('src="../../images/contact/wecom-sales-manager-qr.png"'), "WeCom card must use the local QR image.");
required(!card.includes("work.weixin.qq.com"), "WeCom card must not offer a direct enterprise-WeChat jump.");
required(!card.includes("打开企业微信"), "WeCom card must not present an external-enterprise-WeChat button.");
required(card.includes('<div class="qr-tile">'), "WeCom QR must be a scan-only image tile, not a link.");
required(qrGenerator.includes(payload), "The local QR generator must retain the exact enterprise-WeChat payload.");
for (const unit of defaultCopyUnits) required(card.includes(`<span class="copy-unit">${unit}</span>`), `Default scan copy must keep the phrase “${unit}” intact.`);
for (const unit of wechatCopyUnits) required(card.includes(`<span class="copy-unit">${unit}</span>`), `WeChat scan copy must keep the phrase “${unit}” intact.`);
required(card.includes('<span class="copy-line">联系兰芯云朵</span><span class="copy-line">销售经理</span>'), "Card title must wrap only between semantic Chinese phrases.");
required(card.includes('href="../../#contact"'), "WeCom card must retain a no-JavaScript return path to the contact section.");
required((card.match(/class="button\b/g) || []).length === 1, "WeCom card must retain only one button.");
required(card.includes('name="theme-color" content="#f5f7fb" media="(prefers-color-scheme: light)"'), "WeCom card needs a light browser theme color.");
required(card.includes('name="theme-color" content="#0d1118" media="(prefers-color-scheme: dark)"'), "WeCom card needs a dark browser theme color.");
required(card.includes("MicroMessenger") && card.includes("wxwork"), "WeCom card must set the in-WeChat state before paint.");
required(cardCss.includes("color-scheme: light dark"), "WeCom card must support system light and dark color schemes.");
required(cardCss.includes("env(safe-area-inset-left"), "WeCom card must respect safe-area insets for foldable and mobile devices.");
required(cardCss.includes(".is-wechat-browser .wechat-copy-default"), "WeCom card CSS must switch to the long-press copy in WeChat.");
required(cardCss.includes(".qr-tile"), "WeCom card must give the QR its own stable tile.");
required(cardCss.includes(".copy-unit") && cardCss.includes(".copy-line") && cardCss.includes("white-space: nowrap"), "WeCom card needs semantic Chinese phrase wrapping.");
required(cardCss.includes("grid-template-columns: 1fr"), "The card return action must occupy its own button row.");
required(!cardCss.includes("filter: invert("), "WeCom QR must not be inverted in dark mode.");
required(cardCss.includes("@media (prefers-reduced-motion: reduce)"), "WeCom card must reduce motion when requested.");
required(cardJs.includes("document.referrer"), "WeCom card return behavior must inspect its referrer.");
required(cardJs.includes("window.history.back"), "WeCom card return behavior must preserve same-origin history navigation.");
required(cardJs.includes("window.location.origin"), "WeCom card must only intercept returns from the same origin.");

const dimensions = execFileSync("sips", ["-g", "hasAlpha", "-g", "pixelWidth", "-g", "pixelHeight", "images/contact/wecom-sales-manager-qr.png"], {
  cwd: root,
  encoding: "utf8",
});
required(/hasAlpha:\s*no/.test(dimensions), "WeCom QR must use an opaque PNG.");
required(/pixelWidth:\s*900/.test(dimensions), "WeCom QR must be 900 pixels wide.");
required(/pixelHeight:\s*900/.test(dimensions), "WeCom QR must be 900 pixels high.");

console.log("WeCom contact card route verification passed.");
