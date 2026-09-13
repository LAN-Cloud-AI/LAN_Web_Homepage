import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";
import { getI18nTable } from "../i18n.js";

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
const styles = read("company.css");
const main = read("company.js");
const card = read("contact/wecom/index.html");
const cardCss = read("contact/wecom/wecom-card.css");
const cardJs = read("contact/wecom/wecom-card.js");
const qrGenerator = read("scripts/generate-wecom-qr.swift");

const contactStart = home.search(/<section\b[^>]*\bid="contact"[^>]*>/);
const contactEnd = home.indexOf("</section>", contactStart);
const contact = home.slice(contactStart, contactEnd);
required(contactStart >= 0, "Homepage must retain its contact section.");
required(/<a\b[^>]*href="\.\/contact\/wecom\/"[^>]*>[\s\S]*?data-i18n="new.wecom"[\s\S]*?<\/a>/.test(contact), "Homepage contact section must expose a labeled link to the local WeCom card.");
required(!home.includes('class="wechat-float"'), "The redesigned homepage must provide WeCom through its contact section without a floating control.");
required(contact.includes('href="mailto:lance@lancloudtech.com'), "Homepage must retain an email channel alongside WeCom.");
required(contact.includes('aria-live="polite"'), "Inquiry choices must announce updated context accessibly.");
for (const topic of ["product", "training", "global", "project"]) {
  required(new RegExp(`<button\\b(?=[^>]*type="button")(?=[^>]*data-inquiry="${topic}")(?=[^>]*aria-pressed="(?:true|false)")[^>]*>`).test(contact), `Inquiry choice ${topic} must be a keyboard-operable button with selection state.`);
}
required(styles.includes(".contact-options"), "Homepage contact channels need responsive layout styling.");
required(main.includes("selectInquiry") && main.includes("email.href"), "Inquiry selection must carry context into the email draft.");
for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
  required(getI18nTable(locale)["new.wecom"], `${locale} needs a translated WeCom contact label.`);
}

required(card.includes('<html lang="zh-CN">'), "WeCom card must declare Chinese page language.");
required(card.includes('href="#main-content"'), "WeCom card must provide a skip link.");
required(card.includes('<main id="main-content" tabindex="-1">'), "WeCom card main content must receive keyboard focus.");
required(card.includes(`src="${OSS_IMAGES_BASE}/contact/wecom-sales-manager-qr.png"`), "WeCom card must use the OSS QR image.");
required(!card.includes("work.weixin.qq.com"), "WeCom card must not offer a direct enterprise-WeChat jump.");
required(!card.includes("打开企业微信"), "WeCom card must not present an external-enterprise-WeChat button.");
required(card.includes('<div class="qr-tile">'), "WeCom QR must be a scan-only image tile, not a link.");
required(qrGenerator.includes(payload), "The local QR generator must retain the exact enterprise-WeChat payload.");
const copyUnits = [...card.matchAll(/<span\b[^>]*class="copy-unit"[^>]*>([^<]*)<\/span>/g)].map((match) => match[1]);
for (const unit of defaultCopyUnits) required(copyUnits.includes(unit), `Default scan copy must keep the phrase “${unit}” intact.`);
for (const unit of wechatCopyUnits) required(copyUnits.includes(unit), `WeChat scan copy must keep the phrase “${unit}” intact.`);
required(/<span\b[^>]*class="copy-line"[^>]*>联系兰芯云朵<\/span>\s*<span\b[^>]*class="copy-line"[^>]*>销售经理<\/span>/.test(card), "Card title must wrap only between semantic Chinese phrases.");
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
