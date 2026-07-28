# 云朵记账 App Store 画廊 · 报销闭环（深色）

- ID: `cloud-ledger-reimbursement-flow-dark-v1`
- 画幅：1003 × 1568（约 5:8 竖版）
- 输出：`images/generated/cloud-ledger-page/cloud-ledger-reimbursement-flow-dark-v1.png`
- 响应式派生：`-768.png`、`.webp`、`-768.webp`
- 用途：`/internal-expense/` 报销闭环模块（深色模式）

## 参考与数据边界

云朵记账（Internal Expense）的已登录产品界面只可作为私有工作流与信息层级参考；不得复刻、展示、裁切或导出其原始截图。画面只能使用虚构的、无标识的几何 UI，不得含账号、团队名称、人员、金额、付款信息、订阅服务、报销凭证或任何真实数据。产品名只用于本 Prompt 的项目语境，不得渲染到图片中。

## 完整 Prompt

```text
Use case: product-mockup
Asset type: premium dark-mode vertical App Store feature-card artwork for the reimbursement-closure workflow in 云朵记账 (Internal Expense). The product name is context only: do not render it or any other writing in the image.
Reference image role: use the authenticated Internal Expense product only as a private workflow reference. Never reproduce, display, crop, or include its screenshot, accounts, people, transaction records, service names, amounts, payment details, or any real data.

Create one premium tall 5:8 App Store editorial card on a seamless midnight-navy and deep-indigo studio background. Exactly one unbranded, front-on graphite contemporary smartphone is centered with generous breathing room. Its language-neutral anonymous dark screen shows a candidate-fee grouping flow: several blank geometric expense cards gather into one clean group, then pass through an approval-to-paid progression represented only by connected restrained cobalt, mint, and soft-coral state nodes and simple abstract confirmation shapes. Add at most two subtle flat supporting cards behind the phone, with no typography or device branding. Keep the full phone and every essential flow element inside the central safe area for narrow mobile and foldable crops.

Style/medium: polished Apple App Store product photography plus a high-fidelity dark mobile SaaS mockup; low-glare graphite hardware, deep navy and cool-slate planes, subtle midnight grid texture, precise rounded geometry. The composition must integrate naturally without a separate drop shadow, halo, browser frame, receipt imagery, or floating decorative frame.

Constraints: no readable text, letters, Chinese characters, numerals, logos, wordmarks, UI labels, fake gibberish typography, browser chrome, third-party marks, people, faces, hands, actual product screenshots, real data, watermarks, receipts, payment cards, or additional devices.
```

## Negative Prompt

```text
white or pale background, light phone, browser window, phone brand mark, multiple phones, readable or fake text, digits, chat bubbles with labels, vendor logo, receipt photo, invoice, bank or payment-card details, stock-photo people, hands, heavy external shadow, blurry halo, neon, cyberpunk, purple haze, glassmorphism overload, watermark
```
