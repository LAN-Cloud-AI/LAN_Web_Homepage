# LAN Cloud AI 官网 · Agent Guide

这是一个无构建步骤的静态站点。开始前先查看 `git status --short`；工作区可能已有未提交改动，不要重置、覆盖或暂存当前任务无关的文件。

## 站点与路由

- 首页：`/` → `index.html`
- LeadsHunter：`/leadshunter/` → `leadshunter/index.html`
- 云朵记账：`/internal-expense/` → `internal-expense/index.html`
- AI 课程：`/ai-course/` → `ai-course/index.html`；FDE 公开课表 `/ai-course/fde/`；三天定制课 `/ai-course/mvp-3day/`
- 企业微信名片：`/contact/wecom/` → `contact/wecom/index.html`
- 首页逻辑与多语言：`main.js`、`i18n.js`
- LeadsHunter 逻辑：`leadshunter/leadshunter.js`
- 云朵记账逻辑：`internal-expense/internal-expense.js`
- AI 课程逻辑：`ai-course/ai-course.js` + `ai-course/ai-course-i18n.js`（与首页共享 `lancloud.locale`；FDE 课表数据：`ai-course/fde/course-summary.js`）
- AI 课程页提供简体 / 繁體 / 英文，页脚语言切换与首页一致，并共享 `lancloud.locale`。
- 站内资源必须使用相对路径；LeadsHunter 页面使用 `../images/...` 和 `../#contact`。
- LeadsHunter 的公开导航与 CTA 一律指向本项目的 `/leadshunter/` 官网路由；不得以 GitHub 仓库作为公开入口。
- 云朵记账的首页开源卡片与页脚入口一律指向本项目的 `/internal-expense/`；仅产品页可链接公开 GitHub 源码仓库。
- AI 课程的首页「培养」区块与页脚入口一律指向本项目的 `/ai-course/`；公开页仅用课表摘要，不得挂载完整教案或直链课程仓 GitHub。

本地预览：

```bash
python3 -m http.server 18987
```

- 云朵记账：http://127.0.0.1:18987/internal-expense/
- AI 课程：http://127.0.0.1:18987/ai-course/

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
node scripts/verify-wecom-card-route.mjs
node scripts/verify-internal-expense-route.mjs
node scripts/verify-ai-course-route.mjs
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node --check main.js
node --check i18n.js
node --check leadshunter/leadshunter.js
node --check internal-expense/internal-expense.js
node --check ai-course/ai-course.js
node --check ai-course/ai-course-i18n.js
node --check ai-course/fde/course-summary.js
node --check contact/wecom/wecom-card.js
swift scripts/generate-wecom-qr.swift --verify
git diff --check
```

提交前还应手动检查首页、`/leadshunter/`、`/internal-expense/` 与 `/ai-course/` 的桌面、移动端、深色模式和折叠屏，确认没有横向溢出。

## 发布

生产托管为阿里云源站 Nginx（`lanxin-official` → `8.148.22.108`）；Cloudflare 对 `lancloudtech.com` / `www` 开启橙云代理（CDN）。图片走阿里云 OSS 桶 `lan-cloud-webpage`（见 `docs/oss.md` 与 `.cursor/rules/aliyun-oss.mdc`）。

发布前：

```bash
node scripts/oss/cli.mjs sync-website-images
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
rsync -avz --delete dist/ lanxin-official:/var/www/lancloudtech.com/
```

密钥真相源在 `~/.config/lanxin/`（先读 `~/.config/lanxin/AGENTS.md`）；本仓库 `.env` 仅为软链。用 `node scripts/oss/cli.mjs` 操作存储桶；Cloudflare 用 `CLOUDFLARE_API_TOKEN`（日常）/ `CLOUDFLARE_BOOTSTRAP_API_TOKEN`（创建 Token）。不要重新绑定 Worker `lan-homepage` 到正式域名。详见 `docs/release.md`、`docs/oss.md`。
