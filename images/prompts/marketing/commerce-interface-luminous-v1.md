# 商城与会员增长 · 浅色完整界面

- ID：`commerce-interface-luminous-v1`
- 使用模式：内置 image_gen，编辑（style-transfer）
- 用途：公司首页 / 案例与实践中的商城与会员流程示意，与云朵记账的完整平面界面保持同一视觉系列。
- 编辑参考：`images/generated/commerce-page/commerce-interface-luminous-dark-v1.png`；`images/generated/cloud-ledger-page/cloud-ledger-interface-luminous-v1.png`
- 输出：`images/generated/commerce-page/commerce-interface-luminous-v1.png`
- 原生尺寸：1536 × 1024，3:2；PNG 原图保留，无裁切、无放大。
- 派生：同名原宽 WebP（1536 × 1024）、`commerce-interface-luminous-v1-768.webp`（768 × 512），cwebp 质量 88，仅格式转换和缩小。
- 生成来源：`/Users/i/.codex/generated_images/01a09b8c-09b9-76c1-86f8-7038e1921a3b/exec-dbcd7cde-fd8c-441e-b435-a69033ae95ac.png`
- 目视确认：完整左侧导航、四张总览卡、商城流程与图表、六行订单表；无设备硬件、无文字或真实数据、无静态粒子。网页动态粒子独立叠加。

## 完整 Prompt

```text
Use case: style-transfer
Asset type: complete flat light-mode commerce software-interface illustration for a company website card, landscape 3:2, 1536 x 1024.
Input image 1 is the EDIT TARGET: the approved frameless commerce and membership dashboard. Input image 2 is PALETTE AND FINISH reference only: the companion light ledger dashboard that sits beside it.
Primary request: convert only the colors, material finish and lighting of image 1 into the quiet porcelain-white and warm jade light-mode treatment of image 2. Keep the exact complete geometry of image 1: sidebar with commerce icons, top navigation strip, four summary cards for shopping/member/coupon/box, middle left four-stage commerce workflow, middle right columns and line, bottom six-row order table with tiny product icons, anonymous member symbols, status pills and fulfillment steps. Preserve the size, order, scale and position of every card, icon and row. No content cropped.
Color palette: warm porcelain-white #F0F5F1 page canvas, white panels, exceptionally fine warm sage-gray borders, deep teal #0F766E charts and icons, jade #55B895 and pale mint highlights, muted gray-green geometric placeholder bars. Tiny muted clay and champagne status accents only. Crisp thin borders and clean flat illumination matching image 2, with almost no shadow. Background extends as the interface's own warm-white surface to all image edges.
Constraints: no readable text, letters, numerals, logos, names, brands, watermarks, real customer data or real metrics. Keep the generic icons and abstract bars, including the geometric coupon discount symbol. No device, laptop, MacBook, monitor, bezel, physical frame, hardware, keyboard, browser chrome, perspective, pedestal, external shadow or glass reflection. No particles, static sparkles, orbit lines, streaks, navy, cobalt, blue or purple. Show the entire interface with every top and bottom row intact.
Output: one finished 1536 x 1024 image, exactly matching the approved dark version's layout.
```

## Negative

```text
laptop, MacBook, hardware, monitor, bezel, keyboard, device frame, browser chrome, perspective, crop, readable text, real metrics, customer data, names, logos, watermark, blue, navy, purple, neon, static particles, orbit lines
```

