# 发布运行手册

最新维护发布：[2026-10-23 移除全站字体说明](font-credit-removal-release-2026-10-23.md)，含本次生产版本、验收与回滚目标。

当前正式源码是 `site/`，来自已批准的“小而美”TDesign V13 改版，导入提交与文件摘要见 `site-source.json`。根目录旧页面、生成器和 `legacy-site/` 仅作历史存档，不参与当前构建。`/preview` 及子路径继续 301 到对应正式根路径，保留路径和查询参数。

2026-09 的发布记录仅供历史追溯：[全量发布](full-launch-release-2026-09-14.md)、[配图与联系区更新](visual-contact-release-2026-09-14.md)、[预上线记录](prelaunch-release-2026-09-13.md)。每次上线必须记录当次真实备份、部署 ID 和验收结果，不得把历史记录默认作为回滚目标。

## 目标

将已验证的官网静态资源发布到：

1. **大陆主域**：阿里云源站 `8.148.22.108`（SSH 别名 `lanxin-official-direct`），Nginx + Let’s Encrypt；Cloudflare **灰云 DNS**，访客直连源站。
2. **海外子域**：`global.lancloudtech.com` → Cloudflare Pages 项目 `lan-homepage-global`（橙云）；仅 `CN` 留主域，**港澳台与其它地区算海外**。

## 架构

- DNS：`lancloudtech.com` / `www` → A `8.148.22.108`，**DNS only（灰云）**
- DNS：`global.lancloudtech.com` → CNAME `lan-homepage-global.pages.dev`，**proxied（橙云）**
- HTTPS：源站 Let’s Encrypt（RSA）；Pages 由 Cloudflare 托管证书
- 源站活动目录：`/var/www/lancloudtech-current` 软链指向 `/var/www/lancloudtech-releases/<release>`；历史旧目录 `/var/www/lancloudtech.com` 保留用于迁移回滚。
- Nginx 配置真相源：[`ops/nginx/lancloudtech.com.conf`](../ops/nginx/lancloudtech.com.conf)；安装 `npm run nginx:apply`（SSH `lanxin-official-direct`）。`www` 301 到 apex；未知路径真 404；`/leadshunter` 301 到线索猎手官网。
- 内容：`scripts/build-production.mjs` 从 `site/` 同时生成国内 `dist/`、海外 `dist-global/` 与静态 CDN 包 `dist-cdn/`。海外 `_headers` 设置 `X-Robots-Tag: noindex, follow`，不发布 legacy 或 preview 副本。
- 国内 CSS / JS / 字体 / 图片，以及既有课程下载包：阿里云 OSS + CDN `img.lancloudtech.com`（Cloudflare **灰云**，不经 CF 代理；见 `docs/oss.md`）
- 海外课程下载包：Cloudflare R2 `files.lancloudtech.com`（橙云，桶 `lan-ai-course`；`npm run dns:files`）
- 分流：前端 [`geo-host.js`](../geo-host.js) + Worker `lan-geo`（`https://geo.lancloudtech.com/`）；微信/爬虫不跳；`?host=cn|global` 可覆盖；地理请求最多 3 秒，失败或超时留在当前站点
- 微信 JS-SDK：Worker `lan-wechat-jssdk` 的专用域 `wechat.lancloudtech.com`（主站仍走 Nginx）
- SEO：主域正常公开页允许索引，国际地理副本 noindex；canonical / hreflang / sitemap 统一指向 apex `https://lancloudtech.com`。404 保持真实状态码和 noindex。
- 共享页面结构：批准的三语 HTML 与 `site/site-shell*` 负责同一导航、页脚、交互和布局，不再运行旧生成器。页脚与汉堡菜单都提供语言、系统 / 白天 / 黑夜选择。
- 主题：`site-theme.js` 使用 `lancloud.theme` 和 Domain=lancloudtech.com 的 `lancloud_theme` cookie；CSS、图片和粒子共享 `html[data-theme]` 与 `lan:theme-change`。LeadsHunter 独立部署时保留相同协议。
- 动效：默认开启，取消全局与 Hero 暂停按钮，保留重播；系统减少动效、节省流量或 WebGL 不可用时自动回退，离屏及后台暂停计算。

## 常规流程

1. 在 `site/` 修改当前设计和三语内容，保留既定字体、Logo、插画、紧凑布局及交互。构建会清除 Demo 浮标/演示域名、恢复国内索引策略并接入既有统计；不会重写产品文案。

   ```bash
   npm run build
   npm run verify:production
   git diff --check
   npm run dev -- --port 18987
   ```

   `build:company`、`seo:sync`、`sitemap` 是当前构建的兼容入口。禁止用旧页面生成器覆盖新设计。先完成三语、深浅主题、320px 起移动端的本地验收。

2. `release-manifest.json` 记录当前内容哈希发布 ID、CDN 前缀和每个静态对象的大小/SHA-256。国内 `dist/` 引用 `https://img.lancloudtech.com/lanxin/webpage/releases/<release>/...`；`dist-cdn/` 包含完整模块图、字体、图片及许可证；海外 `dist-global/` 保留所有同源资源。不要混用不同构建产物，不要手改发布前缀。

3. 首次或 CDN 配置变更时核查配置，再完整上传不可变 CDN 包：

   ```bash
   node scripts/configure-release-cdn.mjs          # 查看计划
   node scripts/configure-release-cdn.mjs --apply  # 仅首次或配置变化时应用
   node scripts/sync-release-cdn.mjs
   ```

   上传器拒绝覆盖摘要不同的已存在 key，写 `release-evidence/cdn-upload.json`。公开 CDN 验证 CSS/JS/字体/图片 200、正确 MIME、`Access-Control-Allow-Origin: *`、压缩和长期缓存；字体与跨域 ES 模块均依赖 CORS。上传完成不等于公开节点已刷新，验证后才切换 HTML。旧发布前缀保留，切换不需要覆盖旧缓存对象。

4. 记录上一版国内活动软链/Nginx 和上一条成功 Pages 生产部署，执行原子国内切换：

   ```bash
   node scripts/deploy-origin.mjs          # 只输出本次发布计划
   node scripts/deploy-origin.mjs --apply  # 分阶段上传、远端校验、备份、原子切换和验活
   npm run deploy:pages                    # 仅重建并发布 dist-global/
   ```

   国内脚本要求本次 CDN 上传已完成。先把 `dist/` 放入新 release 目录，逐文件校验，备份 Nginx 和上一活动目标，原子替换活动软链，通过 `nginx -t` 后重载并本机 HTTPS 验活；配置检查、重载或验活失败时自动恢复上一配置/目标。操作记录写 `release-evidence/origin-deploy.json`。不要对活动目录运行 `rsync --delete`。

   Geo Worker、DNS、R2、证书在职责或配置未变化时不重建。需要时才运行 `deploy:geo-worker`、`dns:global`、`dns:img`、`dns:files`。国内主域及 img 保持灰云，global 仍为 Pages。

5. 用真实域名验收并记录：

   - 国内普通页面允许 index，`robots.txt`、`sitemap.xml`、`llms.txt` 内容正确；没有 Demo 浮标或演示域名。
   - 海外响应头含 `X-Robots-Tag: noindex, follow`，CSS/JS/图片/字体来自 Pages；canonical/hreflang 仍为 apex。
   - 首页、方案、实践、记账、课程、FDE、三天课、企业微信、网站地图，含三语、明暗和移动端。
   - 国内页面引用本次 CDN release；字体、Logo、插画、Three.js 依赖可加载，原图片完整比例和品牌对齐正常。
   - `/preview/`、`/index.html`、`www`、`/leadshunter/` 返回预期重定向；未知根路径与嵌套路径真实 404。
   - 深浅主题/语言切换、Hero 播放/重看/鼠标响应、咨询方向选择、联系方式、两版 LeadsHunter 入口正常。
   - 分享图使用 `/images/generated/tdesign/share/og-*-v4.jpg` 的生产绝对地址，国内 CDN、海外 Pages；微信签名仍签实际文档 URL。
   - 分流、微信 UA、爬虫规则保持既定行为；Umami 单次 PV 和点击实际入库。

## SEO / 网站地图

1. 当前公开路由和静态 SEO 在 `site/` 三语 HTML、`site/sitemap.xml` 与 `site/share-meta*`，另保留 `site/site-seo*` 元数据模块。新增路由必须同步三语、导航、sitemap、llms 和重定向规则。
2. 变更后执行 `npm run build` 与 `npm run verify:production`；不要运行旧生成器或旧根目录 SEO 同步脚本。正文运行时翻译不应重写路由对应的静态 SEO 元信息。
3. 生产需可访问：`/robots.txt`、`/sitemap.xml`、`/sitemap/`；canonical 一律使用 apex `https://lancloudtech.com`。
4. 线索猎手独立官网 `https://leadshunter.lancloudtech.com/` 由 `LH_WebPage` 单独部署；公司站只保留首页产品卡、页脚与网站地图索引，以及 `/leadshunter/` 跳转。
5. 公开站欢迎 AI 抓取与训练：`robots.txt` 写 `ai-train=yes` 并显式 Allow GPTBot / ClaudeBot / Google-Extended / Bytespider 等。`llms.txt` 是给模型的站点大纲。课件 ZIP 仍排除：`npm run files:robots` 把 ZIP-only robots 发到 `files.lancloudtech.com` 与 `img.lancloudtech.com`。橙云 AI Crawl Control 保持 Block 关闭；不要再打开托管 robots。`global.lancloudtech.com` 继续 `noindex`（地理副本，不作为收录源）。
6. 路由调整须在国内 Nginx 与国际发布包同时落地；抽检 `www` / `/index.html` / `/leadshunter/` 与旧 `/preview` 路径均为预期 301，乱路径为真 404，`/en/` 与 `/zh-Hant/` 的 lang / title / hreflang 正确。LeadsHunter 按独立仓库发布流程部署；只有爬虫配置有变更时才运行 `npm run cf:ai-crawlers`。
7. 公开路由变更后推百度普通收录：`npm run seo:baidu`（token 在 `~/.config/lanxin/env/baidu/ziyuan.env`）。新站日配额很小，先推简体：`npm run seo:baidu -- --zh-only`。

## 访问统计（Umami）

- **书签入口**（不要写进官网导航、页脚、sitemap 或 `llms.txt`）：`https://stats.lancloudtech.com`
- 把该 URL 存进 1Password / 浏览器书签。页面上不放「统计」链接。
- 打开后直接进 Umami 自带登录。管理员账号在 `~/.config/lanxin/env/umami/ops.env`（`UMAMI_ADMIN_USERNAME` / `UMAMI_ADMIN_PASSWORD`）。不要把密码写进仓库或聊天。
- 统计域不再套 Cloudflare Access；控制台只靠 Umami 登录。`npm run cf:access-stats` 会清掉 `stats` 上残留的 Access 应用。
- 收集脚本 `/u.js` 与接口 `/api/a` 保持公开。
- 首次或重建：`npm run umami:apply`（源站 Docker + 证书 + 四个 website id）→ `npm run seo:sync` 后按上面顺序发布。
- `dns:stats` 默认橙云指向源站 `8.148.22.108`。签发证书时脚本会先灰云再切回橙云。
- 沿用既有 LAN website ID，不新增站点或重复发送器；正式业务事件使用 `site_version: current`，保留语言与咨询主题字段，版本切换事件退役。具体口径见 [事件说明](website-events.md)。
- 上线抽检：`npm run seo:live`（含 `/u.js` 200、公开页埋点、课件 ZIP 训练 UA 403）。无痕打开页面后核实单次自动 PV；业务点击只产生一次对应事件，并确认 Realtime / 实际入库。

## 微信分享卡片

1. **链接预览卡**：靠各页静态 `og:*` + `itemprop`；抓取器不跑 JS。改封面必须换版本化文件名（当前为 `og-home-v4.jpg`）并更新 `site/` 中 HTML / `share-meta*`，否则微信会强缓存旧图。
2. **微信内自定义分享**：前端 `wechat-share.js` → `GET https://wechat.lancloudtech.com/api/wechat/jssdk?url=...`（见 `workers/wechat-jssdk/`）。
3. 部署签名 Worker（与静态站分开）：

   ```bash
   source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage
   # 首次：写入 ~/.config/lanxin/env/wechat/oa.env，并 wrangler secret put WECHAT_OA_APP_ID / WECHAT_OA_APP_SECRET
   npx wrangler deploy --config workers/wechat-jssdk/wrangler.toml
   ```

4. 公众号后台核实 `lancloudtech.com` 与 `global.lancloudtech.com` 均在 **JS接口安全域名**（使用 www 访问时也需核实对应域）；密钥不得进仓库。未配置密钥时接口返回 `503`，前端静默降级为 OG 预览卡。
5. 真机验收：微信内打开各路由 → ··· → 发送给朋友 / 分享到朋友圈；另把链接发给文件传输助手检查预览卡。

## 缓存策略

国内 HTML 重新验证；所有 CSS、JS、字体、图片等静态资源使用内容哈希发布前缀，整套对象长期缓存、不可变。旧 prefix 保留支持旧文档和回滚。`dist/` 的同源文件用于完整发布和兼容，不要把未指纹基础文件设为永久缓存。

海外 Pages HTML 与 JS/CSS 使用 Pages 默认重新验证策略；`/fonts/*` 是不可变版本化字体长缓存，`/images/*` 采用明确图片缓存。**不要在 Pages 的 `/*` 和资源规则重复写 `Cache-Control`**：Pages 会合并匹配的同名响应头，资源规则并不覆盖通配规则。共享安全响应头和海外 noindex 可放在 `/*`。

变更图片须更新版本或内容哈希文件名；微信分享卡缓存很强，改图时同步静态 OG 和运行时分享元信息。不得只上传 HTML，遗漏模块依赖或字体。

## Cloudflare 角色

- **灰云 DNS only（主域）**：`lancloudtech.com` / `www` → A `8.148.22.108`，`proxied: false`；访客 TLS 直连源站。
- **橙云 Pages（海外）**：`global.lancloudtech.com` → Pages `lan-homepage-global`；`npm run dns:global`。
- **橙云 R2（海外课件）**：`files.lancloudtech.com` → 桶 `lan-ai-course`；`npm run dns:files`。不要把约 39MB 的课件放进 Pages。
- **不要**给 Worker `lan-homepage` 重新绑定正式主域。
- Geo：`lan-geo` 的专用域 `geo.lancloudtech.com`；微信 JS-SDK：`lan-wechat-jssdk` 的专用域 `wechat.lancloudtech.com`；部署保留既有 API 路由，不绑定主页通配。
- DNS 脚本：`source ~/.config/lanxin/bin/load-env.sh project:lan-web-homepage` 后执行 `CF_PROXIED=false node scripts/cf-dns-point-origin.mjs`（主域灰云）、`npm run dns:img`（`img` 灰云直连阿里云 CDN）、`npm run dns:global`（海外子域）或 `npm run dns:files`（海外课件 R2）。新建 Token 用 `CLOUDFLARE_BOOTSTRAP_API_TOKEN`。

## 证书与运维

- 证书目录：`/etc/letsencrypt/live/lancloudtech.com/`
- 续期：`certbot.timer`（系统已启用）；必要时手动 `certbot renew --dry-run`
- Nginx 站点：`/etc/nginx/sites-available/lancloudtech.com`
- 日志：`/var/log/nginx/lancloudtech.*.log`
- 资源机（约 1.6G RAM）：仅跑 Nginx 静态站，不跑 Docker / Node 常驻进程

## 失败处理

- CDN 上传/校验失败：不要切换国内 HTML，核查 release-manifest 和对象摘要，修复后重跑可安全复用已上传一致对象。
- 发布阶段 `rsync` 失败：检查 SSH 别名 `lanxin-official-direct` 与密钥，确认 release 目录权限为 `www-data` 可读；活动软链未切换前原站继续服务。
- HTTPS 异常：`nginx -t` 后 `systemctl reload nginx`；确认安全组放行公网 80/443；灰云下 `curl -IIhttps://lancloudtech.com` 应见 `Server: nginx`。
- 证书续期失败：Let’s Encrypt HTTP-01 需能直连源站 80。查 `/var/log/letsencrypt/letsencrypt.log`。续期保持 `key_type = rsa`，避免再签易触发旧橙云 525 的 ECDSA/YE 链。
- 本机 dig 若出现 `198.18.x` Fake-IP，改用未劫持的公共 DNS、源站上 dig，或 `curl --resolve lancloudtech.com:443:8.148.22.108`。

## 回滚

当前改版的实际部署与回滚目标见 [2026-10-23 正式发布记录](compact-production-release-2026-10-23.md)。

发布前备份国内站点与 Nginx 配置，记录国际站上一条成功生产部署。内容回滚把 `/var/www/lancloudtech-current` 原子切回记录的上一 release，必要时恢复备份 Nginx 并检查重载；首次目录迁移则按备份配置恢复历史目录。再将 Pages 回滚到记录的生产部署；两地正式域复核后完成。旧 CDN prefix 不删除，避免旧文档断资源。实际备份位置、提交和 Pages 部署标识写入对应发布记录；[预上线记录](prelaunch-release-2026-09-13.md) 只说明历史发布，不可直接假定为本次回滚目标。

内容回滚不应改变 DNS、橙灰云或 Worker 绑定，也不应重置 Umami。基础设施迁移是单独的运维任务。
