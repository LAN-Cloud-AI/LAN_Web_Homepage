import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const appStoreVisuals = [
  "lh-appstore-hero-overview-v2",
  "lh-appstore-hero-overview-dark-v2",
  "lh-appstore-discovery-dashboard-v2",
  "lh-appstore-discovery-dashboard-dark-v2",
  "lh-appstore-lead-delivery-v2",
  "lh-appstore-lead-delivery-dark-v2",
];

for (const file of [
  "leadshunter/index.html",
  "leadshunter/leadshunter.css",
  "leadshunter/leadshunter.js",
  ...appStoreVisuals.flatMap((asset) => [
    `images/generated/leadshunter-page/${asset}.png`,
    `images/generated/leadshunter-page/${asset}-768.png`,
    `images/generated/leadshunter-page/${asset}.webp`,
    `images/generated/leadshunter-page/${asset}-768.webp`,
  ]),
]) {
  required(exists(file), `Missing LeadsHunter route asset: ${file}`);
}

const productPage = read("leadshunter/index.html");
const productCss = read("leadshunter/leadshunter.css");
const productJs = read("leadshunter/leadshunter.js");
const home = read("index.html");

for (const id of ["top", "capture", "delivery", "plans", "contact"]) {
  required(productPage.includes(`id="${id}"`), `LeadsHunter page is missing #${id}`);
}
required(productPage.includes('<main id="main" tabindex="-1">'), "Skip link destination must receive keyboard focus.");
required(productPage.includes('href="../#contact"'), "The product CTA must link back to the official contact section.");
required(productPage.includes('href="../"'), "The product page must provide a return link to the official website.");
required(productPage.includes('<script>document.documentElement.classList.add("js");</script>'), "The product page must progressively enhance its mobile menu.");
required(productPage.includes('<meta name="theme-color" content="#eef3ff" media="(prefers-color-scheme: light)" />'), "The product page needs a light theme-color meta tag.");
required(productPage.includes('<meta name="theme-color" content="#0a1020" media="(prefers-color-scheme: dark)" />'), "The product page needs a dark theme-color meta tag.");
required(!productPage.includes('<link rel="preload" as="image" href="../images/generated/leadshunter-page/lh-appstore-hero-overview-v2.png"'), "Hero preload must not force a duplicate PNG download.");
required(productPage.includes('imagesrcset="../images/generated/leadshunter-page/lh-appstore-hero-overview-v2-768.webp'), "Hero preload must select a responsive WebP candidate.");
for (const asset of appStoreVisuals) {
  for (const variant of ["-768.webp", ".webp", "-768.png"]) {
    required(productPage.includes(`${asset}${variant}`), `${asset} is missing responsive source ${variant}`);
  }
}
required(!productPage.includes("lh-hero-lead-devices.png"), "The legacy 3:2 hero visual must not remain in the product page.");
required(!productPage.includes("lh-dashboard-laptop.png"), "The legacy 3:2 dashboard visual must not remain in the product page.");
required(!productPage.includes("lh-qualified-lead-delivery.png"), "The legacy 3:2 delivery visual must not remain in the product page.");
required((productPage.match(/media="\(prefers-color-scheme: dark\)"/g) || []).length >= 3, "Every product visual needs a dark-mode picture source.");
const sizeAttributes = [...productPage.matchAll(/\b(?:sizes|imagesizes)="([^"]+)"/g)].map((match) => match[1]);
required(sizeAttributes.every((value) => !/\b(?:52|54|56)vw\b/.test(value)), "Responsive image sizes must cap desktop candidates to the page shell.");
required(sizeAttributes.some((value) => value.includes("432px")), "Portrait App Store visuals must cap their desktop image candidate at 432px.");
required(sizeAttributes.some((value) => value.includes("600px")), "Landscape App Store visuals must cap their desktop image candidate at 600px.");
const portraitVisualSize = "(max-width: 920px) min(27rem, calc(100vw - 2.5rem)), 432px";
const standardVisualSize = "(max-width: 920px) calc(100vw - 2.5rem), 600px";
const pictureBlocks = [...productPage.matchAll(/<picture>([\s\S]*?)<\/picture>/g)].map((match) => match[1]);
const pictureFor = (asset) => pictureBlocks.find((picture) => picture.includes(asset)) || "";
const sourceSizes = (picture) => [...picture.matchAll(/\bsizes="([^"]+)"/g)].map((match) => match[1]);
for (const asset of ["lh-appstore-hero-overview-v2", "lh-appstore-lead-delivery-v2"]) {
  const sizes = sourceSizes(pictureFor(asset));
  required(sizes.length === 4 && sizes.every((value) => value === portraitVisualSize), `${asset} must honor its portrait visual cap.`);
}
const dashboardSizes = sourceSizes(pictureFor("lh-appstore-discovery-dashboard-v2"));
required(dashboardSizes.length === 4 && dashboardSizes.every((value) => value === standardVisualSize), "Dashboard image sizes must match the full mobile shell.");
required(productPage.includes(`imagesizes="${portraitVisualSize}"`), "Hero preload must honor the hero visual's portrait cap.");
required(productCss.includes("@media (max-width: 760px)"), "The product page needs a mobile responsive breakpoint.");
required(productCss.includes(".js .product-nav"), "The mobile menu must retain a no-JavaScript fallback.");
required(productJs.includes("menu-toggle"), "The product page needs an accessible mobile navigation control.");
required(productJs.includes('event.key === "Escape" && nav?.classList.contains("is-menu-open")'), "Escape must only move focus when the mobile menu is open.");
required(productJs.includes("IntersectionObserver"), "The product page needs one-time viewport entry motion without scroll listeners.");
required(productJs.includes("motion-ready"), "Entry motion must progressively enhance only after JavaScript is ready.");
required(productPage.includes('<div class="notification-stack" role="group" aria-label="线索推送示例">'), "Notification examples need a semantic labelled group.");
required(productCss.includes("color-scheme: light dark"), "The product page must expose both light and dark system color schemes.");
required(productCss.includes("@media (prefers-color-scheme: dark)"), "The product page needs a system dark-mode override.");
required(productCss.includes(".appstore-visual-portrait { aspect-ratio: 5 / 8;"), "Portrait App Store visuals need a fixed 5:8 frame.");
required(productCss.includes(".appstore-visual-landscape { aspect-ratio: 16 / 10;"), "Landscape App Store visuals need a fixed 16:10 frame.");
required(!productCss.includes("filter: invert("), "Dark-mode product visuals must use dedicated assets rather than inversion.");
required(productCss.includes(".js.motion-ready .motion-enter"), "Entry motion must remain opt-in and progressively enhanced.");
required(productCss.includes("@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"), "Hover motion must stay off coarse pointer devices.");

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16) / 255);
};
const luminance = (hex) => hexToRgb(hex).map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (foreground, background) => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};
const rule = (selector) => productCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] || "";
const cssValue = (source, property) => source.match(new RegExp(`${property}:\\s*(#[0-9a-fA-F]{6})`))?.[1] || "";
const rootRule = rule(":root");
const rootColor = (name) => rootRule.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1] || "";
const appStoreVisualRule = rule(".appstore-visual");
const appStoreVisualPictureRule = rule(".appstore-visual > picture");
const appStoreVisualHaloRule = rule(".appstore-visual::before");
const deliveryVisualRule = rule(".product-visual-delivery");
const deliveryVisualMobileRule = rule(".delivery-grid .product-visual-delivery");
const copyUnitRule = rule(".copy-unit");
const heroTitleRule = rule("h1");
const sectionTitleRule = rule("h2");
const heroLedeRule = rule(".hero-lede");
const longCopyRule = rule(".story-copy > p, .delivery-copy > p, .handoff-copy > p, .plans-intro > p");
const notificationTitleRule = rule(".notification-card h3");
const notificationBodyRule = rule(".notification-card > span");
const workflowDetailRule = rule(".workflow-list dd");
const plansNoteRule = rule(".plans-intro small");
const planSummaryRule = rule(".plan-summary");
const planItemRule = rule(".plan-card li");
const footerCopyRule = rule(".footer-inner p");
required(appStoreVisualRule.includes("position: relative"), "App Store visuals need a positioned fusion frame.");
required(appStoreVisualPictureRule.includes("border-radius: var(--visual-radius)"), "Product images need a shared rounded image crop.");
required(appStoreVisualPictureRule.includes("overflow: hidden"), "Product image crop needs to preserve its own clean edges.");
required(!/\bbox-shadow\s*:/.test(appStoreVisualPictureRule), "Apple-style product visuals must not add an outer image shadow.");
required(!appStoreVisualHaloRule.includes("filter: blur("), "Apple-style product visuals must not add a blurred outer halo.");
required(!productCss.includes("--visual-frame-shadow"), "Apple-style product visuals must not retain legacy frame-shadow tokens.");
required(deliveryVisualRule.includes("width: min(27rem, 100%)"), "The delivery product image needs a restrained 27rem desktop cap.");
required(deliveryVisualRule.includes("justify-self: center"), "The restrained desktop delivery image must stay centred in its column.");
required(deliveryVisualMobileRule.includes("width: min(20rem, 100%)"), "The delivery product image needs a 20rem mobile cap.");
required(rootRule.includes("word-break: normal"), "Chinese copy needs normal word-breaking as a safe baseline.");
required(rootRule.includes("line-break: strict"), "Chinese copy needs strict punctuation line-breaking.");
required(copyUnitRule.includes("white-space: nowrap"), "Semantic Chinese copy units must stay intact when wrapping.");
required(!productCss.includes("word-break: keep-all"), "Chinese copy must not use keep-all because it can force narrow-screen overflow.");
for (const token of [
  "--leading-display: 1.08",
  "--leading-heading: 1.18",
  "--leading-hero: 1.8",
  "--leading-body: 1.84",
  "--leading-detail: 1.62",
  "--leading-compact: 1.55",
]) {
  required(rootRule.includes(token), `The page needs a semantic leading token: ${token}`);
}
required(heroTitleRule.includes("line-height: var(--leading-display)"), "The hero title needs a calmer display leading.");
required(sectionTitleRule.includes("line-height: var(--leading-heading)"), "Section titles need a calmer heading leading.");
required(heroLedeRule.includes("line-height: var(--leading-hero)"), "Hero supporting copy needs a more comfortable leading.");
required(longCopyRule.includes("line-height: var(--leading-body)"), "Long body copy needs a coordinated leading token.");
required(notificationTitleRule.includes("line-height: var(--leading-detail)"), "Notification titles need a readable multi-line leading.");
required(notificationBodyRule.includes("line-height: var(--leading-detail)"), "Notification body copy needs a readable leading.");
required(workflowDetailRule.includes("line-height: var(--leading-detail)"), "Workflow detail copy needs a readable leading.");
required(plansNoteRule.includes("line-height: var(--leading-detail)"), "Plans note copy needs a readable leading.");
required(planSummaryRule.includes("line-height: var(--leading-detail)"), "Plan summaries need a coordinated leading.");
required(planItemRule.includes("line-height: var(--leading-compact)"), "Plan list items need a compact but readable leading.");
required(footerCopyRule.includes("line-height: var(--leading-detail)"), "Footer copy needs a readable leading when it wraps.");
for (const semanticCopy of [
  '<span class="copy-unit">把公开流量</span>',
  '<span class="copy-unit">销售线索</span>',
  '<span class="copy-unit">飞书消息</span><span class="copy-unit">线索自动推送</span>',
  '<span class="copy-unit">智能获客方案</span>',
  '<span class="copy-unit">高意向线索</span>',
  '<span class="copy-unit">把有价值的</span><span class="copy-unit">客户线索</span>',
  '<span class="copy-unit">把下一条</span><span class="copy-unit">高意向线索</span>',
  '<span class="copy-unit">而是一份可以立刻跟进的</span><span class="copy-unit">客户上下文。</span>',
  '<span class="copy-unit">让正确的人在正确的</span><span class="copy-unit">时点收到提醒。</span>',
]) {
  required(productPage.includes(semanticCopy), `Chinese copy needs a semantic no-break unit: ${semanticCopy}`);
}
const cssColor = (source, property) => {
  const hex = cssValue(source, property);
  if (hex) return hex;
  const token = source.match(new RegExp(`${property}:\\s*var\\((--[\\w-]+)\\)`))?.[1] || "";
  return token ? rootColor(token) : "";
};
const blue = rootColor("--blue");
const page = rootColor("--page");
const eyebrow = rule(".eyebrow");
const notification = rule(".notification-label");
const notificationCopy = rule(".notification-card > span");
const handoffCopy = rule(".handoff-steps > li > span");
const plansHelper = rule(".plans-intro small");
const footerText = rule(".footer-inner p");
const focus = rule("a:focus-visible, button:focus-visible");
const contactBand = rule(".contact-band");
const contactHeading = rule(".contact-band h2");
const eyebrowColor = cssColor(eyebrow, "color") || blue;
const notificationColor = cssColor(notification, "color");
const notificationCopyColor = cssColor(notificationCopy, "color");
const plansHelperColor = cssColor(plansHelper, "color");
const footerColor = cssColor(footerText, "color");
const focusColor = focus.match(/outline:\s*3px solid\s*(#[0-9a-fA-F]{6})/)?.[1]
  || rootColor(focus.match(/outline:\s*3px solid\s*var\((--[\w-]+)\)/)?.[1] || "");
required(contrast(eyebrowColor, cssColor(eyebrow, "background")) >= 4.5, "Eyebrow text needs 4.5:1 contrast.");
required(contrast(notificationColor, cssColor(notification, "background")) >= 4.5, "Notification label text needs 4.5:1 contrast.");
required(contrast(notificationCopyColor, "#ffffff") >= 4.5, "Notification body text needs 4.5:1 contrast on white.");
required(handoffCopy.includes("color: var(--muted)"), "Only the handoff detail column should receive muted copy styling.");
required(contrast(plansHelperColor, page) >= 4.5, "Plans helper text needs 4.5:1 contrast on the page surface.");
required(contrast(footerColor, "#e9effc") >= 4.5, "Footer text needs 4.5:1 contrast.");
required(contrast(blue, "#e9effc") >= 4.5, "Footer link color needs 4.5:1 contrast.");
required(contrast(focusColor, page) >= 3 && contrast(focusColor, "#ffffff") >= 3, "Focus outline needs 3:1 contrast on page and white surfaces.");
required(rootColor("--contact-bg") === "#eaf0ff", "Light mode contact CTA must use a light background.");
required(rootColor("--contact-ink") === "#10131c", "Light mode contact CTA heading must use near-black text.");
required(contactBand.includes("color: var(--contact-ink)"), "Contact CTA must use its semantic text token.");
required(contactHeading.includes("color: var(--contact-ink)"), "Contact CTA heading must explicitly retain the correct theme color.");
required(contrast(rootColor("--contact-ink"), rootColor("--contact-bg")) >= 4.5, "Light contact CTA heading needs 4.5:1 contrast.");

const darkStart = productCss.indexOf("@media (prefers-color-scheme: dark)");
const darkEnd = productCss.indexOf("@media (max-width: 920px)", darkStart);
const darkTheme = productCss.slice(darkStart, darkEnd === -1 ? undefined : darkEnd);
const darkColor = (name) => darkTheme.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1] || "";
const darkPage = darkColor("--page");
const darkSurface = darkColor("--surface");
const darkInk = darkColor("--ink");
const darkMuted = darkColor("--muted");
const darkBlue = darkColor("--blue");
const darkAccent = darkColor("--action");
const darkOnAccent = darkColor("--on-accent");
const darkInverseBg = darkColor("--inverse-bg");
const darkInverseInk = darkColor("--inverse-ink");
const darkFocus = darkColor("--focus");
const darkContactBg = darkColor("--contact-bg");
const darkContactInk = darkColor("--contact-ink");
required(contrast(darkInk, darkPage) >= 4.5, "Dark primary text needs 4.5:1 contrast.");
required(contrast(darkMuted, darkSurface) >= 4.5, "Dark muted text needs 4.5:1 contrast.");
required(contrast(darkBlue, darkPage) >= 4.5, "Dark link color needs 4.5:1 contrast.");
required(contrast(darkOnAccent, darkAccent) >= 4.5, "Dark primary action text needs 4.5:1 contrast.");
required(contrast(darkInverseInk, darkInverseBg) >= 4.5, "Dark inverse controls need 4.5:1 contrast.");
required(contrast(darkFocus, darkPage) >= 3 && contrast(darkFocus, darkSurface) >= 3, "Dark focus outline needs 3:1 contrast.");
required(contrast(darkContactInk, darkContactBg) >= 4.5, "Dark contact CTA heading needs 4.5:1 contrast.");

const homeLeadshunterStart = home.indexOf('<article class="product reveal" id="leadshunter">');
const homeLeadshunterEnd = home.indexOf("</article>", homeLeadshunterStart);
const homeLeadshunter = home.slice(homeLeadshunterStart, homeLeadshunterEnd);
required(homeLeadshunter.includes('href="./leadshunter/"'), "Homepage LeadsHunter card must link to the product page.");
required(home.includes('<a href="./leadshunter/">LeadsHunter</a>'), "Homepage footer must link LeadsHunter to the product page.");

console.log("PASS: LeadsHunter route, assets, responsive shell, conversion CTA, and official-site links are present.");
