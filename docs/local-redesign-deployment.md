# 官网业务改版：本地验证与发布衔接

核查日期：2026-09-13。依据当前仓库 `docs/release.md`、构建脚本、Nginx 配置与分流代码；本轮未连接生产服务器、未查询云账号、未读取密钥，也未发布。因此这里确认的是版本库中的部署设计，不代表已核验生产配置无漂移。

## 改版范围

公司定位统一为「汽车行业 AI 产品与企业实战培训」。新增 `/solutions/` 与 `/practice/`，首页、方案与实践页共用 `company.js`、`company.css`、`redesign-copy.js`。公开路由由 `site-seo.js` 统一登记，三种语言合计 9 × 3 = 27 个可索引 URL。

- 新方案页 VECT / TACT 段落使用 `#vect`、`#tact` 锚点；元信息、结构化数据和 `llms.txt` 均链接到这里。
- VECT / TACT 以售后服务方案描述，说明飞书方案已验证、自有 SaaS 筹备或前期建设，不发布自助开通或价格声明。
- 课程页面可免费阅读；具体培训作为付费服务描述。公开课表的 `WebPage.isAccessibleForFree=true` 与培训 `Course.isAccessibleForFree=false` 分开。课程总览页不再被错误描述为一门免费 84 课时课程。
- 新方案、实践页复用已存在的 `og-home-v2.png` 品牌分享图，分享标题、摘要、URL 分页独立。无需为本次改版先生成新的 OG 图片。

## 国内与海外链路

| 内容 | 仓库中的配置 | 本次改版的衔接 |
| --- | --- | --- |
| 中国大陆官网 | `lancloudtech.com`，阿里云 Nginx，主域与 `www` 为 Cloudflare 灰云 DNS；`www` 301 至主域 | 继续发布普通静态目录；新页面不需要 SPA 回退或新的常驻服务 |
| 海外官网，含港澳台 | `global.lancloudtech.com`，Cloudflare Pages 项目 `lan-homepage-global` | 与主域同一内容；Pages 构建加响应头 `X-Robots-Tag: noindex, follow` |
| 官网图片 | 全部区域共用 `img.lancloudtech.com` → 阿里云 OSS/CDN；灰云 | 不存在独立的海外图片 CDN。新品牌图发布前必须先同步 OSS |
| 国内课程资源 | `img.lancloudtech.com/lanxin/webpage/assets/ai-course/...` | 继续由 `course-downloads.js` 按地区选择 |
| 海外课程资源 | `files.lancloudtech.com/ai-course/...` → Cloudflare R2；橙云 | 课程包不进入 Pages 静态目录；GitHub 仅作为同步来源 |
| 地区识别 | `geo-host.js` 调用 `lan-geo` Worker 的 workers.dev 地址 | 只将 `CN` 视为大陆，港澳台与其他地区视为海外；保留路径、查询与锚点 |
| 微信分享 | `wechat-share.js` 调用独立 `lan-wechat-jssdk` Worker | 三个公司页从 `body.dataset.shareRoute` 初始化各自分享信息 |

分流例外继续保留：localhost、微信、企业微信与爬虫不自动跳转；识别失败停留当前主机。`?host=cn` / `?host=global` 可为普通访客指定主机，课程下载也支持该参数。canonical、hreflang、sitemap 和分享 URL 始终指向主域的对应语言页面，海外站仅为地理副本。

## 本地预览与构建

1. 公司页源文件由 `scripts/generate-company-pages.mjs` 生成；该脚本与 `redesign-copy.js` 由本次改版维护者更新。统一运行 `npm run build:company`，先生成公司三页，再同步静态 head、`en/`、`zh-Hant/`、`llms.txt` 与 sitemap；不要手工维护语言产物。仅修改课程源 HTML 时可单独运行 `npm run seo:sync`。
2. `scripts/dev-server.mjs` 用于本地预览。它只在本地响应中把已知图片 CDN 前缀映射至 `/images/`，使尚未上传的 `images/generated/brand/` 素材可预览。源码与生产构建仍保留 CDN 地址；本地图片可见不代表 OSS 已有该文件。
3. `scripts/prepare-worker-assets.mjs` 按排除目录递归拷贝，不采用资源白名单。`company.js`、`company.css`、`redesign-copy.js`、两条新路由及语言目录会自然进入 `dist/`。`scripts/verify-worker-assets.mjs` 增加这些资源与全部 27 条路由的校验，避免生成遗漏。
4. `scripts/`、`docs/`、`workers/`、配置模板、密钥环境文件与本地生成图片不进入 `dist/`。新增生成器和预览服务器不会发布，官网图片继续从 CDN 读取。
5. 海外的 `prepare-pages-assets.mjs` 会重新生成同名 `dist/` 并加入 noindex 头。发布主域时先生成普通静态包；不要把 Pages 头规则误用作主域索引策略。

## 本地验证

SEO 源文件可以在页面整合前独立验证，全部在内存中运行，不生成页面、不调用网络：

```bash
node scripts/verify-seo.mjs --source-only
node scripts/verify-geo-host.mjs
```

完整整合后按顺序执行：

```bash
npm run build:company
npm run seo:verify
node scripts/verify-wechat-share.mjs
node scripts/verify-ai-course-route.mjs
node scripts/verify-geo-host.mjs
node scripts/prepare-worker-assets.mjs
node scripts/verify-worker-assets.mjs
git diff --check
```

本次新增检查覆盖三语言标题、canonical、hreflang、OG/itemprop 图片、JSON-LD 更新、VECT/TACT 成熟度、公开课表与培训收费语义、公司页面分享初始化，以及全部公开路由是否进入静态包。课程总览元信息包含 AI 实战课、企业 MVP 三天定制课、84 课时 FDE 三条路径。源验证不替代整合后产物验证与浏览器检查。

### 最终验证记录：2026-09-13 14:31（北京时间）

- `npm run build:company` 完成；AGENTS 要求的 10 项 Node 行为检查全部通过，覆盖新版 Hero 及负例、LeadsHunter、企微名片、记账、培训、微信分享、SEO 和地区分流。SEO 覆盖 9 条公开路由 × 3 种语言，共 27 个 URL。
- AGENTS 列出的脚本及本轮变更、新增脚本共 30 个 JavaScript 文件通过语法检查；Swift 企微二维码只读解码验证通过，`git diff --check` 通过。
- 国内静态包、海外 Pages 包均通过资源验证：70 个文件、315 处去重后按页累计的 OSS 图片引用。已确认 Pages 包含 `noindex, follow` 响应头，canonical 仍指向主域；内部目录、本地预览服务器及生成图片未进入静态包。最后重新生成并验证国内包，`dist/` 已恢复为不含海外 noindex 头的普通静态包；包含最后一次记账页移动导航 CSS 修复，打包文件与源码逐字节一致。
- 使用 `curl` 只读检查本地首页、方案、实践、培训、英文首页、繁体首页：均为 HTTP 200，带 `no-store`，图片使用本地映射，响应中没有生产统计脚本；点文件、内部脚本、文档及不存在的路由均返回真实 404。源码与生产包仍保留正常统计配置。
- 浏览器复核由页面实施代理完成：首页 390px 中文／320px 英文、方案 320px 中文及桌面深色、实践 320px 英文、记账 320px 及桌面深色均无横向溢出；课程三语由培训页代理复核。已修复方案装饰图溢出与记账导航窄屏重叠；英文切换、繁体课程咨询返回首页并预选培训、邮件主题更新均已实际操作验证。临时浏览器仿真设置已清除。

共享翻译只更新页面正文，静态语言路由负责标题和元信息；记账与企微通过 `locale-boot.js` 初始化各自分享。本轮没有 push、上传素材或部署；本地图片可预览并不代表 CDN 已有新图，浏览器验证也不替代正式域及微信真机发布验收。

## 后续发布时的衔接

当前任务只准备本地结果。用户另行要求发布时，按 `docs/release.md` 完成以下步骤：

1. 核对实际引用的新品牌图片与响应式变体，先同步 OSS；课程下载包仅在内容发生变更时同步至 OSS 与 R2。
2. 从同一提交生成主域静态包并验证，再同步到国内源站。
3. 生成带 noindex 头的 Pages 包，再发布海外 Pages。此次无需改 DNS、地理 Worker、微信签名 Worker 或正式域名绑定。
4. 抽检主域三语首页、`/solutions/`、`/practice/`、课程、联系页及 sitemap；确认 HTTPS 200、canonical 指向主域对应语言、未知路径返回真实 404、LeadsHunter 跳转仍正常。
5. 抽检海外新页面带 noindex 响应头、分流仍保留新页面路径、国内/海外课程下载命中各自域名、新品牌图片在 CDN 可用。最后用微信真机确认三个公司页的分享标题、摘要和各自 URL。

本次未改变 Nginx 或 Pages 路由机制。旧路径重定向、DNS、证书、地区识别与存储桶策略的生产状态需在真正发布时按运行手册检查，不能以本地静态验证替代。
