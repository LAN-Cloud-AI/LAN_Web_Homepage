# LAN Cloud AI 官网 · Agent Guide

这是一个无构建步骤的静态站点。开始前先查看 `git status --short`；工作区可能已有未提交改动，不要重置、覆盖或暂存当前任务无关的文件。

## 站点与路由

- 首页：`/` → `index.html`
- LeadsHunter：`/leadshunter/` → `leadshunter/index.html`
- 首页逻辑与多语言：`main.js`、`i18n.js`
- LeadsHunter 逻辑：`leadshunter/leadshunter.js`
- 站内资源必须使用相对路径；LeadsHunter 页面使用 `../images/...` 和 `../#contact`。

本地预览：

```bash
python3 -m http.server 18987
```

## 设计与可访问性

- 最高优先级：320px 起的移动端、折叠屏、浅 / 深色模式与 `prefers-reduced-motion`。
- 首页正文改动必须同步 `i18n.js` 的简体、繁体和英文；不要把同一文案重复写进图片。
- 首页 Hero 图是装饰背景：保留完整 `<picture>` 响应式来源、`fetchpriority="high"`、空 `alt`、`aria-hidden` 与不拦截交互的背景层。
- LeadsHunter 产品图必须保留浅 / 深色 WebP 与 PNG fallback；桌面尺寸上限、圆角裁切和无外阴影是既定视觉约束。
- 中文使用语义短语断行；不要用 `word-break: keep-all` 造成窄屏溢出。

## 图片与 Prompt

- 先读 `images/prompts/00-VISUAL-SYSTEM.md` 与 `images/prompts/INDEX.md`。
- Prompt 源文件和 `images/prompts/catalog.json` 必须一致；目录索引记录的是计划，不能把未生成的条目误判为构建失败。
- 只有资产已生成且具备所需响应式变体后，才能在 HTML 中引用。
- 不得把真实客户数据、账号、手机号、车牌、第三方平台标识或 ICP / 公安备案号写入**生成的产品 UI / 示例数据**；网站内容中已确认的公开联系方式可保留。
- 品牌资产使用现行官方 Logo 文件族：站点主标使用 `images/logo/WEB-logo.svg`，favicon / Apple touch 等已存在的官方 PNG 变体可继续使用。
- `scripts/render_mocks.py` 只重渲染既有 mock 资产，不应用于覆盖首页精工 Hero 或 LeadsHunter App Store 图。

## 验证

```bash
node scripts/verify-homepage-hero.mjs
node scripts/verify-homepage-hero.test.mjs
node scripts/verify-homepage-hero-regression.mjs
node scripts/verify-leadshunter-route.mjs
node --check main.js
node --check i18n.js
node --check leadshunter/leadshunter.js
git diff --check
```

提交前还应手动检查首页与 `/leadshunter/` 的桌面、移动端、深色模式和折叠屏，确认没有横向溢出。

## 发布

优先让 Cloudflare Pages 从 GitHub `main` 自动发布；推送后在 Deployments 中确认成功。不要把 Git 自动部署与 `wrangler pages deploy` 混用，除非 Git 部署没有触发或用户明确要求一次性手工发布。发布、缓存与回退步骤见 `docs/release.md`。
