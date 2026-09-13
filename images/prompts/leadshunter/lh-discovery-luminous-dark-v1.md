# 官网统一视觉 · 意向发现仪表盘（深色）

- ID：`lh-discovery-luminous-dark-v1`
- 生成方式：内置 `image_gen` 编辑；无 CLI / API 调用。
- 日期：2026-09-13
- 编辑目标：`images/generated/leadshunter-page/lh-appstore-discovery-dashboard-dark-v2.png`
- 用途：公司官网 LeadsHunter 产品卡；保留匿名示意 UI，适配「流动的智能」暖白／墨绿与玉绿配色。
- 输出：`images/generated/leadshunter-page/lh-discovery-luminous-dark-v1.png`
- 尺寸：1536 × 1024（3:2）
- WebP：`lh-discovery-luminous-dark-v1.webp`（1536 × 1024）、`lh-discovery-luminous-dark-v1-768.webp`（768 × 512）；只做格式转换与缩放。
- 保留：单台笔记本、正视构图、屏幕模块／图表／匿名占位信息布局。
- 去除：蓝紫色、图片内粒子、外围光圈及装饰网格；页面动效由网页控制。

## 完整 Prompt

```text
Use case: style-transfer
Asset type: dark-theme product mockup for the LAN Cloud AI homepage.
Input image: the supplied image is the edit target, a centered laptop with a language-neutral lead discovery dashboard.
Primary request: carefully recolor and refine this exact image to belong to a premium ink-green and jade website. Change the palette and surrounding backdrop, preserve the device and screen layout.
Composition invariants: maintain the same straight-on single laptop, its precise size, position, proportions, perspective and full silhouette, and the same screen modules: left navigation icon rail, four top KPI cards, four intent bands, wide multi-series trend graph, five lower table rows. Preserve the chart path structures and the existing abstract placeholder strokes, dots and symbols; no new text.
Scene/backdrop: replace the entire navy blue backdrop and floor with a seamless calm deep ink-green studio background near #103127. Remove ALL surrounding orbital lines, particles, outer light rings, grid decoration and blue/purple glow. Use a very gentle green tonal gradient, softly integrated realistic contact shadow below the laptop, no detached halo.
Color palette: screen base ink-green-black #10251f, subtle raised panels #183b30, muted green-grey border and placeholder strokes; main accents jade #5cb69c and soft mint #a4d7bd. Distinguish the four data series with dark jade, medium jade, pale sage and very restrained muted champagne #c7b78d. Absolutely no cobalt blue, navy, electric blue, violet, purple, bright coral or red. Keep accessible clear tonal hierarchy.
Hardware: refined graphite-green bezel and warm silver-grey metal body with a slight sage cast, restrained realistic highlights, no colored neon rim.
Style: polished, calm premium product photography plus crisp anonymous SaaS mockup. Natural matte surfaces, low glare, precise edges. It must look integrated into a deep green editorial website, not a cyberpunk technology advertisement.
Constraints: change only color, materials/lighting and removal of decorative surrounding elements; keep all dashboard structure and laptop geometry. No readable words, letters, Chinese characters, numerals, logos, fake typography, actual customer data, watermarks, extra devices or people. Keep the original 3:2 landscape framing.
```

## Negative

```text
cobalt blue, navy blue, electric blue, purple, violet, outer orbit rings, surrounding particles, neon halo, real customer data, readable text, fake typography, logos, watermark, extra devices, people
```

