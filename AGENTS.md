# LAN Cloud AI 官网 · Agent Guide

开始前先查看 `git status --short`。不要重置或覆盖其他任务的未提交文件。

## 当前设计与唯一构建源（2026-10-23）

用户已批准“小而美”TDesign 改版作为正式官网。**`site/` 是当前唯一公开站点源码**，来自已批准 Sites 项目 `appgprj_6ad9e69c1428819193f3ab915a812253` 的 V13，原始提交和导入文件摘要记录在 `site-source.json`。它是可编辑的三语静态站点，不依赖根目录旧版生成器。

- `npm run build` 和兼容命令 `npm run build:company` 都执行 `scripts/build-production.mjs`。**不得运行旧 `generate-company-pages`、`apply-site-shell`、`generate-locale-pages`、`build-company-motion` 去覆盖当前站点。** 根目录旧 HTML/JS/CSS、旧生成器和 `legacy-site/` 只作历史记录，不进入发布包。
- 修改当前布局、文案和交互应修改 `site/`。已存在不可变文件名需要同步更新其引用，不得以旧内容拼装新页面。共享样式、脚本需覆盖所有三语路由。
- 保留已批准紧凑布局、TDesign 色板、Three.js Hero 动画、播放结束后的鼠标响应、平面流程插画、完整图片比例、慢速联系区粒子与手动咨询方向切换。
- 品牌固定为用户提供的 `site/images/logo/lan-mark-bright.svg` 和 `lan-mark-black.svg`；SVG 字节不可改动。旁边文字使用 HarmonyOS Sans SC，700 字重，中英文两端对齐，并按可见字形与 SVG 图形边缘对齐。官方字体文件及许可证保留。
- 320px 起移动端、浅/深主题、系统减少动效都必须可用。原有业务文案尽可能不改；Global 已上线，官网和应用入口保留。

## 构建与本地验证

```bash
npm run build
npm run verify:production
npm run dev -- --port 18987
git diff --check
```

构建的三份产物均不提交到 Git：

- `dist/`：国内 HTML 和本地静态回退文件；页面静态资源使用 `https://img.lancloudtech.com/lanxin/webpage/releases/<content-hash>/`。
- `dist-cdn/`：国内 CDN 完整静态依赖图。`release-manifest.json` 记录发布前缀、OSS key、SHA-256、文件大小；必须完整上传并验证跨域 JS 和字体 CORS 后才切换 HTML。
- `dist-global/`：海外 Cloudflare Pages 完整站点，CSS、JS、图片、字体均为同源资源。`npm run prepare:pages` 只重建该目录，`npm run deploy:pages` 发布该目录，不覆盖国内包。

本地 `dev` 自动构建并服务 `dist-global/`，读取其中图片、字体与 vendor 文件，不依赖尚未发布的 CDN。只监听本机，去除真实统计脚本。不要向静态源码添加密钥、内部文档或 QA 临时文件。

`verify:production` 验证 demo 清理、生产索引规则、唯一统计脚本、canonical、静态文件/模块依赖完整性、CDN 文件摘要和原始 Logo 保真。部署后还应检查三语、深浅主题、移动端、字体/图片加载、Hero 和联系交互。

## 路由与生产行为

- 首页 `/`；方案 `/solutions/`；实践 `/practice/`；记账 `/internal-expense/`。
- 课程 `/ai-course/`、`/ai-course/fde/`、`/ai-course/mvp-3day/`；企业微信 `/contact/wecom/`；地图 `/sitemap/`。
- 每个主要页面提供 `/en/`、`/zh-Hant/` 对应路由。语言切换保留路径、参数和锚点。
- LeadsHunter 入口 `https://leadshunter.lancloudtech.com/`；旧 `/leadshunter/` 只跳转。Global 入口 `https://global-leadshunter.lancloudtech.com/`，应用 `https://appstore.lancloudtech.com/app?id=leadshunter-global`。
- 旧 `/preview/` 301 到对应正式根路由，保留路径与查询。404 必须真实返回 404；404 和产品跳转不进入 sitemap。
- 国内 apex `https://lancloudtech.com` 是索引源，canonical/hreflang/sitemap 始终指向 apex。海外地理副本使用主机级 `X-Robots-Tag: noindex, follow`。正式构建清除 Demo 浮标、演示域名和普通页面的 noindex。
- 原 Umami 站点 ID `d93294b3-1e1c-4127-9289-1fb8bdc42293` 保留，只允许公司正式三个域名统计；`site-events.js` 事件标记 `site_version: current`。不要重复 PV 或点击上报。
- 构建时将 `geo-host.js` 的历史端点规范化为专用域 `https://geo.lancloudtech.com/`，请求限时 3 秒，超时留在当前站点；不修改批准的 `site/` 原始导入字节。保留 CN 主域、其他地区 global 的分流，localhost 不跳转。`?host=cn` / `?host=global` 用于显式覆盖。
- 微信 JS-SDK 签名继续使用 `https://wechat.lancloudtech.com/api/wechat/jssdk`，签当前浏览器 URL；分享链接以 apex 为准，图片必须绝对生产 URL。
- 主题偏好 `lancloud.theme` 与共享 cookie `lancloud_theme` 沿用，跨公司主域、国际站、LeadsHunter 保持一致。
- 课程下载维持国内 `img.lancloudtech.com`、海外 `files.lancloudtech.com`，不把私有课程源仓作为公开下载入口。

## 部署边界

国内 `lancloudtech.com` / `www` → 阿里云 Nginx `lanxin-official-direct`（`8.148.22.108`），Cloudflare 灰云。海外 `global.lancloudtech.com` → Cloudflare Pages 项目 `lan-homepage-global`。国内 CDN 为阿里云 OSS 桶 `lan-cloud-webpage` + 灰云 `img.lancloudtech.com`。

发布前遵循 `docs/release.md` 留备份和回滚目标。CDN 使用不可变发布前缀，JS 模块与字体需要 `Access-Control-Allow-Origin: *`，不要修改仍在缓存中的发布对象。先上传并验证所有 CDN 文件，再切换国内 HTML；海外整包发布。配置和秘密真相源为 `~/.config/lanxin/`，先读其 `AGENTS.md`；仓库 `.env` 只能是批准的软链，不输出凭据。

不要重新将旧 Worker `lan-homepage` 绑定到正式域名。国内 Nginx、海外 Pages、地理 Worker、微信 Worker 各自职责不变。构建成功不是部署成功，必须验证真实域名的最终效果。
