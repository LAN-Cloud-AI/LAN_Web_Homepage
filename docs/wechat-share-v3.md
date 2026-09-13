# 新版官网微信分享卡片 · v3

2026-09-13。新版九类公开页面、三种语言，共 27 组分享配置。旧版继续默认开放，冻结快照及其 v2 配图不变。

## 配图与文案

九张原图使用内置 image_gen 独立生成，原生 1254 × 1254 PNG，统一青绿、瓷白和拉丝金属的静物风格；无文字、Logo 或模拟真实客户数据。逐张检查后保留原图，仅导出 600 × 600 JPEG 供分享，单张 32,755–59,032 字节。三语共用无字画面，文字由页面标题与摘要承载。

完整提示词见 [Prompt 索引](../images/prompts/INDEX.md#微信--og-分享卡)，清单与 Markdown 原文逐字对应；PNG 和 JPEG 都保存在 `images/generated/share/`。导出使用 macOS `sips -Z 600 -s format jpeg -s formatOptions 82 <原图> --out <同名.jpg>`，不裁切或重新绘制。

| 新版路径 | 分享图主题 | JPEG |
| --- | --- | --- |
| `/preview/` | 从业务到行动的桥梁 | [首页](../images/generated/share/og-home-v3.jpg) |
| `/preview/solutions/` | 获客、关系与协同连接 | [产品方案](../images/generated/share/og-solutions-v3.jpg) |
| `/preview/practice/` | 从部件到完整交付 | [业务实践](../images/generated/share/og-practice-v3.jpg) |
| `/preview/internal-expense/` | 清晰可追溯的账本 | [云朵记账](../images/generated/share/og-internal-expense-v3.jpg) |
| `/preview/ai-course/` | 从学习走向实践 | [AI 培训](../images/generated/share/og-ai-course-v3.jpg) |
| `/preview/ai-course/fde/` | 三阶段能力进阶 | [FDE 课表](../images/generated/share/og-ai-course-fde-v3.jpg) |
| `/preview/ai-course/mvp-3day/` | 从模块到工具原型 | [三天 MVP](../images/generated/share/og-ai-course-mvp-3day-v3.jpg) |
| `/preview/contact/wecom/` | 开始一次交流 | [联系兰芯](../images/generated/share/og-wecom-v3.jpg) |
| `/preview/sitemap/` | 找到下一步 | [网站导航](../images/generated/share/og-sitemap-v3.jpg) |

英文在 `/preview/en/`，繁体在 `/preview/zh-Hant/`；国际站使用对应路径。静态分享链接与微信分享链接保持主域、preview 前缀和所选语言。

可用浏览器打开 [可切换语言的卡片预览](wechat-share-cards-v3.html)。这是布局示意，不是微信真机截图。执行 `node scripts/generate-share-card-preview.mjs` 可从元信息和已保存 JPEG 重新生成，文件自包含图片，可离线查看。

## 接入与验证

- `share-meta.js` 是短标题、摘要和图片的统一来源；九类路由均有独立图片，网站地图也初始化微信 JS-SDK。
- 27 个静态页面同步 OG、itemprop、Twitter 与 JSON-LD；OG 图片根标签始终在 secure_url/type/width/height/alt 属性之前且连续输出，符合 [OGP 结构化属性顺序](https://ogp.me/#array)。
- 新版保持 noindex；原 Umami ID、单次加载与版本切换行为不变。
- JS-SDK 加载和配置有超时、重试与并发保护；只在微信环境加载，签名取实际 URL 的完整查询参数并去除 hash。自定义分享被 SDK 拒绝时不误报成功。
- 运行时与 Worker 13 项测试、九张图片尺寸/文件预算、27 组源 HTML 与 27 组 preview 产物检查通过；现有产品、课程、SEO、分流、统计及二维码检查通过。
- CDN 普通浏览器和 MicroMessenger 标识的 GET/HEAD 共 36 次均为 `200 image/jpeg`；18 次下载的 SHA256 与本地 JPEG 完全一致。

## 微信内自定义分享的启用条件

这部分不能用静态元信息检查代替真机验收。按 [腾讯 JS-SDK 文档](https://developers.weixin.qq.com/doc/service/guide/h5/jssdk.html)，需使用具备接口权限的公众号凭据，并核实页面域名的 JS 接口安全域名配置。

本次只读发现：现有 Worker secrets 为空，本机 `~/.config/lanxin/env/wechat/oa.env` 的 `WECHAT_OA_APP_ID` 与 `WECHAT_OA_APP_SECRET` 两项也为空；未生成、重置或猜测凭据。已请求用户仅在本机补齐，不能在聊天、代码或日志中发送密钥。apex/global 的公众号安全域名未获得后台确认。

原 workers.dev 地址从国内源站连接超时，因此新版改为专用入口 `https://wechat.lancloudtech.com/api/wechat/jssdk`，仍由原 Worker `lan-wechat-jssdk` 提供；保留 workers.dev 和既有 apex/www 的 API-only 路由，不绑定主页。专用 `WECHAT_CACHE` KV 已建立，ID `ac31f1dddc104ad59d3233546bc387af`，用于缓存 token/ticket，避免每次请求都换取票据。

在凭据未配置时，签名服务应明确返回 `503 {"error":"not_provisioned"}`。这不影响网页与配图访问，也不能称为微信内自定义分享已成功。

用户补齐既有公众号配置后，通过 stdin 安全同步 Worker Secrets，检查国内和国际 URL 的签名响应；若微信返回 IP 白名单或权限错误，按明确错误处理，不能换用小程序凭据。核实 JS 接口安全域名后，再用微信真机检查朋友卡片与朋友圈图片、标题、链接。不要擅自发送测试消息。

## 本次发布记录

- 网站源码提交：`164a4796e93b7f30fb3a402b19e8d264664a4446`，已推送 `codex/website-business-redesign`，Git main 未合并。
- 国内包已同步到 `/var/www/lancloudtech.com`；发布前备份为 `/var/backups/lancloudtech.com/before-share-v3-20260913.tar.gz`。正式域 27 个新版三语页面已逐项验证图片、标题、摘要、preview 分享地址、noindex 与单次统计加载；默认旧版保留 v2 封面。
- 国际 Pages 已部署：[bfe0fc51.lan-homepage-global.pages.dev](https://bfe0fc51.lan-homepage-global.pages.dev)。需要回滚本轮国际内容时，前一个成功生产部署为 `2ee00943-a772-4693-874d-9ecf2adc70e8`。
- 签名 Worker 版本：`2c53ef03-70ef-45ee-80ef-185d8e9ead97`，新增专用域与 KV，保留原有两条 API 路由。此前 Worker 版本为 `97b7ee7a-bd51-4c5d-b524-07866adbe1d4`。
- 本机与国内源站（MicroMessenger User-Agent）均确认专用域通过 HTTPS 到达 Worker，返回 JSON `503 not_provisioned`。普通 Python 默认 User-Agent 被现有 Cloudflare 浏览器完整性检查以 1010 拒绝；未关闭该安全功能，实际浏览器标识探测可达。
- 最后重新生成了国内普通 `dist/`，本地 18987 服务继续提供旧版根路径和 `/preview/` 新版；卡片总览位于本地 18988，离线版本保存在本目录。未发送任何微信消息，未进行微信真机分享验收。
