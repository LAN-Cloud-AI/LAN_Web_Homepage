# 兰芯云朵官网 · LAN Cloud AI

兰芯云朵的静态官网，面向汽车行业 AI 产品、售后解决方案与企业实战培训。国内官网由阿里云 Nginx 提供，国际官网由 Cloudflare Pages 提供，使用同一套三语内容。

当前采用预上线双版本：旧版保持默认，新版通过「体验新版」进入 `/preview/`，可随时返回旧版。两版沿用同一个 Umami 站点和统一事件，详见 [事件说明](./docs/website-events.md)。

- 正式域名：https://lancloudtech.com
- 联系邮箱：lance@lancloudtech.com
- 电话：+86-17380566771
- 公司：四川兰芯云朵智能科技有限公司
- GitHub：https://github.com/LAN-Cloud-AI/LAN_Web_Homepage

## 站点与路由

- 首页：`/` → `index.html`（`#leadshunter` 产品卡指向独立官网）
- 产品与方案：`/solutions/`；案例与实践：`/practice/`
- LeadsHunter 官网：`https://leadshunter.lancloudtech.com/`；公司站 `/leadshunter/` 仅跳转
- 云朵记账产品页：`/internal-expense/` → `internal-expense/index.html`
- AI 课程：`/ai-course/` → `ai-course/index.html`；FDE 公开课表 `/ai-course/fde/`；三天定制课 `/ai-course/mvp-3day/`
- 企业微信名片：`/contact/wecom/` → `contact/wecom/index.html`
- 云朵记账的首页开源卡片与页脚入口均指向站内产品页；公开 GitHub 源码链接仅保留在产品页内。
- AI 课程的首页「培养」区块与页脚入口均指向站内 `/ai-course/`；公开页仅呈现课表摘要。
- 首页与 AI 课程页均提供简体、繁體与英文，共享同一语言偏好；语言切换均位于页脚（首页移动端另在导航菜单保留一份）。
- 九类公开页面有各自的方形分享图与三语标题、摘要，包含网站地图。新版微信内分享签名经 `wechat.lancloudtech.com` 上的 Worker `lan-wechat-jssdk`；公众号凭据与真机验收状态见 `docs/wechat-share-v3.md`。
- 首页采用新的 `brand-action-hero-v3` 品牌图片与响应式 WebP，产品插画标注为演示画面。原始生成说明保存在 `images/prompts/brand/brand-action-hero-v3.md`。

## 本地预览

公司三页的内容由生成器维护，多语言内容和 SEO 预先写入 HTML：

```bash
npm run build:company
npm run prepare:dist
npm run dev -- --port 18987
```

打开：

- http://127.0.0.1:18987/
- http://127.0.0.1:18987/preview/
- http://127.0.0.1:18987/preview/solutions/
- http://127.0.0.1:18987/preview/practice/
- http://127.0.0.1:18987/leadshunter/（跳转到线索猎手官网）
- http://127.0.0.1:18987/internal-expense/
- http://127.0.0.1:18987/ai-course/
- http://127.0.0.1:18987/contact/wecom/

本地服务只监听本机。未上传的新图片从仓库读取，生产统计脚本在预览响应中移除；正式 HTML 仍使用 CDN 图片。布局源位于 `scripts/generate-company-pages.mjs`，公司页三语文案位于 `redesign-copy.js`，样式与交互位于 `company.css`、`company.js`。不要手工维护 `en/`、`zh-Hant/` 等语言产物。

仓库根目录保留新版源码；打包时使用 `legacy-site/` 中固定旧版本作为默认站点，把完整新版放入 `dist/preview/`。本地服务读取这个双版本包。新版预上线期间暂不索引，旧版主域的 canonical 与 sitemap 保持不变。

## 验证

提交前运行：

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
node --check wechat-share.js
node --check internal-expense/internal-expense.js
node --check ai-course/ai-course.js
node --check ai-course/fde/course-summary.js
node --check contact/wecom/wecom-card.js
swift scripts/generate-wecom-qr.swift --verify
git diff --check
```

还应在首页、`/internal-expense/` 与 `/ai-course/` 手动检查桌面、320px 起的移动端、折叠屏、浅 / 深色模式与 `prefers-reduced-motion`，确保没有横向溢出。首页线索猎手入口应打开 `https://leadshunter.lancloudtech.com/`。

## 图片与 Prompt

`images/` 保存可追溯的 Prompt、目录索引与生成结果。先阅读 [images/README.md](./images/README.md)、[视觉系统](./images/prompts/00-VISUAL-SYSTEM.md) 和 [Prompt 索引](./images/prompts/INDEX.md)。

面向 AI 协作的项目约束、路由、视觉规则与验证命令见 [AGENTS.md](./AGENTS.md)。

## 国内与国际部署

国内：`lancloudtech.com` / `www` → 阿里云 Nginx；国际（含港澳台）：`global.lancloudtech.com` → Cloudflare Pages 项目 `lan-homepage-global`。国际站是地理副本，使用 `noindex, follow`，canonical 和三语 sitemap 统一指向主域。图片两地共用阿里云 OSS/CDN，课程下载国内用 OSS、海外用 R2。详见 [本次改版与部署衔接](./docs/local-redesign-deployment.md)。

完整发布、证书与回滚说明见 [docs/release.md](./docs/release.md)。OSS 目录与 Agent 操作见 [docs/oss.md](./docs/oss.md)。

生产：访客 → Cloudflare 灰云 DNS → 阿里云 Nginx；图片走 OSS 桶 `lan-cloud-webpage`。日常发布：

```bash
node scripts/oss/cli.mjs sync-website-images
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
rsync -avz --delete dist/ lanxin-official-direct:/var/www/lancloudtech.com/
```

图片变更后务必 `sync-website-images`；优先使用带版本或内容哈希的新文件名。不要把 apex / www 重新绑回 Worker `lan-homepage`。
