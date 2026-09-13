# 官网正式版事件

正式新版继续使用既有 LAN Umami website ID：`d93294b3-1e1c-4127-9289-1fb8bdc42293`。大陆与海外副本也保持一致。未创建新站点，未更改 guide、contact 或 LeadsHunter 的 ID。

## 接入

每个页面只注入一次 `analyticsScriptTag("lan")` 和一次 `siteEventsScriptTag("/site-events.js")`。后者是 ES module，会自动初始化；重复调用 `initSiteEvents()` 只刷新已有元素，不重复绑定。普通链接无需逐个手写事件；现有事件标签会规范为下表口径。

全量上线后，所有公司站事件统一标记 `site_version: current`，不再使用 `legacy` 或 `preview` 作为新事件的版本值。语言根据正式 URL 解析为 `zh-Hans`、`zh-Hant` 或 `en`；兼容解析旧 `/preview/en/` 与 `/preview/zh-Hant/` 链接，实际访问由发布层重定向到对应正式路由。无需依赖 body 属性。

`website_version_switch` 已退役。返回旧版和进入预览版的按钮不再提供，也不因为访问重定向链接而制造切换事件；历史 Umami 数据保留。若浏览器仍缓存预上线 HTML，共享模块会在 Umami 捕获点击前清除已退役的切换标签及其 `from_version` / `to_version` 字段。

| 事件 | 行为 | 附加字段 |
| --- | --- | --- |
| `inquiry_email` | 点击邮件入口 | 可选 `topic` |
| `inquiry_wecom` | 打开企业微信名片页 | 可选 `topic` |
| `inquiry_phone` | 点击拨号入口 | — |
| `product_leadshunter` | 打开独立 LeadsHunter 官网或旧跳转页 | — |
| `academy_overview` | 进入首页培训区块、课程总览或子页 | `course_path`：`overview` / `fde` / `mvp-3day` |
| `app_download` | 进入应用分发站 | — |
| `course_download` | 打开课件 / 下载练习包 | `resource`：`textbook` / `practice` |
| `solutions_overview` | 打开产品方案页 | — |

所有事件附带 `site_version` 和 `language`。`topic` 只接受 `product`、`training`、`global`、`project`。旧名称 `hero_academy` 合并为 `academy_overview`，`hero_solutions` 合并为 `solutions_overview`；`contact_email` / `contact_wecom` 合并为 `inquiry_email` / `inquiry_wecom`。

邮件草稿、链接文本、任意查询参数和任意额外 data 字段不会被复制进事件参数。课程页内部的目录 / 跳过导航不会重复记作课程入口。事件表示点击意向，不代表邮件发送成功、企微添加成功、报名或安装完成。

## 单次发送与本地禁发

`site-events.js` 只维护 `data-umami-event` 与允许的事件字段，不调用 `umami.track()`，也不发送 PV。Umami 保持自动 PV。新发布后的点击事件可按 `site_version: current` 筛选；历史预览路径和历史版本字段保持原记录。301 / 302 重定向不加载网页埋点，因此正常访问旧预览链接只在最终正式页面产生自动 PV。

2026-09-13 已只读核对生产 `https://stats.lancloudtech.com/u.js`：它在 **document capture** 捕获点击，并在普通链接的跟踪 Promise 完成后跳转；新窗口 / 修饰键点击保持原行为，请求使用 keepalive。共享规范化监听放在 **window capture**，先于该监听执行，保留真实 anchor 和 href，让 Umami 单独完成事件与导航保护。脚本不会调用 `preventDefault()` 或额外跳转。

LAN tracker 的 `data-domains` 仅允许 `lancloudtech.com`、`www.lancloudtech.com`、`global.lancloudtech.com`；本机与临时预览域不会发送事件或自动 PV。保留 `data-do-not-track="true"`。共享模块在本机仍补齐标签，便于检查，但不成为发送方。

## 验证

运行 `node scripts/verify-site-analytics.mjs`：检查正式版本/语言解析、既有业务事件映射、退役切换标签清理、链接不变、字段白名单、动态咨询主题、重复初始化只绑定一次以及 tracker 域名限制。无需安装依赖，也不会发送统计请求。

上线前由整合流程检查每个 HTML 只含一个 LAN `u.js` 与一个共享 module；浏览器收包检查一个点击只有一个相应事件，以及普通导航只有 Umami 自动产生的 PV。不要在 `company.js` 或旧页面另加手动事件发送。
