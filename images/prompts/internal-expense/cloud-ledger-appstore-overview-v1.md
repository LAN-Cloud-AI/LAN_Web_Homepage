# 云朵记账 App Store 画廊 · 经营总览（浅色）

- ID: `cloud-ledger-appstore-overview-v1`
- 画幅：1003 × 1568（约 5:8 竖版）
- 输出：`images/generated/cloud-ledger-page/cloud-ledger-appstore-overview-v1.png`
- 响应式派生：`-768.png`、`.webp`、`-768.webp`
- 用途：`/internal-expense/` 首屏产品总览（浅色模式）

## 参考与数据边界

云朵记账（Internal Expense）的已登录产品界面只可作为私有工作流与信息层级参考；不得复刻、展示、裁切或导出其原始截图。画面只能使用虚构的、无标识的几何 UI，不得含账号、团队名称、人员、金额、付款信息、订阅服务、报销凭证或任何真实数据。产品名只用于本 Prompt 的项目语境，不得渲染到图片中。

## 完整 Prompt

```text
Use case: product-mockup
Asset type: premium vertical App Store-style product artwork for 云朵记账 (Internal Expense), an open-source subscription-assets and reimbursement-management product. The product name is context only: do not render it or any other writing in the image.
Reference image role: use the authenticated Internal Expense product only as a private workflow reference. Never reproduce, display, crop, or include its screenshot, accounts, people, transaction records, service names, amounts, payment details, or any real data.

Create one premium tall 5:8 App Store editorial card on a pale fog-blue, high-key studio background. Exactly one unbranded, front-on compact tablet is centered with generous breathing room. Its screen is a language-neutral anonymous operations overview: abstract subscription rhythm bands, a cluster of unlabeled candidate-expense cards, and a simple payment-status progression made only of colored geometric blocks, dots, and lines. The interface must feel credibly detailed without using any typography or numerals. Keep every important element inside the central safe area for narrow mobile and foldable crops.

Style/medium: polished Apple App Store editorial product photography combined with a high-fidelity light SaaS mockup; cool-white tablet, powder-blue and fog-white surfaces, restrained cobalt, indigo, mint, and soft coral signals, fine white grid texture, precise rounded geometry. The background and device must integrate naturally without a separate drop shadow, halo, browser frame, or floating decorative frame.

Constraints: no readable text, letters, Chinese characters, numerals, logos, wordmarks, UI labels, fake gibberish typography, browser chrome, third-party marks, people, faces, hands, actual product screenshots, real data, watermarks, or additional devices.
```

## Negative Prompt

```text
dark-mode background, black tablet, browser window, device brand mark, multiple devices, readable or fake text, digits, charts with labels, subscription-service logo, payment-card details, receipt image, stock-photo people, hands, heavy external shadow, blurry halo, neon, cyberpunk, purple gradient, glassmorphism overload, watermark
```
