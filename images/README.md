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

## 当前规模

| 产品线 | Prompt 数 |
| --- | ---: |
| brand | 5 |
| leadshunter | 11 |
| vect | 11 |
| tact | 11 |
| mobile | 6 |
| analyst | 3 |
| marketing | 8 |
| **合计** | **55** |

官网首屏优先生成：

1. `marketing/mkt-hero-see`  
2. `marketing/mkt-hero-understand`  
3. `marketing/mkt-hero-orchestrate`  
4. `leadshunter/lh-dashboard-manager`  
5. `vect/vect-customer-profile`  
6. `tact/tact-digital-workorder`  
7. `marketing/mkt-og-square`  

## 规范摘要

- **浅色** B2B SaaS，主色 forge teal `#0F766E`，禁止紫渐变 / 霓虹科幻 HUD  
- 界面文案用**简体中文**，数据脱敏（无真实手机号、车牌、证件）  
- Hero 图：品牌 + 一句主标题区 + **一张主导 UI**，不要贴纸徽章堆叠  

## 与产品文档的关系

| 叙事 | 文档 |
| --- | --- |
| 组织总述 | [LAN-Cloud-AI profile](https://github.com/LAN-Cloud-AI/.github/blob/main/profile/README.md) |
| VECT | `../VECT/README.md`（若仓库并列） |
| TACT | `../TACT/INTRODUCTION.md` |
