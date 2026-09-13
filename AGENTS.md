# LAN Cloud AI 官网 · Agent Guide

这是一个生成静态 HTML 的站点，没有前端框架构建依赖。开始前先查看 `git status --short`；工作区可能已有未提交改动，不要重置、覆盖或暂存当前任务无关的文件。

## 站点与路由

- **全量发布模式**：新版是唯一公开站点，正式与本地的 `/`、`/en/`、`/zh-Hant/` 直接使用新版内容。页面不再提供旧版入口、返回旧版按钮或暂停动效按钮。
- 仓库根 HTML / JS / CSS 是当前源码；`legacy-site/` 仅为固定提交 `956573d025de564b3bd1294414ba4b312e160eab` 的离线 Git 存档，不复制到发布包。保留历史文件以便审计，不把存档重新作为公开站点。
- `prepare-worker-assets.mjs` 只把当前站点组装到 `dist/` 根目录；生产与本地都读取该包。`/preview` 及其子路径是旧链接兼容入口，301 到对应正式根路由并保留路径与查询参数，不再发布 `dist/preview/`。
- 主域公开页面允许 `index,follow`；国际地理副本仍用 `noindex,follow`。canonical、hreflang 和 sitemap 统一以 apex `https://lancloudtech.com` 为索引源。404 不进入 sitemap，并保持真实 404 状态与 `noindex`。

- 首页：`/` → `index.html`（产品卡 `#leadshunter` 指向独立官网）
- 产品与方案：`/solutions/`；案例与实践：`/practice/`。公司三页由 `scripts/generate-company-pages.mjs` 生成，不直接修改生成的 HTML。
- LeadsHunter：公开入口 `https://leadshunter.lancloudtech.com/`；公司站 `/leadshunter/` 仅 301 / 跳转，不再作为产品页
- 云朵记账：`/internal-expense/` → `internal-expense/index.html`
- AI 课程：`/ai-course/` → `ai-course/index.html`；FDE 公开课表 `/ai-course/fde/`；三天定制课 `/ai-course/mvp-3day/`
- 企业微信名片：`/contact/wecom/` → `contact/wecom/index.html`
- 网站地图：`/sitemap/` → `sitemap/index.html`；机器可读 `sitemap.xml` + `robots.txt`（路由清单见 `site-seo.js`）
- 海外入口：`https://global.lancloudtech.com/`（Cloudflare Pages 项目 `lan-homepage-global`）；仅 `CN` 留主域，港澳台与其它地区由 `geo-host.js` + Worker `lan-geo` 导向 global；canonical / sitemap 仍用 apex
- 公司三页逻辑与视觉：`company.js`、`company.css`；三语文案：`redesign-copy.js`，并入 `i18n.js`。全站头部、页脚与菜单由 `scripts/site-shell.mjs`、`scripts/apply-site-shell.mjs`、`site-shell.js` / `.css` 统一维护；不要为子页另造主导航。菜单顺序、当前页标识和语言路径必须一致。
- 新版动效：风格在 `docs/visual-style-v2.md`，叙事在 `docs/motion-storyboard.md`。首页控制器为 `company-hero-motion.js` / `.css`，ThreeUI 适配场景源为 `scripts/motion/hero-scene.js`；`company-hero-scene.js` 是生成包，勿手改。`npm run build:company` 包含本地依赖打包；单独场景修改可 `npm run build:motion` 后重新 prepare:dist。整页粒子为 `company-particle-fields.js` / `.css`，共同风格为 `company-luminous.css`。`company-motion-preference.js` 必须先于 Hero / fields 初始化，清除历史暂停偏好。动效默认开启，保留重播；系统减少动效、节省流量、WebGL 不可用时自动回退，离屏与后台停止计算。`npm run verify:motion` 验证播放、降级、BFCache、调度和 GPU 清理。
- `npm run build:company` 依次打包动效、生成公司三页、应用统一 site-shell，再同步 SEO、三语静态页与三语粒子 404。课程或共享菜单改动也通过此完整流水线更新。运行时翻译只更新正文；SEO 标题、描述和分享元信息以静态路由生成为唯一来源。
- `site-theme.js` 在首屏绘制前读取 `lancloud.theme`，支持 `system` / `light` / `dark`，默认跟随系统；实际主题写入 `html[data-theme]`。页脚与汉堡菜单都有开关，CSS、picture 和粒子使用同一主题，运行时通过 `lan:theme-change` 同步。`lancloud_theme` cookie（Domain=lancloudtech.com）在公司主域、国际子域和 LeadsHunter 间共享偏好；不要另建互相冲突的主题存储。
- 404 源为 `scripts/generate-notfound.mjs`、`error-page.js` / `.css`，使用共享菜单、页脚与主题；嵌套错误路径不能误激活正常路由菜单。
- 云朵记账逻辑：`internal-expense/internal-expense.js`
- AI 课程逻辑：`ai-course/ai-course.js` + `ai-course/ai-course-i18n.js`（与首页共享 `lancloud.locale`；FDE 课表数据：`ai-course/fde/course-summary.js`）
- 所有公开页提供简体 / 繁體 / 英文，语言切换统一位于页脚和汉堡菜单，共享 `lancloud.locale`，切换时保留当前内容路由、查询参数和锚点。
- 常规页面资源使用相对路径；会承接任意嵌套地址的共享 404 必须使用站点根路径引用，避免错误路径改变资源解析位置。
- LeadsHunter 的公开导航与 CTA 一律指向独立官网 `https://leadshunter.lancloudtech.com/`；不得以 GitHub 仓库或已退役的 `/leadshunter/` 产品页作为公开入口。
- 云朵记账的首页开源卡片与页脚入口一律指向本项目的 `/internal-expense/`；仅产品页可链接公开 GitHub 源码仓库。
- AI 课程的首页「培养」区块与页脚入口一律指向本项目的 `/ai-course/`；公开页仅用课表摘要，不得挂载完整教案。`/ai-course/` 的学员资源下载除外：国内走 OSS/CDN `img.lancloudtech.com`（Cloudflare **灰云**，直连阿里云），海外走 Cloudflare R2 `files.lancloudtech.com`（橙云）；不得把课程仓 GitHub 当作公开入口。
- 微信分享：每个 HTML 路由有独立 OG / `itemprop` 封面（`images/generated/share/og-*-v3.jpg`，经 OSS）；清单在 `share-meta.js`，微信内自定义分享在 `wechat-share.js`，新版签名走 `wechat.lancloudtech.com` 上的 `lan-wechat-jssdk`（不要重绑 `lan-homepage`）。公众号密钥放 `~/.config/lanxin/env/wechat/oa.env`（模板见 `.config-templates/wechat-oa.env.example`）。

本地预览（`geo-host.js` 对 localhost 不分流）：

```bash
npm run dev -- --port 18987
```

- 线索猎手跳转：http://127.0.0.1:18987/leadshunter/ → `https://leadshunter.lancloudtech.com/`
- 云朵记账：http://127.0.0.1:18987/internal-expense/
- AI 课程：http://127.0.0.1:18987/ai-course/
- 本地预览将图片 CDN 前缀映射至仓库图片，并移除生产统计脚本；不改源码 CDN 地址，不开放内部目录。新图片本地可见不代表已经上传 OSS。
- 改源码后先 `npm run build:company`，再 `npm run prepare:dist`；本地服务读取 `dist/`。本地首页为 `http://127.0.0.1:18987/`；旧 `/preview/` 地址会重定向到正式路径。
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
node --test scripts/verify-wechat-runtime.test.mjs scripts/verify-wechat-worker.test.mjs
node scripts/verify-seo.mjs
node scripts/verify-geo-host.mjs
node scripts/verify-preview-routing.mjs
node scripts/verify-site-analytics.mjs
node scripts/verify-site-shell.mjs
node --test scripts/verify-site-theme.test.mjs scripts/verify-notfound.test.mjs
npm run verify:motion
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node scripts/verify-prelaunch.mjs # 历史命名，验证当前单站发布包
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

正式新版沿用原 LAN Umami ID；`site-events.js` 统一业务事件、语言与咨询方向，新事件标记 `site_version: current`，不再产生版本切换事件。不手动重复发送 PV / 点击。详见 `docs/website-events.md`。只对正式公司域收集数据；部署后核实单次 PV、业务点击及实际入库。

生产两地部署：大陆主域 `lancloudtech.com` / `www` → 阿里云源站 Nginx（`lanxin-official-direct` → `8.148.22.108`，Cloudflare **灰云**）；海外（含港澳台）→ `global.lancloudtech.com` Cloudflare Pages。图片存阿里云 OSS 桶 `lan-cloud-webpage`，公开访问走 CDN `https://img.lancloudtech.com`（见 `docs/oss.md` 与 `.cursor/rules/aliyun-oss.mdc`）。微信 JS-SDK 签名走 Worker `https://wechat.lancloudtech.com/api/wechat/jssdk`；地理分流走 `https://lan-geo.mingxuan400.workers.dev/`。

发布前先按 `docs/release.md` 备份并记录回滚目标；构建只生成候选包，不代表已部署。`scripts/fingerprint-assets.mjs` 由打包流程调用，为 JS / CSS 生成统一发布指纹并改写 HTML 与模块依赖；保留无指纹基础文件兼容仍引用稳定文件名的已缓存客户端。不要手改发布指纹或只上传部分依赖。

```bash
npm run build:company
node scripts/oss/cli.mjs sync-website-images
node scripts/oss/cli.mjs sync-ai-course-downloads
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node scripts/verify-geo-host.mjs
rsync -avz --delete dist/ lanxin-official-direct:/var/www/lancloudtech.com/
npm run deploy:pages
```

密钥真相源在 `~/.config/lanxin/`（先读 `~/.config/lanxin/AGENTS.md`）；本仓库 `.env` 仅为软链。用 `node scripts/oss/cli.mjs` 操作存储桶；Cloudflare 用 `CLOUDFLARE_API_TOKEN`（日常）/ `CLOUDFLARE_BOOTSTRAP_API_TOKEN`（创建 Token）。灰云切换：`CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`。`global` DNS：`npm run dns:global`。`img` CDN 灰云：`npm run dns:img`。海外课件 R2：`npm run dns:files`。不要重新绑定 Worker `lan-homepage` 到正式主域。详见 `docs/release.md`、`docs/oss.md`。

### 官网产品界面展示补充（2026-09-13）

公司首页、解决方案和实践页的 LeadsHunter / 云朵记账配图采用无设备外框的完整平面界面；不要重新增加笔记本框、键盘或底座。保留顶部和底部全部内容，避免 cover 裁切或悬停放大。实践卡片文字需有明确四边留白，艺术项目原生插画必须覆盖浅深主题。当前图片和提示词见 `docs/visual-style-v2.md` 最新一节。
