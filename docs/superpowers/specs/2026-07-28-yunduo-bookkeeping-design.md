# 云朵记账产品页设计

## 目标

在兰芯云朵官网中新增 `/internal-expense/` 独立产品页，以“云朵记账”为对外展示名称，清晰呈现面向中小企业的订阅资产与报销管理能力。页面必须兼顾桌面、320px 起移动端、折叠屏、浅色与深色模式，并将开源属性转化为可信的产品入口。

## 已确认的产品边界

- 正式展示名称：**云朵记账**；辅助英文名称：**Internal Expense**。
- 产品主线同等强调“订阅资产”和“报销闭环”。
- 公开产品页使用匿名、虚构的团队、金额与服务名称；绝不展示已登录实例中的真实账号、个人信息、付款信息、订阅信息或截图。
- 公开 GitHub 仓库是可信入口：`https://github.com/LAN-Cloud-AI/LAN_Cloud_Internal_Expense`；产品页提供“查看源码”CTA，并说明 Apache-2.0 开源。
- 不将受登录保护的产品实例 URL 作为公开 CTA。

## 信息架构

1. **Hero — 每笔订阅都清楚，每次报销都有据可查**
   - 一段简短说明：为中小企业统一管理订阅、付款者、账期、报销候选与支出记录。
   - CTA：`查看源码`（GitHub）和 `了解工作方式`（页内锚点）。
   - 5:8 App Store 风格总览图，展示虚构的订阅与报销总览。
2. **订阅资产 — 看清正在发生的固定支出**
   - 强调版本化条款、付款者与使用者、续费与账期；不承诺自动支付或自动报销。
   - 3:2 横向工作台视觉，呈现匿名订阅清单、成本节奏与续费状态。
3. **报销闭环 — 从候选费用到可追溯批次**
   - 强调候选费用、按付款者合单、汇率快照与审批/付款状态留痕。
   - 5:8 竖向 App Store 风格视觉，呈现匿名报销候选与批次归组。
4. **开源与数据边界**
   - 简明陈述订阅、账号资产、报销批次与历史记录的可追溯特性。
   - 强调账号资产不保存密码、OTP、MFA、token 或完整卡号；页面不复制技术实现细节。
5. **页尾 CTA**
   - `在 GitHub 查看源码`、返回兰芯云朵官网、联系入口。

## 视觉语言

- 沿用现有 App Store 展示方向：高明度冷灰/雾蓝底、可克制的靛蓝与青绿信号色、直视设备、足够留白。
- 生成图只显示匿名几何 UI，不出现可读文字、数字、品牌标识、第三方平台标志或浏览器框。
- 图片仅使用圆角裁切并自然融入背景；禁止外阴影、模糊光晕与暗色反相。
- 使用浅色与深色的独立图片来源；所有图片提供 WebP 优先、PNG fallback、768px 响应式派生。
- 动效仅用于渐进出现与细指针悬浮，且在 `prefers-reduced-motion` 下禁用。

## 响应式与可访问性

- 从 320px 开始保证可用；920px 以下切换单栏，760px 以下使用可访问的折叠菜单和全宽 CTA。
- 使用 `minmax(0, …)` 防止网格溢出，并为横向折叠屏保留安全的双栏布局。
- 中文正文用语义短语 `copy-unit` 包裹，配合 `word-break: normal`、`line-break: strict`，不使用 `word-break: keep-all`。
- 提供跳过链接、正确的图片 alt、焦点可见样式和菜单 Escape 关闭行为。
- 所有浅/深色正文、链接、按钮与焦点环保持足够对比度。

## 集成范围

- 新增：`internal-expense/index.html`、`internal-expense/internal-expense.css`、`internal-expense/internal-expense.js`。
- 新增：`images/generated/internal-expense-page/` 下三组浅/深色图及其响应式派生。
- 首页“Open Source”中的 Internal Expense 卡片改为站内 `/internal-expense/`；页脚产品栏增加“云朵记账”。
- 保持 GitHub 作为产品页内的公开源码链接。
- 更新 README、AGENTS、Prompt 索引、Prompt catalog、Worker 资产校验与新路由验证脚本。

## 验证策略

- 先新增 `scripts/verify-internal-expense-route.mjs`，在页面实现前确认它因路由和资产缺失而失败。
- 验证路由、匿名视觉资产、浅/深色 source、移动断点、中文断行约束、无外阴影/反相、开源 CTA 与首页集成。
- 运行现有首页、LeadsHunter、企业微信、Worker 资产验证和 JavaScript syntax check。
- 在本地服务中人工检查 `/internal-expense/` 的桌面、320px、390px、折叠屏、浅/深色和 reduced-motion 状态。
