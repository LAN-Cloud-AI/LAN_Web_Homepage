# 兰芯云朵官网 · UI 生成视觉规范

不要再把同一套「高密度桌面 SaaS」前缀套到所有图片。官网现在使用三种有明确职责的视觉模式：

- **desktop-ui**：桌面端真实产品证据，可保留中文 UI、侧栏与真实 Logo；
- **editorial-system**：Hero / Beliefs 的品牌编辑视觉，必须无文字、无 Logo，避免和多语言 HTML 重复；
- **mobile-action**：手机端产品特写，一张图只传达一个动作，不出现桌面侧栏、浏览器框或微型表格。

## desktop-ui 风格块（仅用于真实桌面产品证据）

```text
Product UI mockup for LAN Cloud AI (兰芯云朵), a Chinese automotive retail & aftersales SaaS.
Clean light-mode enterprise interface, soft cool-gray canvas (#F4F6F8), charcoal text (#1A2332),
single accent color forge teal (#0F766E), secondary steel blue (#334155) for charts.
Dense but readable SaaS layout like Linear + Notion + modern DMS: left sidebar, top bar with store switcher,
crisp 1px borders, subtle elevation, 8px grid, Inter/Noto Sans SC hybrid typography.
Realistic Chinese UI labels (Simplified Chinese), believable automotive dealer data (anonymized),
no real personal IDs, no real phone numbers, no license plates with real patterns.
MacBook Pro browser chrome OR frameless app window. Sharp UI screenshot aesthetic, not 3D, not isometric.
High fidelity, 4K, straight-on orthographic view, ample whitespace hierarchy, professional automotive ops software.
If a browser address bar is visible, use ONLY the official domain lancloudtech.com
(e.g. https://www.lancloudtech.com, https://console.lancloudtech.com/..., https://vect.lancloudtech.com/..., https://tact.lancloudtech.com/...).
Never use lancloudai.com, lancloud.com, or example.com as the product URL.
Demo emails in UI must use @lancloudtech.com (never @example.com).
```

## editorial-system 风格块（Hero / Beliefs）

```text
Premium editorial product visual for an automotive operations system.
Use a calm porcelain canvas (#F6F7F5), ink (#17201F), white surfaces,
forge teal (#0F766E), and restrained slate (#52616B).

One clear visual idea, one dominant focal surface, at most three supporting forms.
Generous breathing room, clean technical guide lines, gentle realistic shadow,
precise hierarchy, frosted acrylic, brushed aluminium, and porcelain materials.

Language-neutral visual: no readable text, no letters, no Chinese characters,
no numerals, no logos, no wordmarks, no URLs, no watermark.
Do not include browser chrome, device hardware, sidebars, app navigation, or phone frames.
Live localized copy and the official logo are supplied by the webpage, not by the image.
```

## mobile-action 风格块（手机端产品特写）

```text
Mobile-first editorial product visual for an automotive operations system.
Use a 4:5 portrait canvas designed to remain clear at 390 CSS pixels wide.
One oversized focal object and at most two supporting evidence tiles; never use a dense dashboard.
Keep all important forms within x=10–90% and y=10–88% of the canvas.

Match the porcelain / frosted-acrylic / brushed-aluminium material language,
thin technical guide lines, forge teal (#0F766E) progress path, and soft gallery light.
No readable text, letters, Chinese characters, numerals, logos, wordmarks, watermark,
phone frame, browser chrome, desktop sidebar, table, or fake UI typography.
```

## 官方 Logo（必须遵守）

现行官网标识为 **WEB 公司 logo**（云朵 + 终端提示符），不是几何 circuit / 字母标：

| 项 | 规范 |
| --- | --- |
| 图形 | forge-teal（`#0E766E` / `#0F766E`）圆角云朵剪影；内部白色 CLI 提示符：左侧 `>` chevron + 右侧短横 `_` |
| 风格 | 扁平矢量、干净边缘；可有极淡内阴影；禁止另造图标 |
| 锁头 | 图标 + 中文「兰芯云朵」；可选小号英文 `LAN Cloud AI` |
| 参考文件 | `images/logo/WEB-logo.svg` · `images/logo/WEB-logo-transparent.png` · `images/logo/WEB-logo.png` |

**仅当该资产确实需要 Logo 时**，才把参考图作为 image reference / style reference 传入（GPT-Image、Flux、Ideogram、MJ `--sref` 等）。若模型画不准，生成后用真实 logo 贴回（见 `scripts/overlay_logos.py`）。`editorial-system` 和 `mobile-action` 禁止生成或贴入 Logo。

可追加到场景正文的 Logo 短句：

```text
Brand mark MUST be the official LAN Cloud AI logo: teal (#0E766E) cloud silhouette with white terminal prompt inside (chevron ">" + underscore "_").
Do NOT invent circuit marks, lettermarks, abstract glyphs, or alternate cloud icons. Prefer matching the provided logo reference image.
```

## 禁止（Negative，可统一追加）

```text
purple gradient, neon glow, glassmorphism overload, cyberpunk, sci-fi HUD, dark mode default,
stock photo people faces, watermark, blurry text, lorem ipsum Latin-only UI, emoji clutter,
cartoon, low contrast, skeuomorphism, heavy drop shadows, rounded-full pill spam, cream terracotta aesthetic,
newspaper layout, holographic, robot mascot,
wrong domains (lancloudai.com, lancloud.com, example.com in address bar or emails),
wrong brand marks (circuit-cloud, lettermark L, rainbow cloud, robotic mascot logo, purple logo),
ICP filing numbers / 备案号 / 公网安备 / any 蜀ICP备·京ICP备·粤ICP备 style footer text
```

## 画幅与输出分辨率

| 用途 | 比例 | 标注 | 建议最小像素（宽×高） |
| --- | --- | --- | --- |
| Hero / Beliefs 品牌编辑视觉 | 3:2 或 4:3 | `aspect 3:2` / `4:3` | 1536×1024 / 1440×1080 |
| 产品页双栏截图 | 3:2 或 16:10 | `aspect 3:2` | 2048×1365 或 2560×1600 |
| 手机端产品行动特写 | 4:5 | `aspect 4:5` | 1200×1500 |
| 手机 App | 9:19.5 | `aspect 9:19.5` | 1179×2556 量级 |
| 方形 OG / 社交 | 1:1 | `aspect 1:1` | 1200×1200 |
| 宽幅功能条 | 21:9 | `aspect 21:9` | 2560×1097 |

桌面端真实产品截图在 Retina 上以约 1280 CSS px 展示，源图至少 **2560 宽**。当前的品牌编辑 Hero 限制为约 1120 CSS px 展示，1536px 宽的原生生成图可接受；不要用低清截图放大伪造 4K。

## 文件命名

`{产品}-{场景}-{视角}.md`  
对应生成图建议：`images/generated/{产品}/{同名}.png`

## 使用方式

1. 打开具体 Prompt 文件  
2. 选择对应模式并复制「完整 Prompt」= 模式风格块 + 场景正文 + Negative
3. `desktop-ui` 才附上官方 Logo 参考图（`images/logo/WEB-logo-transparent.png`）；其余两种模式禁止附 Logo
4. 用 Midjourney / Flux / Ideogram / GPT-Image 等按目标比例生成
5. 输出放入 `images/generated/...`，文件名与 Prompt 对齐；生成桌面 UI 时 Logo 不准才使用 `scripts/overlay_logos.py` 贴回

任何页面级品牌名、标题、功能链和多语言文案都由 HTML 承担；不要把它们再塞进 Hero、Beliefs 或移动端特写图。
