# 云朵记账 App Store 画廊 · 订阅资产（浅色）

- ID: `cloud-ledger-subscription-dashboard-v1`
- 画幅：1536 × 1024（3:2 横版；中心 16:10 安全裁切）
- 输出：`images/generated/cloud-ledger-page/cloud-ledger-subscription-dashboard-v1.png`
- 响应式派生：`-768.png`、`.webp`、`-768.webp`
- 用途：`/internal-expense/` 订阅资产模块（浅色模式）

## 参考与数据边界

云朵记账（Internal Expense）的已登录产品界面只可作为私有工作流与信息层级参考；不得复刻、展示、裁切或导出其原始截图。画面只能使用虚构的、无标识的几何 UI，不得含账号、团队名称、人员、金额、付款信息、订阅服务、报销凭证或任何真实数据。产品名只用于本 Prompt 的项目语境，不得渲染到图片中。

## 完整 Prompt

```text
Use case: product-mockup
Asset type: premium horizontal App Store-style subscription-assets dashboard for 云朵记账 (Internal Expense). The product name is context only: do not render it or any other writing in the image.
Reference image role: use the authenticated Internal Expense product only as a private workflow reference. Never reproduce, display, crop, or include its screenshot, accounts, people, transaction records, service names, amounts, payment details, or any real data.

Create a refined silver laptop, centered and viewed straight-on, on a cool-white App Store editorial card. On its screen, show a language-neutral anonymous subscription-assets workspace: a calm cost-rhythm field made of unlabeled stacked bands, renewal-status tiles represented by distinct geometric color states, a structured subscription-table geometry made only of blank rectangles and divider lines, and one small abstract allocation curve with no axes or labels. Make the visual feel operational and precise without text, numbers, logos, service marks, receipts, or payment information. Keep all product detail inside a center 16:10 safe crop, with ample breathing room around the hardware.

Style/medium: polished Apple App Store product photography plus a crisp high-fidelity light SaaS mockup; cool-white and ice-blue surfaces, silver hardware, restrained cobalt, indigo, mint, and soft-coral signals, nearly invisible pale grid texture, exact rounded geometry. The laptop and background must integrate naturally without a separate drop shadow, halo, browser chrome, or floating decorative frame.

Constraints: no readable text, letters, Chinese characters, numerals, logos, wordmarks, UI labels, fake gibberish typography, browser chrome, third-party marks, people, faces, hands, actual product screenshots, real data, watermarks, or other devices.
```

## Negative Prompt

```text
dark-mode UI, black background, oblique laptop, desktop clutter, browser frame, device brand mark, multiple devices, readable or fake text, digits, labels, vendor logo, payment card, invoice or receipt photo, stock-photo people, hands, heavy external shadow, blurry halo, neon, cyberpunk, purple gradient, glassmorphism overload, watermark
```
