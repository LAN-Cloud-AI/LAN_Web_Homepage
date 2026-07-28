# 官网图片素材

本目录存放兰芯云朵官网所需的 **AI UI 生成 Prompt** 与生成结果。用产品界面图替代真实截屏，避免敏感数据外泄，并保持品牌视觉一致。

## 目录

```text
images/
├── README.md                 # 本说明
├── prompts/                  # Prompt 库（源）
│   ├── 00-VISUAL-SYSTEM.md   # 共享风格 / Negative / 画幅
│   ├── INDEX.md              # 全量索引
│   ├── brand/                # 品牌与通用壳
│   ├── leadshunter/          # 看见
│   ├── vect/                 # 理解
│   ├── tact/                 # 调度
│   ├── mobile/               # App
│   ├── analyst/              # 判断
│   └── marketing/            # 落地页 Hero / OG / 对比
└── generated/                # 生成结果（按同名放入）
    ├── brand/
    ├── leadshunter/
    ├── vect/
    ├── tact/
    ├── mobile/
    ├── analyst/
    └── marketing/
```

## 快速开始

1. 打开 [`prompts/INDEX.md`](./prompts/INDEX.md) 选场景  
2. 复制该文件中的「完整 Prompt」与「Negative Prompt」  
3. 用 Midjourney / Flux / Ideogram / GPT-Image 等生成（建议先读 [`prompts/00-VISUAL-SYSTEM.md`](./prompts/00-VISUAL-SYSTEM.md)）  
4. 导出 PNG 到 `generated/{产品线}/{id}.png`，与 Prompt 文件名对齐  

首页 Hero 当前使用 `generated/brand/brand-hero-precision-atelier*`：桌面采用 3:2 构图，移动端采用 4:3 构图；对应 Prompt 为 [`prompts/brand/brand-hero-homepage.md`](./prompts/brand/brand-hero-homepage.md)。`scripts/render_mocks.py` 仅用于既有 mock 资产，不应用于覆盖当前 Hero 或 LeadsHunter App Store 图。

`mocks/` 只保存本地审计与原型参考；其中 `mocks/leadshunter/` 含已登录工作流截图，绝不提交或部署。

**禁止**：任何 UI / 页脚出现 ICP **备案号**（含 蜀ICP备 / 京ICP备 / 公网安备 等）。

## 当前规模

| 产品线 | Prompt 数 |
| --- | ---: |
| brand | 6 |
| leadshunter | 20 |
| vect | 11 |
| tact | 11 |
| mobile | 9 |
| analyst | 3 |
| marketing | 8 |
| **合计** | **68** |

官网首屏优先生成：

1. `brand/brand-hero-homepage` → `brand-hero-precision-atelier`（桌面 3:2 与移动 4:3 成对输出；高清流程见 [`prompts/brand/HERO-HD-CHECKLIST.md`](./prompts/brand/HERO-HD-CHECKLIST.md)）
2. LeadsHunter 的六张 `lh-appstore-*-v2` 浅 / 深色产品图
3. 移动端当前直接复用 App Store 产品截图；`mobile-action` 仅保留为后续概念探索 Prompt，未部署生成资产

## 规范摘要

- **浅色** B2B SaaS，主色 forge teal `#0F766E`，禁止紫渐变 / 霓虹科幻 HUD  
- **Logo**：现行 WEB 云朵 + 白色终端符 `>_`（参考 `logo/WEB-logo.svg`）；生成时作 image reference，不准再自造 circuit 标
- 界面文案用**简体中文**，数据脱敏（无真实手机号、车牌、证件）  
- Hero 图：品牌锁头 + **一张主导 UI**，不要贴纸徽章堆叠；后续高清重生成的桌面源图目标为至少 **2560 px 宽**（当前生产资产为桌面 1537×1023、移动 1448×1086）
- **禁止备案号**：UI 与页面均不得出现 ICP / 公网安备文案
- 浏览器地址栏域名统一为 **`lancloudtech.com`**（含 `www` / `console` / `vect` / `tact` 子域） 

## 网页引用规则

- `catalog.json` 记录完整 Prompt 计划，不代表每条都已经生成；HTML 只能引用实际存在的输出。
- 网页图片优先使用 WebP，并保留 PNG fallback；所有 `srcset` 文件名必须与页面引用完全一致。
- LeadsHunter 产品图必须提供桌面、移动端与浅 / 深色变体，再更新 HTML、Prompt 和 `catalog.json`；首页图片则按实际对比度决定是否需要独立深色源，当前 Hero 由深色遮罩适配。

## 与产品文档的关系

| 叙事 | 文档 |
| --- | --- |
| 组织总述 | [LAN-Cloud-AI profile](https://github.com/LAN-Cloud-AI/.github/blob/main/profile/README.md) |
| VECT | `../VECT/README.md`（若仓库并列） |
| TACT | `../TACT/INTRODUCTION.md` |
