# 兰芯云朵官网 · LAN Cloud AI

兰芯云朵的静态官网，面向汽车零售与售后经营场景；生产托管目标为 [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)。

- 正式域名：https://lancloudtech.com
- 联系邮箱：lance@lancloudtech.com
- 电话：+86-17380566771
- 公司：四川兰芯云朵智能科技有限公司
- GitHub：https://github.com/LAN-Cloud-AI/LAN_Web_Homepage

## 站点与路由

- 首页：`/` → `index.html`
- LeadsHunter 产品页：`/leadshunter/` → `leadshunter/index.html`
- 首页提供简体、繁體与英文，并跟随系统浅色 / 深色模式；宽屏语言切换位于页脚，移动端位于导航菜单。
- 首页 Hero 使用 `brand-hero-precision-atelier` 的桌面与移动响应式背景图；LeadsHunter 使用独立的 App Store 风格浅 / 深色产品图组。

## 本地预览

项目没有构建步骤：

```bash
python3 -m http.server 18987
```

打开：

- http://127.0.0.1:18987/
- http://127.0.0.1:18987/leadshunter/

## 验证

提交前运行：

```bash
node scripts/verify-homepage-hero.mjs
node scripts/verify-homepage-hero.test.mjs
node scripts/verify-homepage-hero-regression.mjs
node scripts/verify-leadshunter-route.mjs
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
npx --yes wrangler@4.114.0 deploy --dry-run --config wrangler.jsonc
node --check main.js
node --check i18n.js
node --check leadshunter/leadshunter.js
git diff --check
```

还应在首页与 `/leadshunter/` 手动检查桌面、320px 起的移动端、折叠屏、浅 / 深色模式与 `prefers-reduced-motion`，确保没有横向溢出。

## 图片与 Prompt

`images/` 保存可追溯的 Prompt、目录索引与生成结果。先阅读 [images/README.md](./images/README.md)、[视觉系统](./images/prompts/00-VISUAL-SYSTEM.md) 和 [Prompt 索引](./images/prompts/INDEX.md)。

面向 AI 协作的项目约束、路由、视觉规则与验证命令见 [AGENTS.md](./AGENTS.md)。

## 发布到 Cloudflare Workers

完整发布与缓存说明见 [docs/release.md](./docs/release.md)。

### 日常发布：Git 连接优先

Cloudflare Workers Build 已连接此仓库的 `main` 分支。完成验证后推送即可触发 `lan-homepage` 的生产构建：

```bash
git push origin main
```

随后在 Cloudflare Dashboard → Workers & Pages → `lan-homepage` → Deployments 中确认状态为 **Success**。如同一提交需要重跑，使用 Dashboard 的 **Retry build**；不要在 Git 自动部署仍在运行时再用 Wrangler 上传同一版本。

### 应急：一次性 CLI 部署

仅在 Git 自动部署没有触发、且已在 Cloudflare Dashboard 确认 Worker 名和生产分支时使用。需要已登录 `wrangler` 或设置 `CLOUDFLARE_API_TOKEN`。先用受版本控制的脚本生成只含生产文件的 `dist/`；`wrangler.jsonc` 只会上传该目录：

```bash
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
npx --yes wrangler@latest deploy
```

图片内容变更时，请使用带版本或内容哈希的新文件名（紧急情况下可使用版本化 URL 参数），并同步更新 HTML 引用。Cloudflare 的定向清缓存只能补充清理边缘缓存，不能覆盖用户浏览器已保存的 `immutable` 本地缓存。
