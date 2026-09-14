# 配图与联系区更新发布记录（2026-09-14）

本次按四项页面标注更新公司官网，国内、国际站均已上线，代码与生成资源已推送 GitHub `main` 和 `codex/website-business-redesign`。

## 发布内容

- 线索猎手配图容器去掉旧深色蓝底，浅深主题均延续产品卡片背景。
- 商城首页卡片与实践详情使用新生成的无设备框玉绿平面界面，浅深色各有 PNG / 1536 WebP / 768 WebP，共六个新资源已上传 OSS。首页商城与云朵记账共用相同容器尺寸和慢速轨道粒子。
- 首页、方案和实践三页及三种语言的联系区，企业微信为首位白色主按钮，邮箱为辅助链接。
- 四个交流方向每 2500ms 自动渐变轮播。手动选择和咨询深链接锁定方向；悬停、聚焦、离屏、后台停止计时。减少动效时保持手动选择。轮播只更新展示与联系上下文，不制造点击统计。

## 发布版本与回滚

- 运行代码：`432530fdcb04d628bf0e955d6831a1905d6b428e`。
- JS / CSS 发布指纹：`d20b303bfce3`。
- 国内：静态包同步至 `lanxin-official-direct:/var/www/lancloudtech.com/`；没有修改 Nginx、DNS 或统计服务。
- 国际：Cloudflare Pages `lan-homepage-global` 生产部署 `4dfcf65a-46e8-42ee-a14a-bc796f26abec`，API 确认 success，代码提交与上述一致。
- 国内发布前备份：`lanxin-official-direct:/var/backups/lancloudtech/20260913-162915/`，包含 `site.tar.gz` 与 `nginx.conf`。
- 国际上一生产部署：`d8e2836e-31e8-4eba-9a94-2ef3ec520f32`。需要回滚时恢复国内静态包，并恢复该国际生产部署。

## 验收

- 63 项行为测试通过，含新增的 8 项交流方向轮播测试；15 项静态验证和企业微信 QR 校验通过。
- 本地实际浏览器测得连续间隔 2501 / 2503 / 2502ms；手动选中后进入 manual 状态，联系链接和统计 topic 均保持一致。
- 1025px 深浅主题下两张实践卡片等宽等高、图片完整；390px 中文及 320px 英文联系区没有横向溢出，主辅按钮显示正确。
- 两地 18 个受影响页面返回 200，发布指纹、主辅按钮、canonical、轮播模块及背景 CSS 均匹配候选包；国际浏览器确认新 CDN 图片加载成功且两卡粒子均存在。
- 真实线上点击企业微信主按钮，`inquiry_wecom` 与目标页 PV 接口均返回 200。只读查询 Umami 确认同一访问记录一次点击和一次 `/contact/wecom/?inquiry=training` 浏览，字段为原网站 ID、`site_version=current`、`language=zh-Hans`、`topic=training`。未运行合成 PV 脚本。

本记录是部署后的文档补充，不改变线上运行代码或资源指纹。

## 后续修正：FDE 课表序号留白（2026-09-14）

- 修正 `ai-course/redesign.css` 将课程行左右内边距覆盖为 0 的问题；共享课程卡片改为 `24px clamp(16px, 2.4vw, 28px)`。21 课 × 3 语言均沿用此样式。
- 运行提交 `c65cc90a2028c19f6d7b416e951aa1f6a31c6d90`；发布指纹 `c99d8faa9efa`。国内已同步静态包；国际生产部署 `a24781f3-0e96-4eb8-98cb-da38fcc30db4`，API 确認 success。
- 实际浏览器检查：1025px 下所有 21 个序号左侧留白 24.6px；320px 英文深色页面为 16px，第一课与最后一课一致，没有横向溢出。课程、SEO、导航、资源、统计配置及单站发布检查通过。
- 两地三个语言 FDE 页面共六个地址返回新资源引用，线上 CSS 内容验证正确。本次只更改样式，沿用已有统计配置。
- 发布前国内备份：`lanxin-official-direct:/var/backups/lancloudtech/20260914-014359/`；国际上一生产部署 `4dfcf65a-46e8-42ee-a14a-bc796f26abec`。
