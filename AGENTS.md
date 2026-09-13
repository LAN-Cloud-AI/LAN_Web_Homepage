# LAN Cloud AI 官网 · Agent Guide

这是一个生成静态 HTML 的站点，没有前端框架构建依赖。开始前先查看 `git status --short`；工作区可能已有未提交改动，不要重置、覆盖或暂存当前任务无关的文件。

## 站点与路由

- **预上线阶段**：生产与本地预览的 `/`、`/en/`、`/zh-Hant/` 默认提供旧版；完整新版位于 `/preview/`、`/preview/en/`、`/preview/zh-Hant/`。两版有显式切换入口，不按 cookie 自动切换版本。
- 仓库根 HTML / JS / CSS 继续作为新版源码；`legacy-site/` 是固定提交 `956573d025de564b3bd1294414ba4b312e160eab` 的旧站公共文件快照。不要手改快照或绕开清单哈希检查。
- `prepare-worker-assets.mjs` 组装双版本 `dist/`，旧版放根、新版放 `preview/`；生产发布与本地预览都使用该包，不能直接把源码根目录发布为旧站。
- 新版预上线页面保留完整 SEO 元信息，但暂设 `noindex,follow`；旧版主域 canonical / sitemap 继续作为索引源。未来默认切换另行执行。

- 首页：`/` → `index.html`（产品卡 `#leadshunter` 指向独立官网）
- 产品与方案：`/solutions/`；案例与实践：`/practice/`。公司三页由 `scripts/generate-company-pages.mjs` 生成，不直接修改生成的 HTML。
- LeadsHunter：公开入口 `https://leadshunter.lancloudtech.com/`；公司站 `/leadshunter/` 仅 301 / 跳转，不再作为产品页
- 云朵记账：`/internal-expense/` → `internal-expense/index.html`
- AI 课程：`/ai-course/` → `ai-course/index.html`；FDE 公开课表 `/ai-course/fde/`；三天定制课 `/ai-course/mvp-3day/`
- 企业微信名片：`/contact/wecom/` → `contact/wecom/index.html`
- 网站地图：`/sitemap/` → `sitemap/index.html`；机器可读 `sitemap.xml` + `robots.txt`（路由清单见 `site-seo.js`）
- 海外入口：`https://global.lancloudtech.com/`（Cloudflare Pages 项目 `lan-homepage-global`）；仅 `CN` 留主域，港澳台与其它地区由 `geo-host.js` + Worker `lan-geo` 导向 global；canonical / sitemap 仍用 apex
- 公司三页逻辑与视觉：`company.js`、`company.css`；三语文案：`redesign-copy.js`，并入 `i18n.js`。`main.js`、`styles.css` 继续服务尚未迁移的旧页面。
- `npm run build:company` 先生成公司三页，再同步 SEO 和三语静态页面；课程源 HTML 改动仅需 `npm run seo:sync`。运行时共享翻译只更新正文，不覆盖各路由 SEO 元信息。
- 云朵记账逻辑：`internal-expense/internal-expense.js`
- AI 课程逻辑：`ai-course/ai-course.js` + `ai-course/ai-course-i18n.js`（与首页共享 `lancloud.locale`；FDE 课表数据：`ai-course/fde/course-summary.js`）
- AI 课程页提供简体 / 繁體 / 英文，页脚语言切换与首页一致，并共享 `lancloud.locale`。
- 站内资源必须使用相对路径。
- LeadsHunter 的公开导航与 CTA 一律指向独立官网 `https://leadshunter.lancloudtech.com/`；不得以 GitHub 仓库或已退役的 `/leadshunter/` 产品页作为公开入口。
- 云朵记账的首页开源卡片与页脚入口一律指向本项目的 `/internal-expense/`；仅产品页可链接公开 GitHub 源码仓库。
- AI 课程的首页「培养」区块与页脚入口一律指向本项目的 `/ai-course/`；公开页仅用课表摘要，不得挂载完整教案。`/ai-course/` 的学员资源下载除外：国内走 OSS/CDN `img.lancloudtech.com`（Cloudflare **灰云**，直连阿里云），海外走 Cloudflare R2 `files.lancloudtech.com`（橙云）；不得把课程仓 GitHub 当作公开入口。
- 微信分享：每个 HTML 路由有独立 OG / `itemprop` 封面（`images/generated/share/og-*-v2.png`，经 OSS）；清单在 `share-meta.js`，微信内自定义分享在 `wechat-share.js`，签名走 `lan-wechat-jssdk` 的 workers.dev（不要重绑 `lan-homepage`）。公众号密钥放 `~/.config/lanxin/env/wechat/oa.env`（模板见 `.config-templates/wechat-oa.env.example`）。

本地预览（`geo-host.js` 对 localhost 不分流）：

```bash
npm run dev -- --port 18987
```

- 线索猎手跳转：http://127.0.0.1:18987/leadshunter/ → `https://leadshunter.lancloudtech.com/`
- 云朵记账：http://127.0.0.1:18987/internal-expense/
- AI 课程：http://127.0.0.1:18987/ai-course/
- 本地预览将图片 CDN 前缀映射至仓库图片，并移除生产统计脚本；不改源码 CDN 地址，不开放内部目录。新图片本地可见不代表已经上传 OSS。
- 改源码后先 `npm run build:company`，再 `npm run prepare:dist`；本地服务读取 `dist/`。新版预览 URL 为 `http://127.0.0.1:18987/preview/`。
- 强制主域/海外：生产环境加 `?host=cn` / `?host=global`（本机也可用该参数切换 AI 课程资源下载：国内 OSS / 海外 R2）

## 设计与可访问性

- 最高优先级：320px 起的移动端、浅 / 深色模式与 `prefers-reduced-motion`。折叠屏只按视口宽度走响应式，不做左右双开 / `viewport-segments` 分栏。
- 公司三页正文改动必须同步 `redesign-copy.js` 的简体、繁体和英文；不要把同一文案重复写进图片。
- 首页 Hero 图是装饰背景：保留完整 `<picture>` 响应式来源、`fetchpriority="high"`、空 `alt`、`aria-hidden` 与不拦截交互的背景层。
- LeadsHunter 产品图必须保留浅 / 深色 WebP 与 PNG fallback；桌面尺寸上限、圆角裁切和无外阴影是既定视觉约束。
- 中文使用语义短语断行；不要用 `word-break: keep-all` 造成窄屏溢出。
- 对外区分产品成熟度：LeadsHunter 国内运行；Global 受控试点；VECT / TACT 飞书方案已验证、自有 SaaS 筹备。实践展示不虚构客户或收益数字。产品示意图须明确标注，不冒充真实系统截图。

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
node scripts/verify-wechat-share.mjs
node scripts/verify-seo.mjs
node scripts/verify-geo-host.mjs
node scripts/verify-preview-routing.mjs
node scripts/verify-site-analytics.mjs
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node scripts/verify-prelaunch.mjs
node --check main.js
node --check company.js
node --check redesign-copy.js
node --check i18n.js
node --check share-meta.js
node --check site-seo.js
node --check geo-host.js
node --check wechat-share.js
node --check internal-expense/internal-expense.js
node --check ai-course/ai-course.js
node --check ai-course/ai-course-i18n.js
node --check ai-course/course-downloads.js
node --check ai-course/fde/course-summary.js
node --check contact/wecom/wecom-card.js
swift scripts/generate-wecom-qr.swift --verify
git diff --check
```

提交前还应手动检查首页、`/solutions/`、`/practice/`、`/internal-expense/` 与 `/ai-course/` 的桌面、移动端与深色模式，确认没有横向溢出（折叠机按对应宽度断点验收即可）。首页线索猎手入口应打开独立官网。课程咨询通过 `?inquiry=training#contact` 预选培训方向。

## 发布

旧新版共同使用原 LAN Umami ID；`site-events.js` 统一点击名称、版本、语言与咨询方向，不手动重复发送 PV / 点击。详见 `docs/website-events.md`。只对正式公司域收集数据；部署后用真实浏览器和统计入库验证切换事件。

生产双轨：大陆主域 `lancloudtech.com` / `www` → 阿里云源站 Nginx（`lanxin-official` → `8.148.22.108`，Cloudflare **灰云**）；海外（含港澳台）→ `global.lancloudtech.com` Cloudflare Pages。图片存阿里云 OSS 桶 `lan-cloud-webpage`，公开访问走 CDN `https://img.lancloudtech.com`（见 `docs/oss.md` 与 `.cursor/rules/aliyun-oss.mdc`）。微信 JS-SDK 签名走 Worker `https://lan-wechat-jssdk.mingxuan400.workers.dev/api/wechat/jssdk`；地理分流走 `https://lan-geo.mingxuan400.workers.dev/`。

发布前：

```bash
node scripts/oss/cli.mjs sync-website-images
node scripts/oss/cli.mjs sync-ai-course-downloads
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node scripts/verify-geo-host.mjs
rsync -avz --delete dist/ lanxin-official-direct:/var/www/lancloudtech.com/
npm run deploy:pages
```

密钥真相源在 `~/.config/lanxin/`（先读 `~/.config/lanxin/AGENTS.md`）；本仓库 `.env` 仅为软链。用 `node scripts/oss/cli.mjs` 操作存储桶；Cloudflare 用 `CLOUDFLARE_API_TOKEN`（日常）/ `CLOUDFLARE_BOOTSTRAP_API_TOKEN`（创建 Token）。灰云切换：`CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`。`global` DNS：`npm run dns:global`。`img` CDN 灰云：`npm run dns:img`。海外课件 R2：`npm run dns:files`。不要重新绑定 Worker `lan-homepage` 到正式主域。详见 `docs/release.md`、`docs/oss.md`。
