# 2026-09-13 双版本预上线记录

本记录覆盖此前「仅在本地运行」阶段的发布状态。用户已要求发布新版、保留旧版默认入口，并修复和发布 LeadsHunter 的系统主题适配。

## 已发布结果

| 站点 | 默认旧版 | 新版入口 | 部署 |
| --- | --- | --- | --- |
| 国内 | https://lancloudtech.com/ | https://lancloudtech.com/preview/ | 阿里云 Nginx，`/var/www/lancloudtech.com` |
| 国际 | https://global.lancloudtech.com/ | https://global.lancloudtech.com/preview/ | Cloudflare Pages，`lan-homepage-global` |
| LeadsHunter | https://leadshunter.lancloudtech.com/ | — | Cloudflare Pages，`leadshunter-webpage` |

公司站发布源码提交为 `bce3dd48ea6485588bf414a3c164a2c496e401ae`，分支 `codex/website-business-redesign`，已推送。国际站生产部署为 `2ee00943-a772-4693-874d-9ecf2adc70e8`，创建于 2026-09-13 06:46:45 UTC（北京时间 14:46:45）；Cloudflare canonical deployment 确认 `main`、`success`、上述提交，自定义域验证为 active。发布命令显式指定 Pages 生产分支；Git 的 main 未合并。

LeadsHunter 主题修复提交为 `8886d0ba667a0f92ef8845c0f54e0a13046ab000`，分支 `codex/leadshunter-system-theme`，已推送；生产部署为 `44eaf504-f082-47e0-a90a-122a7595ebc5`，北京时间 14:45 发布。首次访问跟随系统，支持浅色／深色／跟随系统；已有用户的明确选择继续优先。初始化在首屏绘制前执行，系统变化、跨标签页和存储不可用的情形均已验证。

## 版本与资源

- 旧站公共文件冻结于 `956573d025de564b3bd1294414ba4b312e160eab`，构建前校验全部 57 个源文件的清单哈希。发布前只读比对生产 index.html 与 i18n.js，均与该提交完全一致。
- 构建仅向旧页面注入版本入口、统一事件模块及单个既有 LAN tracker；旧版正文和页面脚本保留。仓库根仍是新版源码，生产根来自 `legacy-site/`，完整新版放到 `dist/preview/`。
- 切换保持当前主机与语言；存在对应页面时保留页面，不存在则回到对应语言首页。访问根路径始终是旧版，不记忆版本选择。
- 新版三语 27 个页面保留标题、摘要、canonical、hreflang、分享元信息、结构化数据和 sitemap；预上线阶段设置 `noindex,follow`。国内旧站索引不变，国际站仍作为地理副本全站 noindex。
- 品牌 Hero 的 PNG、WebP、768/1280 响应式变体已上传 OSS，正式 CDN 全部返回 200。DNS、地理 Worker、微信签名 Worker、课程资源及 Umami 服务未重新部署。
- 国内 Nginx 增加 preview 的 noindex 响应头、三语真实 404 与 index.html 规范跳转，通过配置测试后加载；未修改 stats 虚拟主机。

## 验证

- 国内首页、preview 首页、英文旧版与新版、繁体新版、方案页及两版 sitemap 正常；preview 不存在的路径返回真正的 404，带 noindex。各 HTML 版本正确，LAN tracker 恰好一次。
- 国际站三语 48 个 HTML（旧版 21、新版 27）全部返回 200；版本、主域 canonical、同主机保语言切换、单次 tracker 和共享模块正确。全站 noindex 响应头及 preview meta 生效；旧 robots/sitemap 与冻结文件一致。
- 浏览器实际完成国内旧版 → 新版 → 旧版；本地另完成手机宽度下的中文新版 → 英文新版 → 英文旧版，入口没有遮挡企微按钮、页面没有横向溢出。临时浏览器尺寸已恢复。
- 本地 Hero、产品路由、企微、记账、课程、微信分享、SEO、地区分流、preview 运行时路径、事件规范化、静态资源及预上线验证全部通过，二维码解码与差异空白检查通过。双版本包共 124 个文件，覆盖 621 处按页累计 OSS 图片引用。
- 发布国际站后已重新生成国内普通 `dist/`；本地服务继续运行于 18987 端口，根路径为旧版，`/preview/` 为新版，本地响应移除生产统计脚本。

## Umami 实际入库

两版和两地公司站共用原 ID `d93294b3-1e1c-4127-9289-1fb8bdc42293`；LeadsHunter 保留原 ID `ee4b1080-73af-42b3-8a8f-b675afd51f0b`。未创建新统计站点。

浏览器通过真实点击采集网络请求，并只读查询现有 Umami 数据库，得到以下验收事件（均为 UTC）：

| 时间 | 路径 | 事件 | 参数 |
| --- | --- | --- | --- |
| 06:48:10.890 | `/` | `website_version_switch` | legacy → preview，site_version=legacy，language=zh-Hans |
| 06:48:17.650 | `/preview/` | `website_version_switch` | preview → legacy，site_version=preview，language=zh-Hans |
| 06:48:43.886 | `/preview/` | `inquiry_wecom` | site_version=preview，language=zh-Hans，topic=training |

每次点击只有一个对应事件请求，每次页面导航只有一个自动 PV 请求，均返回 200。数据库中的事件和参数逐项一致。咨询测试仅打开企微名片页面，未发送消息。上述三条是本次上线验收点击，未删除或伪造统计数据。

共享模块只规范标签，不手动重复发送 PV 或点击；仅正式域可收集，保留 Do Not Track。咨询主题采用白名单，邮件正文等不进入自定义事件参数。完整口径见 [website-events.md](website-events.md)。

## 回滚与后续默认切换

国内内容与 Nginx 配置已备份：

- `/var/backups/lancloudtech.com/prelaunch-20260913-0642.tar.gz`
- `/var/backups/lancloudtech.com/nginx-before-prelaunch-20260913.conf`

需要回滚公司站内容时：在源站空临时目录解压并核对备份，再将目录同步回站点（清理此次新增 preview 文件）；恢复备份的站点 Nginx 配置，通过 `nginx -t` 后 reload。不要直接覆盖后遗留新版文件，也不要改动 stats 配置。

国际站上一次生产部署为 `697c498f-470a-4fd4-b9f7-8e05fe33f241`，可在 `lan-homepage-global` 执行生产回滚，随后检查正式域。回滚本次内容不需要改变 DNS、橙灰云或 Worker 绑定。

将新版改为默认需要另一次明确发布：更改双版本组装策略、移除新版临时 noindex、迁移 canonical/sitemap/重定向并重新验证两地与统计。不要直接把源码根目录覆盖当前生产包，也不要仅移除 noindex 就认为默认切换完成。
