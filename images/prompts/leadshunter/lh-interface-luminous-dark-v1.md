# 官网统一视觉 · 完整线索界面（深色）

- ID：`lh-interface-luminous-dark-v1`
- 生成方式：内置 `image_gen` 编辑；无 CLI / API 调用。
- 日期：2026-09-13
- 编辑目标：`images/generated/leadshunter-page/lh-discovery-luminous-dark-v1.png`
- 用途：公司官网首页、解决方案与实践中的完整 LeadsHunter 界面示意。
- 输出：`images/generated/leadshunter-page/lh-interface-luminous-dark-v1.png`
- 尺寸：1536 × 1024（3:2）
- WebP：`lh-interface-luminous-dark-v1.webp`（1536 × 1024）、`lh-interface-luminous-dark-v1-768.webp`（768 × 512）；只做格式转换与缩放。
- 保留：完整左侧导航、四张顶部卡片、四栏意向分布、完整四序列图表、五行底部表格；匿名占位符与暖白／墨绿、玉绿、少量香槟色。
- 去除：全部设备硬件、屏幕边框、键盘、底座、浏览器框、透视、外围光轨和阴影。
- 目视确认：完整界面正面展示，无笔记本框架，内容未裁断。

## 完整 Prompt

```text
Use case: precise-object-edit
Asset type: flat, frameless software interface artwork for a website product card.
Input image: the supplied image is the edit target. It currently depicts an ink-green and jade lead-discovery dashboard inside a laptop.
Primary request: remove the entire laptop hardware and its studio surroundings, and present ONLY the COMPLETE dashboard interface itself, enlarged in a perfectly straight-on flat 2D view. The final image is the software interface, not a photograph of any display or device.
Composition: preserve every interface component from the source: full left navigation icon rail from top circle to bottom dots; complete row of four KPI cards; entire four-column intent distribution panel; wide four-series trend chart and all endpoints; the complete five-row bottom status table. Preserve their relative order, arrangement and abstract chart paths. Fit ALL of these into a 1536×1024 landscape canvas with only a small equal ink-green breathing margin around the complete interface. The UI should occupy roughly 94% of the image width and height. Do not crop or omit the navigation, top row, chart, or bottom rows. Keep all modules flat with crisp orthographic edges.
Color palette: retain ink-green-black #10251f base, subtle raised panels #183b30, muted green-grey borders and placeholder strokes; jade #5cb69c and soft mint #a4d7bd accents, very restrained muted champagne #c7b78d for one series. Small outer margin uses matching deep green #103127. Absolutely no blue, navy, electric blue or purple.
Style: polished high-fidelity anonymous SaaS interface mockup, calm premium editorial quality, clean fine dividers and restrained internal card hierarchy. Flat borderless overall composition without external shadow.
Constraints: no laptop, no MacBook, no keyboard, trackpad, hinge, metal body, base, bezel, screen frame, monitor, phone, device hardware, browser frame, browser chrome, perspective, surrounding studio floor, external shadow, particle trail, glowing orbit or decorative ring. No readable text, letters, Chinese characters, numbers, logos, watermark, real data, people, or fake gibberish type. Preserve the source's abstract placeholder strokes and symbols instead of text. Output 1536×1024, 3:2.
```

## Negative

```text
laptop, MacBook, keyboard, trackpad, hinge, device body, base, bezel, screen frame, monitor, phone, browser chrome, perspective, surrounding studio floor, external shadow, particles, glowing orbits, cropped UI, readable text, real data, logos, watermark, people
```

