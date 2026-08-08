import fs from "node:fs";
import path from "node:path";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const scenes = [
  "cloud-ledger-appstore-overview-v1",
  "cloud-ledger-appstore-overview-dark-v1",
  "cloud-ledger-subscription-dashboard-v1",
  "cloud-ledger-subscription-dashboard-dark-v1",
  "cloud-ledger-reimbursement-flow-v1",
  "cloud-ledger-reimbursement-flow-dark-v1",
];

const promptSources = scenes.map((scene) => `images/prompts/internal-expense/${scene}.md`);

for (const file of [
  "internal-expense/index.html",
  "internal-expense/internal-expense.css",
  "internal-expense/internal-expense.js",
  ...promptSources,
  ...scenes.flatMap((scene) => [
    `images/generated/cloud-ledger-page/${scene}.png`,
    `images/generated/cloud-ledger-page/${scene}-768.png`,
    `images/generated/cloud-ledger-page/${scene}.webp`,
    `images/generated/cloud-ledger-page/${scene}-768.webp`,
  ]),
]) {
  required(exists(file), `Missing 云朵记账 route asset: ${file}`);
}

const productPage = read("internal-expense/index.html");
const productCss = read("internal-expense/internal-expense.css");
const productJs = read("internal-expense/internal-expense.js");
const home = read("index.html");
const i18n = read("i18n.js");
const catalog = JSON.parse(read("images/prompts/catalog.json"));
const promptIndex = read("images/prompts/INDEX.md");

for (const id of ["top", "subscriptions", "reimbursements", "open-source", "contact"]) {
  required(productPage.includes(`id="${id}"`), `云朵记账页面缺少 #${id}。`);
}

required(productPage.includes("云朵记账"), "云朵记账必须使用已确认的展示名称。");
required(productPage.includes("Internal Expense"), "云朵记账需要保留 Internal Expense 英文辅助名称。");
required(productPage.includes("https://github.com/LAN-Cloud-AI/LAN_Cloud_Internal_Expense"), "产品页必须提供公开 GitHub 源码入口。");
required(productPage.includes("Apache-2.0"), "产品页必须说明 Apache-2.0 开源许可。");
required(!productPage.includes("ie-oa.lancloudtech.com"), "公开产品页不得泄露受登录保护的产品实例地址。");
required(productPage.includes('<a class="skip-link" href="#main">'), "页面需要键盘跳过链接。");
required(productPage.includes('<main id="main" tabindex="-1">'), "跳过链接目标必须可获得键盘焦点。");
required(productPage.includes('href="../"'), "产品页必须提供返回兰芯云朵官网的链接。");
required(productPage.includes('<script>document.documentElement.classList.add("js");</script>'), "移动菜单必须渐进增强。");
required(productPage.includes('<meta name="theme-color" content="#eef3ff" media="(prefers-color-scheme: light)" />'), "页面需要浅色 theme-color。");
required(productPage.includes('<meta name="theme-color" content="#0a1020" media="(prefers-color-scheme: dark)" />'), "页面需要深色 theme-color。");
required(!productPage.includes(`rel="preload" as="image" href="${OSS_IMAGES_BASE}/generated/cloud-ledger-page/cloud-ledger-appstore-overview-v1.png"`), "Hero 预加载不得强制重复下载 PNG。");
required(productPage.includes(`imagesrcset="${OSS_IMAGES_BASE}/generated/cloud-ledger-page/cloud-ledger-appstore-overview-v1-768.webp`), "Hero 预加载必须选择响应式 WebP 资源。");
const heroPreloadBlocks = [...productPage.matchAll(/<link\s+rel="preload"[\s\S]*?\/>/g)].map((match) => match[0]);
const lightHeroPreload = heroPreloadBlocks.find((block) => block.includes("cloud-ledger-appstore-overview-v1.webp")) || "";
const darkHeroPreload = heroPreloadBlocks.find((block) => block.includes("cloud-ledger-appstore-overview-dark-v1.webp")) || "";
required(lightHeroPreload.includes('media="(prefers-color-scheme: light)"'), "浅色模式必须只预加载浅色 Hero 图。");
required(darkHeroPreload.includes('media="(prefers-color-scheme: dark)"'), "深色模式必须只预加载深色 Hero 图。");

for (const scene of scenes) {
  for (const variant of ["-768.webp", ".webp", "-768.png"]) {
    required(productPage.includes(`${scene}${variant}`), `${scene} 缺少响应式图片 source：${variant}`);
  }
}

required((productPage.match(/media="\(prefers-color-scheme: dark\)"/g) || []).length >= 3, "每个产品视觉都需要深色模式专用 source。");
const sizeAttributes = [...productPage.matchAll(/\b(?:sizes|imagesizes)="([^"]+)"/g)].map((match) => match[1]);
required(sizeAttributes.every((value) => !/\b(?:52|54|56)vw\b/.test(value)), "响应式图片尺寸不能超出内容容器。");
const portraitVisualSize = "(max-width: 920px) min(27rem, calc(100vw - 2.5rem)), 432px";
const landscapeVisualSize = "(max-width: 920px) calc(100vw - 2.5rem), 600px";
const pictureBlocks = [...productPage.matchAll(/<picture>([\s\S]*?)<\/picture>/g)].map((match) => match[1]);
const pictureFor = (scene) => pictureBlocks.find((picture) => picture.includes(scene)) || "";
const sourceSizes = (picture) => [...picture.matchAll(/\bsizes="([^"]+)"/g)].map((match) => match[1]);
for (const scene of ["cloud-ledger-appstore-overview-v1", "cloud-ledger-reimbursement-flow-v1"]) {
  const sizes = sourceSizes(pictureFor(scene));
  required(sizes.length === 4 && sizes.every((value) => value === portraitVisualSize), `${scene} 必须使用受限的竖版图尺寸。`);
}
const subscriptionSizes = sourceSizes(pictureFor("cloud-ledger-subscription-dashboard-v1"));
required(subscriptionSizes.length === 4 && subscriptionSizes.every((value) => value === landscapeVisualSize), "订阅资产工作台必须使用内容容器宽度。" );
required(productPage.includes(`imagesizes="${portraitVisualSize}"`), "Hero 预加载必须使用竖版图尺寸上限。");

required(productCss.includes("color-scheme: light dark"), "页面必须公开浅色和深色系统配色能力。");
required(productCss.includes("@media (prefers-color-scheme: dark)"), "页面需要深色主题覆盖层。");
required(productCss.includes("@media (max-width: 920px)"), "页面需要平板/折叠屏的单栏断点。");
required(productCss.includes("@media (max-width: 760px)"), "页面需要移动端断点。");
required(productCss.includes("horizontal-viewport-segments: 2"), "页面需要横向折叠屏安全布局规则。");
const foldableRuleStart = productCss.indexOf("@media (horizontal-viewport-segments: 2)");
const foldableRuleEnd = productCss.indexOf("\nhtml.motion-ready", foldableRuleStart);
const foldableRule = productCss.slice(foldableRuleStart, foldableRuleEnd);
required(foldableRule.includes("viewport-segment-right"), "横向折叠屏需要避开铰链与安全区。");
for (const selector of [".hero-grid", ".subscription-grid", ".reimbursement-grid", ".open-grid", ".boundary-grid"]) {
  required(!foldableRule.includes(selector), `620–920px 横向折叠屏不能强制 ${selector} 变为双栏或多栏。`);
}
required(productCss.includes(".js .product-nav"), "移动菜单需要保留无 JavaScript 回退。");
const mobileMenuPanelRule = productCss.match(/\.js \.product-nav\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
required(mobileMenuPanelRule.includes("background: var(--page)"), "打开的移动菜单必须使用实体背景遮蔽底层内容。");
required(mobileMenuPanelRule.includes("backdrop-filter: none"), "打开的移动菜单不应透出底层内容。");
const mobileOpenMenuRule = productCss.match(/\.js \.site-nav\.is-menu-open \.product-nav\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
required(mobileOpenMenuRule.includes("position: static"), "展开的移动菜单必须推开首屏内容，不能裁切首屏文字。");
required(productCss.includes("@media (prefers-reduced-motion: reduce)"), "页面需要减少动效的覆盖层。");
required(productCss.includes("word-break: normal"), "中文需要 normal word-break 基线。");
required(productCss.includes("line-break: strict"), "中文需要严格标点断行。");
required(!productCss.includes("word-break: keep-all"), "中文页面不得使用 keep-all，以免窄屏溢出。");
required(productCss.includes(".copy-unit") && productCss.includes("white-space: nowrap"), "语义中文短语必须防止拆分。");
const heroHeadingRule = productCss.match(/h1\s*\{([\s\S]*?)\n\}/)?.[1] || "";
required(heroHeadingRule.includes("font-size: clamp(2.15rem, 4.1vw, 3.7rem)"), "宽屏 Hero 标题必须限制在所在栏的可读宽度内。");
const wideScreenRule = productCss.match(/@media \(min-width: 1280px\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
required(wideScreenRule.includes("--shell: min(1420px, calc(100% - 6rem))"), "超宽屏需要扩大内容容器，而不是让首屏孤立在窄栏中。");
required(wideScreenRule.includes("font-size: clamp(3rem, 4.1vw, 4.5rem)"), "超宽屏 Hero 标题需要在可读范围内恢复应有的视觉力度。");
const narrowCjkCopyUnitLimit = 16;
const overlongCopyUnits = [...productPage.matchAll(/<span class="copy-unit">([^<]+)<\/span>/g)]
  .map((match) => match[1].replace(/\s/g, ""))
  .filter((text) => [...text].filter((character) => /\p{Script=Han}/u.test(character)).length > narrowCjkCopyUnitLimit);
required(overlongCopyUnits.length === 0, `320px 窄屏中的中文短语不能超过 ${narrowCjkCopyUnitLimit} 个汉字：${overlongCopyUnits.join("、")}`);
for (const token of ["--leading-display: 1.08", "--leading-heading: 1.18", "--leading-hero: 1.8", "--leading-body: 1.84", "--leading-detail: 1.62"]) {
  required(productCss.includes(token), `页面需要协调的行高 token：${token}`);
}
required(productCss.includes(".appstore-visual-portrait { aspect-ratio: 5 / 8;"), "竖版 App Store 图需要固定 5:8 比例。");
required(productCss.includes(".appstore-visual-landscape { aspect-ratio: 16 / 10;"), "横版 App Store 图需要固定 16:10 比例。");
required(!productCss.includes("filter: invert("), "深色模式必须使用专用资产，不能反相图片。");
const visualPictureRule = productCss.match(/\.appstore-visual > picture\s*\{([\s\S]*?)\n\}/)?.[1] || "";
const visualHaloRule = productCss.match(/\.appstore-visual::before\s*\{([\s\S]*?)\n\}/)?.[1] || "";
const visualCaptionRule = productCss.match(/\.appstore-visual figcaption\s*\{([\s\S]*?)\n\}/)?.[1] || "";
required(visualPictureRule.includes("border-radius: var(--visual-radius)"), "产品图需要共享圆角裁切。");
required(visualPictureRule.includes("overflow: hidden"), "产品图圆角裁切必须裁掉溢出部分。");
required(!/\bbox-shadow\s*:/.test(visualPictureRule), "图片本身不能使用外阴影。");
required(!visualHaloRule.includes("filter: blur("), "图片不能使用模糊外光晕。");
required(visualCaptionRule.includes("color: var(--muted)"), "图片说明文字必须满足浅色模式正文对比度。");
const openGridLayoutRules = [...productCss.matchAll(/\.open-grid\s*\{([\s\S]*?)\n\}/g)].map((match) => match[1]);
const openGridLayoutRule = openGridLayoutRules.find((rule) => rule.includes("grid-template-columns")) || "";
required(openGridLayoutRule.includes("grid-template-columns: minmax(0, 1fr)"), "开源区需要让三张数据边界卡片使用完整页面宽度。");
const tabletBoundaryGridRule = productCss.match(/@media \(max-width: 920px\)[\s\S]*?\.boundary-grid\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";
required(tabletBoundaryGridRule.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"), "中等宽度需要将数据边界卡片收为两列，避免文案挤出。");
const contactBandRule = productCss.match(/\.contact-band\s*\{([\s\S]*?)\n\}/)?.[1] || "";
required(contactBandRule.includes("background: var(--contact-bg)"), "浅色模式收尾区必须使用独立的品牌背景，而不是黑色墨色背景。");
required(productCss.includes("--contact-bg: #eaf0ff"), "浅色模式收尾区需要使用柔和的品牌浅蓝。");
required(productCss.includes("--contact-primary-bg: var(--blue)"), "浅色模式收尾区的主按钮需要沿用品牌蓝，而不是黑色。");

required(productJs.includes("menu-toggle"), "页面需要可访问的移动菜单控制器。");
required(productJs.includes('event.key === "Escape" && nav?.classList.contains("is-menu-open")'), "Escape 只能在移动菜单打开时移动焦点。");
required(productJs.includes("IntersectionObserver"), "页面需要一次性的视口进场动效。");
required(productJs.includes("motion-ready"), "进场动效必须在 JavaScript 就绪后才启用。");

const openSectionStart = home.indexOf('<section class="section open" id="open">');
const openSectionEnd = home.indexOf("</section>", openSectionStart);
const openSection = home.slice(openSectionStart, openSectionEnd);
required(openSection.includes('href="./internal-expense/"'), "首页开源区必须链接云朵记账产品页。");
required(openSection.includes("<strong>云朵记账</strong>"), "首页开源区必须展示云朵记账名称。");
required(!openSection.includes("github.com/LAN-Cloud-AI/LAN_Cloud_Internal_Expense"), "首页开源卡片应进入产品页，源码链接保留在产品页内。");
required(home.includes('<a href="./internal-expense/">云朵记账</a>'), "首页页脚必须链接云朵记账产品页。");
for (const phrase of ["开源订阅与报销管理", "開源訂閱與報銷管理", "Open-source subscription and reimbursement management"]) {
  required(i18n.includes(phrase), `多语言文件缺少云朵记账描述：${phrase}`);
}

required(promptIndex.includes("云朵记账"), "Prompt 索引必须记录云朵记账资产组。");
required(catalog.count === 87, "Prompt catalog 计数必须更新为 87。");
for (const scene of scenes) {
  const item = catalog.items.find((candidate) => candidate.id === scene);
  required(item, `Prompt catalog 缺少 ${scene}。`);
  required(item.category === "internal-expense", `${scene} 必须归类为 internal-expense。`);
  required(item.output === `images/generated/cloud-ledger-page/${scene}.png`, `${scene} catalog 输出路径不正确。`);
  required(item.source === `images/prompts/internal-expense/${scene}.md`, `${scene} catalog 源文件路径不正确。`);
}

console.log("PASS: 云朵记账 route, anonymous App Store assets, responsive shell, and open-source integration are present.");
