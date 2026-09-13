# 案例与实践 · 交付成形

- 模式：editorial-system / stylized-concept
- 用途：新版路由微信 / OG 方形分享缩略图
- 目标画幅：1:1，优先原生 1536 × 1536
- 实际输出：1254 × 1254 原生 PNG（1:1）；未裁切、未放大，保留内置工具原图
- 生成方式：内置 image_gen；独立新图，无参考图片
- 目标文件：`images/generated/share/og-practice-v3.png`
- 说明：品牌概念图，不作为产品界面或业务成效证据。无文字、Logo、二维码。

## 完整 Prompt

```text
Use case: stylized-concept
Asset type: square WeChat sharing thumbnail for a premium enterprise AI company's website; language-neutral editorial brand image, not evidence of a real product.
Output: one independent image, exactly 1:1 square, preferably native 1536 x 1536 pixels.
Style/medium: exquisite photorealistic 3D product still life, meticulous industrial craftsmanship, premium studio product photography.
Scene/backdrop: seamless porcelain off-white #F6F7F5 background and matching ground plane.
Composition/framing: one bold central composition, total subject occupies about 72% of canvas width and 66% of height, keep a clear 14% safe margin on all sides, simple silhouette remains identifiable in a tiny WeChat square thumbnail; slightly elevated three-quarter camera, no close crop.
Lighting/mood: soft gallery daylight from upper left, gentle realistic contact shadows, clean restrained highlights, calm, precise and substantial.
Color palette: white porcelain, forge teal #0F766E, silver brushed aluminium. Teal is the only chromatic accent.
Materials/textures: satin white porcelain with fine bevels, subtly translucent teal acrylic, finely brushed silver aluminium, realistic controlled reflections.
Constraints: absolutely no text, letters, numbers, logos, watermark, QR codes, faces, people, fake UI, screens, browser chrome, dashboard, charts, diagrams, tiny data marks or decorative extra props. No purple, neon, cyberpunk, glowing holograms, cartoon, cream terracotta, clutter or heavy shadows. No more than three main sculptural objects. Do not make a collage or a sheet of multiple images.
Subject: exactly three chunky satin white porcelain components precisely interlock to become one complete, stable, usable compact sculptural assembly. Show clear machined joining seams and a restrained thin brushed-aluminium support detail. A single continuous forge-teal inset travels across the successfully joined interfaces, visually confirming that the individual components now work together. The assembly should feel finished, solid and purposeful, like an expertly delivered physical system. Not an exploded view, not a construction kit, no loose pieces, no tools, no symbols; emphasize the bold unified silhouette of the three joined components.
```
