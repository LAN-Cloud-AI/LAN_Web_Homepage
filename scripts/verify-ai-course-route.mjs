import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { OSS_IMAGES_BASE } from "./oss/public-base.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const required = (condition, message) => {
  if (!condition) throw new Error(message);
};

const scenes = [
  "ai-course-hero-path-v1",
  "ai-course-hero-path-dark-v1",
  "ai-course-fde-stages-v1",
  "ai-course-fde-stages-dark-v1",
  "ai-course-mvp-3day-v1",
  "ai-course-mvp-3day-dark-v1",
];

const promptSources = scenes.map((scene) => `images/prompts/ai-course/${scene}.md`);

for (const file of [
  "ai-course/index.html",
  "ai-course/ai-course.css",
  "ai-course/ai-course.js",
  "ai-course/ai-course-i18n.js",
  "ai-course/fde/index.html",
  "ai-course/fde/course-summary.js",
  "ai-course/mvp-3day/index.html",
  "i18n.js",
  ...promptSources,
  ...scenes.flatMap((scene) => [
    `images/generated/ai-course-page/${scene}.png`,
    `images/generated/ai-course-page/${scene}-768.png`,
    `images/generated/ai-course-page/${scene}.webp`,
    `images/generated/ai-course-page/${scene}-768.webp`,
  ]),
]) {
  required(exists(file), `Missing AI course route asset: ${file}`);
}

const hub = read("ai-course/index.html");
const fde = read("ai-course/fde/index.html");
const mvp = read("ai-course/mvp-3day/index.html");
const css = read("ai-course/ai-course.css");
const js = read("ai-course/ai-course.js");
const courseI18n = read("ai-course/ai-course-i18n.js");
const summary = read("ai-course/fde/course-summary.js");
const home = read("index.html");
const i18n = read("i18n.js");
const catalog = JSON.parse(read("images/prompts/catalog.json"));
const promptIndex = read("images/prompts/INDEX.md");

for (const id of ["top", "paths", "principles", "contact"]) {
  required(hub.includes(`id="${id}"`), `课程总览缺少 #${id}。`);
}
for (const id of ["top", "stages", "schedule", "contact"]) {
  required(fde.includes(`id="${id}"`), `FDE 课表页缺少 #${id}。`);
}
for (const id of ["top", "agenda", "principles", "contact"]) {
  required(mvp.includes(`id="${id}"`), `三天定制课页缺少 #${id}。`);
}

required(hub.includes('data-course-page="hub"'), "总览页必须声明 data-course-page。");
required(fde.includes('data-course-page="fde"'), "FDE 页必须声明 data-course-page。");
required(mvp.includes('data-course-page="mvp"'), "三天课页必须声明 data-course-page。");
required(hub.includes('type="module" src="./ai-course.js"'), "总览页必须以 module 加载课程脚本。");
required(fde.includes('type="module" src="../ai-course.js"'), "FDE 页必须以 module 加载课程脚本。");
required(mvp.includes('type="module" src="../ai-course.js"'), "三天课页必须以 module 加载课程脚本。");

for (const page of [hub, fde, mvp]) {
  required(page.includes('class="footer"'), "课程页必须使用与首页一致的 footer。");
  required(page.includes('class="footer-lang"'), "语言切换必须放在 footer。");
  required(page.includes('data-locale="zh-Hans"'), "课程页必须提供简体切换。");
  required(page.includes('data-locale="zh-Hant"'), "课程页必须提供繁体切换。");
  required(page.includes('data-locale="en"'), "课程页必须提供英文切换。");
  required(page.includes('class="lang-switch"'), "课程页必须有语言切换控件。");
  required(!page.includes('id="product-nav"') || !page.slice(page.indexOf('id="product-nav"'), page.indexOf("</nav>", page.indexOf('id="product-nav"'))).includes("lang-switch"), "顶栏导航不得再放语言切换。");
  required(page.includes('data-i18n="footer.company"'), "页脚必须包含公司信息 i18n。");
  required(page.includes("蜀ICP备2026002396号") || page.includes('data-i18n="footer.beian"'), "页脚必须包含备案号。");
  required((page.match(/data-i18n=/g) || []).length >= 12, "课程页必须大量使用 data-i18n。");
}

required(hub.includes('href="./fde/"'), "课程总览必须链到 FDE 子页。");
required(hub.includes('href="./mvp-3day/"'), "课程总览必须链到三天定制课子页。");
required(hub.includes('href="../#contact"') || hub.includes('href="../contact/wecom/"'), "课程总览 CTA 必须指向站内联系。");
required(fde.includes('data-fde-schedule'), "FDE 页必须有课表渲染容器。");
required(summary.includes("FDE_PUBLIC_COURSES_BY_LOCALE"), "公开课表必须按 locale 导出。");
required(summary.includes("getFdePublicCourses"), "公开课表必须提供 getFdePublicCourses。");
required(summary.includes('"zh-Hans"') && summary.includes('"zh-Hant"') && summary.includes('"en"'), "课表必须包含简繁英三语。");
required(!summary.includes("示范细节"), "公开课表不得包含示范细节。");
required(!fde.includes("course-outline"), "公网页不得引用完整教学大纲文件。");
required(mvp.includes('data-i18n="mvp.day1Title"'), "三天课 Day1 标题必须走 i18n。");
required(hub.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-hero-path-v1`), "总览页必须引用 OSS Hero 图。");
required(fde.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-fde-stages-v1`), "FDE 页必须引用 OSS 阶段图。");
required(mvp.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-mvp-3day-v1`), "三天课页必须引用 OSS 闭环图。");
required(!hub.includes("./images/") && !hub.includes("../images/"), "课程页不得使用本地 images/ 相对路径。");
required(!/(?:github\.com\/LAN-Cloud-AI\/LAN_AI_Course_System)/.test(hub + fde + mvp), "公开入口不得直链课程仓 GitHub。");

required(courseI18n.includes('from "../i18n.js"'), "课程 i18n 必须复用首页 locale 存储。");
required(courseI18n.includes("LOCALE_STORAGE_KEY"), "课程 i18n 必须共享 locale storage key。");
required(courseI18n.includes('"zh-Hans"') && courseI18n.includes('"zh-Hant"') && courseI18n.includes("en:"), "课程 i18n 必须包含三语字典。");
for (const phrase of [
  "从 AI 应用到一线 FDE",
  "從 AI 應用到一線 FDE",
  "From AI application to frontline FDE",
  "21 课公开课表",
  "21 課公開課表",
  "21-lesson public schedule",
]) {
  required(courseI18n.includes(phrase), `课程 i18n 缺少文案：${phrase}`);
}

required(css.includes("color-scheme: light dark"), "课程页必须支持浅/深色。");
required(css.includes("@media (prefers-color-scheme: dark)"), "课程页需要深色主题。");
required(css.includes("@media (prefers-reduced-motion: reduce)"), "课程页需要减少动效覆盖。");
required(css.includes("word-break: normal"), "中文需要 normal word-break。");
required(css.includes("line-break: strict"), "中文需要严格标点断行。");
required(!css.includes("word-break: keep-all"), "中文页面不得使用 keep-all。");
required(css.includes(".copy-unit"), "课程页需要 copy-unit 语义断行。");
required(css.includes("@media (max-width: 720px)"), "课程页需要移动端响应式断点。");
required(
  !css.includes("horizontal-viewport-segments") && !css.includes("spanning: single-fold"),
  "课程页不做折叠屏左右双开，只按宽度响应式适配。",
);
required(css.includes(".lang-switch"), "课程页样式必须包含语言切换。");
required(css.includes(".footer-lang"), "课程页样式必须包含页脚语言切换区。");
required(css.includes(".footer-dir"), "课程页样式必须包含首页同构页脚导航。");
required(js.includes("menu-toggle"), "课程页需要移动菜单。");
required(js.includes("IntersectionObserver"), "课程页需要进场动效。");
required(js.includes("renderFdeSchedule"), "共享脚本必须渲染 FDE 课表。");
required(js.includes("applyCourseI18n"), "共享脚本必须应用课程 i18n。");
required(js.includes("getFdePublicCourses"), "共享脚本必须按 locale 读取课表。");

const academyStart = home.indexOf('<section class="section academy" id="academy">');
required(academyStart >= 0, "首页必须新增 #academy 培养区块。");
const academyEnd = home.indexOf("</section>", academyStart);
const academy = home.slice(academyStart, academyEnd);
required(academy.includes('href="./ai-course/"'), "首页培养区块必须链到 /ai-course/。");
required(home.includes('href="#academy"'), "顶栏/页脚必须包含培养锚点。");
required(home.includes('data-i18n="nav.academy"'), "顶栏培养入口必须走 i18n。");
required(home.includes('<a href="./ai-course/">AI 课程</a>'), "首页页脚必须链接 AI 课程总览。");
required(!home.includes("github.com/LAN-Cloud-AI/LAN_AI_Course_System"), "首页不得把课程仓 GitHub 当作公开主入口。");

for (const phrase of [
  "培养",
  "培養",
  "Academy",
  "从 AI 应用到一线 FDE",
  "從 AI 應用到一線 FDE",
  "From AI application to frontline FDE",
  "了解课程体系",
  "了解課程體系",
  "Explore the curriculum",
]) {
  required(i18n.includes(phrase), `多语言文件缺少培养相关文案：${phrase}`);
}

required(promptIndex.includes("AI 课程"), "Prompt 索引必须记录 AI 课程资产组。");
required(catalog.count === 87, "Prompt catalog 计数必须更新为 87。");
for (const scene of scenes) {
  const item = catalog.items.find((candidate) => candidate.id === scene);
  required(item, `Prompt catalog 缺少 ${scene}。`);
  required(item.category === "ai-course", `${scene} 必须归类为 ai-course。`);
  required(item.output === `images/generated/ai-course-page/${scene}.png`, `${scene} catalog 输出路径不正确。`);
  required(item.source === `images/prompts/ai-course/${scene}.md`, `${scene} catalog 源文件路径不正确。`);
}

const summaryModule = await import(pathToFileURL(path.join(root, "ai-course/fde/course-summary.js")).href);
for (const locale of ["zh-Hans", "zh-Hant", "en"]) {
  const courses = summaryModule.getFdePublicCourses(locale);
  required(Array.isArray(courses) && courses.length === 21, `${locale} 课表必须包含 21 课。`);
  required(courses.every((course) => course.title && course.summaryObjectives?.length === 2), `${locale} 每课必须有标题与两条收获。`);
}
required(summaryModule.getFdePublicCourses("zh-Hans")[0].title.includes("基本概念"), "简体课表内容异常。");
required(summaryModule.getFdePublicCourses("zh-Hant")[0].title.includes("基本概念"), "繁体课表内容异常。");
required(summaryModule.getFdePublicCourses("en")[0].title.toLowerCase().includes("agent"), "英文课表内容异常。");

console.log("PASS: AI course routes, trilingual i18n, public curriculum boundary, and assets are present.");
