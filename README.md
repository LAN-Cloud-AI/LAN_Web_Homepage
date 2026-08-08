# 兰芯云朵官网 · LAN Cloud AI

兰芯云朵的静态官网，面向汽车零售与售后经营场景；生产托管在阿里云源站 Nginx（`8.148.22.108`），Cloudflare 橙云代理（CDN + HTTPS）。

- 正式域名：https://lancloudtech.com
- 联系邮箱：lance@lancloudtech.com
- 电话：+86-17380566771
- 公司：四川兰芯云朵智能科技有限公司
- GitHub：https://github.com/LAN-Cloud-AI/LAN_Web_Homepage

## 站点与路由

- 首页：`/` → `index.html`
- LeadsHunter 产品页：`/leadshunter/` → `leadshunter/index.html`
- 云朵记账产品页：`/internal-expense/` → `internal-expense/index.html`
- AI 课程：`/ai-course/` → `ai-course/index.html`；FDE 公开课表 `/ai-course/fde/`；三天定制课 `/ai-course/mvp-3day/`
- 企业微信名片：`/contact/wecom/` → `contact/wecom/index.html`
- 云朵记账的首页开源卡片与页脚入口均指向站内产品页；公开 GitHub 源码链接仅保留在产品页内。
- AI 课程的首页「培养」区块与页脚入口均指向站内 `/ai-course/`；公开页仅呈现课表摘要。
- 首页与 AI 课程页均提供简体、繁體与英文，共享同一语言偏好；语言切换均位于页脚（首页移动端另在导航菜单保留一份）。
- 每个公开 HTML 路由均有独立微信 / OG 分享封面（`images/generated/share/og-*-v2.png`）；微信内分享经 `/api/wechat/jssdk`（Worker `lan-wechat-jssdk`）。
- 首页 Hero 使用 `brand-hero-precision-atelier` 的桌面与移动响应式背景图；LeadsHunter 使用独立的 App Store 风格浅 / 深色产品图组。

## 本地预览

项目没有构建步骤：

```bash
python3 -m http.server 18987
```

打开：

- http://127.0.0.1:18987/
- http://127.0.0.1:18987/leadshunter/
- http://127.0.0.1:18987/internal-expense/
- http://127.0.0.1:18987/ai-course/
- http://127.0.0.1:18987/contact/wecom/

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
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
node --check main.js
node --check i18n.js
node --check share-meta.js
node --check wechat-share.js
node --check leadshunter/leadshunter.js
node --check internal-expense/internal-expense.js
node --check ai-course/ai-course.js
node --check ai-course/fde/course-summary.js
node --check contact/wecom/wecom-card.js
swift scripts/generate-wecom-qr.swift --verify
git diff --check
```

还应在首页、`/leadshunter/`、`/internal-expense/` 与 `/ai-course/` 手动检查桌面、320px 起的移动端、折叠屏、浅 / 深色模式与 `prefers-reduced-motion`，确保没有横向溢出。

## 图片与 Prompt

`images/` 保存可追溯的 Prompt、目录索引与生成结果。先阅读 [images/README.md](./images/README.md)、[视觉系统](./images/prompts/00-VISUAL-SYSTEM.md) 和 [Prompt 索引](./images/prompts/INDEX.md)。

面向 AI 协作的项目约束、路由、视觉规则与验证命令见 [AGENTS.md](./AGENTS.md)。

## 发布到源站 Nginx + OSS 图片

完整发布、证书与回滚说明见 [docs/release.md](./docs/release.md)。OSS 目录与 Agent 操作见 [docs/oss.md](./docs/oss.md)。

生产：访客 → Cloudflare CDN（橙云）→ 阿里云 Nginx；图片走 OSS 桶 `lan-cloud-webpage`。日常发布：

```bash
node scripts/oss/cli.mjs sync-website-images
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
rsync -avz --delete dist/ lanxin-official:/var/www/lancloudtech.com/
```

图片变更后务必 `sync-website-images`；优先使用带版本或内容哈希的新文件名。不要把 apex / www 重新绑回 Worker `lan-homepage`。
