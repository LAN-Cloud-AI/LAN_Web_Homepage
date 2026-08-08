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
  "ai-course/fde/index.html",
  "ai-course/fde/course-summary.js",
  "ai-course/mvp-3day/index.html",
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

required(hub.includes("从 AI 应用到"), "课程总览必须使用确认过的主标题。");
required(hub.includes("一线"), "课程总览必须突出一线 FDE。");
required(hub.includes('href="./fde/"'), "课程总览必须链到 FDE 子页。");
required(hub.includes('href="./mvp-3day/"'), "课程总览必须链到三天定制课子页。");
required(hub.includes('href="../#contact"') || hub.includes('href="../contact/wecom/"'), "课程总览 CTA 必须指向站内联系。");
required(fde.includes("window.FDE_PUBLIC_COURSES") === false, "FDE 页应通过独立 course-summary.js 注入数据。");
required(fde.includes('src="./course-summary.js"'), "FDE 页必须加载公开课表数据。");
required(fde.includes('data-fde-schedule'), "FDE 页必须有课表渲染容器。");
required(summary.includes("window.FDE_PUBLIC_COURSES"), "公开课表数据必须导出 FDE_PUBLIC_COURSES。");
required((summary.match(/number: "/g) || []).length === 21, "公开课表必须包含 21 课。");
required(!summary.includes("示范"), "公开课表不得包含示范细节。");
required(!fde.includes("course-outline"), "公网页不得引用完整教学大纲文件。");
required(mvp.includes("业务场景识别与 AI 任务定义") || mvp.includes("业务场景识别与AI任务定义"), "三天课必须包含 Day1 主题。");
required(mvp.includes("DAY"), "三天课必须呈现 Day 标记。");
required(hub.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-hero-path-v1`), "总览页必须引用 OSS Hero 图。");
required(fde.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-fde-stages-v1`), "FDE 页必须引用 OSS 阶段图。");
required(mvp.includes(`${OSS_IMAGES_BASE}/generated/ai-course-page/ai-course-mvp-3day-v1`), "三天课页必须引用 OSS 闭环图。");
required(!hub.includes("./images/") && !hub.includes("../images/"), "课程页不得使用本地 images/ 相对路径。");
required(!/(?:github\.com\/LAN-Cloud-AI\/LAN_AI_Course_System)/.test(hub + fde + mvp), "公开入口不得直链课程仓 GitHub。");

required(css.includes("color-scheme: light dark"), "课程页必须支持浅/深色。");
required(css.includes("@media (prefers-color-scheme: dark)"), "课程页需要深色主题。");
required(css.includes("@media (prefers-reduced-motion: reduce)"), "课程页需要减少动效覆盖。");
required(css.includes("word-break: normal"), "中文需要 normal word-break。");
required(css.includes("line-break: strict"), "中文需要严格标点断行。");
required(!css.includes("word-break: keep-all"), "中文页面不得使用 keep-all。");
required(css.includes(".copy-unit"), "课程页需要 copy-unit 语义断行。");
required(css.includes("horizontal-viewport-segments: 2"), "课程页需要折叠屏规则。");
required(js.includes("menu-toggle"), "课程页需要移动菜单。");
required(js.includes("IntersectionObserver"), "课程页需要进场动效。");
required(js.includes("renderFdeSchedule"), "共享脚本必须渲染 FDE 课表。");

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
required(catalog.count === 80, "Prompt catalog 计数必须更新为 80。");
for (const scene of scenes) {
  const item = catalog.items.find((candidate) => candidate.id === scene);
  required(item, `Prompt catalog 缺少 ${scene}。`);
  required(item.category === "ai-course", `${scene} 必须归类为 ai-course。`);
  required(item.output === `images/generated/ai-course-page/${scene}.png`, `${scene} catalog 输出路径不正确。`);
  required(item.source === `images/prompts/ai-course/${scene}.md`, `${scene} catalog 源文件路径不正确。`);
}

console.log("PASS: AI course routes, public curriculum boundary, homepage academy, and assets are present.");
