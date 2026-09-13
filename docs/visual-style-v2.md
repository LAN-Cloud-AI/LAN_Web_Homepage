# 流动的智能 · 官网视觉与动效风格

2026-09-13 起的视觉设计与迭代记录。最初阶段仅作本地第二轮设计；其本地验收和未上传说明保留为历史，当前全量发布要求见文末。实际部署完成状态由发布记录确认。

## 整体风格

把兰芯的“理解业务、连接信息、推进工作”表达为有方向的光场。画面具有数字艺术的空间感，排版保持清晰的阅读顺序。主体采用有机、连续、非对称的丝带与环形流线。

- 浅色：暖白底、深青正文、玉绿粒子与少量香槟色亮点。
- 深色：墨绿底、暖白正文、通透青绿光带与细密点光。默认跟随实际系统主题，也服从用户选择的白天 / 黑夜模式。
- 大标题、宽留白、精细边线；产品画面与正文维持清楚的层级。
- Hero 保留密集粒子与空间运动；后续区块使用少量慢速粒子与轻微交互反馈。产品内容优先，粒子仅作伴随。

## 整页分镜

| 区块 | 视觉与运动 | 业务含义 |
| --- | --- | --- |
| Hero | 大幅非对称粒子丝带，舒展、聚合成环、光流向前；有真实空间视差 | 信号变成下一步行动 |
| LeadsHunter | 图像边缘的粒子向几条明确流束汇聚 | 需求被识别和聚焦 |
| VECT | 多层星群在关系节点之间连接 | 信息形成客户上下文 |
| TACT | 粒子沿四道轨迹依次交接 | 工作被协同推进 |
| AI 实战培训 | 粒子沿上升丝带生长 | 能力逐步形成 |
| 实践 | 环绕产品成果的粒子与细流 | 经验进入真实工作 |
| 关于 / 方法 | 三个区域之间的光流接续 | 发现、验证、使用 |
| 联系区 | 大幅光流再次汇聚 | 下一段合作的起点 |

产品与方案、案例与实践的页头和对应模块使用同一套粒子语言。正式产品截图、成熟度、联系方式和正文语义保持准确。

## 实现原则

ThreeUI Community 的 Orbital Sphere 粒子几何作为 Hero 基础，使用定制顶点着色器生成连续扭转丝带；其 Flow Field / Constellation Field 为多区块流场参考。依赖、代码与许可本地打包，不引入第三方统计。

首屏提供匹配风格的 AI 静态图；WebGL 不可用、减少动效或节省流量时回退。正式版本动效默认开启，不再提供暂停按钮，保留首屏重播；离屏和后台暂停计算，手机降低粒子数量和分辨率。正文、链接、分享卡片继续使用静态 HTML 和已有埋点。

历史范围：最初设计轮次仅在本地制作，当时不发布生产、不推送 GitHub；这不是当前全量发布限制。

## 图片与提示词

本轮使用内置图片生成工具，先生成浅色，再以浅色为参考生成同构图深色版本。

- 浅色图：[brand-luminous-field-v1.png](../images/generated/brand/brand-luminous-field-v1.png)；[完整提示词](../images/prompts/brand/brand-luminous-field-v1.md)。
- 深色图：[brand-luminous-field-dark-v1.png](../images/generated/brand/brand-luminous-field-dark-v1.png)；[完整提示词](../images/prompts/brand/brand-luminous-field-dark-v1.md)。
- 原图 1672 × 941，分别附带 768 / 1280 / 1672 宽 WebP；图片索引与 catalog 已同步。最初验收时由本地服务映射图片，当时尚未上传生产 OSS。

## 2026-09-13 细化：配图统一与动效层次

根据页面标注，将 LeadsHunter、AI 培训、云朵记账三组配图统一为暖白 / 墨绿背景、玉绿主体与温润灰色材质，移除原有蓝紫底色和图片中的密集光圈。各图的浅深版本沿用一致构图，不改产品示意的含义；同一配图在公司三页的引用一并更新。

非 Hero 区块的粒子数量降至原来的约四成，整体运动速度为原来的 42%，轨迹线由 5–8 条简化为 2–3 条（TACT 保留四道工作流），减小光晕、拖尾与卡片位移。此阶段动画仍持续缓慢流动，并沿用当时的暂停 / 离屏 / 后台机制；当前版本取消用户暂停按钮，离屏和后台节流继续保留。

联系区新文案：**从一个业务问题，开始一次有用的改变。** 配套说明：聊聊你的场景与目标，一起找到可落地的下一步。三语同步。

### 新配图、保存位置与完整提示词

均使用内置图片生成工具编辑，原图1536×1024，每色配备原宽/768 WebP。

| 配图 | 原图 | 完整提示词 |
| --- | --- | --- |
| 官网统一视觉 · 意向发现仪表盘（浅色） | [PNG](../images/generated/leadshunter-page/lh-discovery-luminous-v1.png) | [提示词](../images/prompts/leadshunter/lh-discovery-luminous-v1.md) |
| 官网统一视觉 · 意向发现仪表盘（深色） | [PNG](../images/generated/leadshunter-page/lh-discovery-luminous-dark-v1.png) | [提示词](../images/prompts/leadshunter/lh-discovery-luminous-dark-v1.md) |
| 首页 AI 实战培训 · 玉绿能力进阶（浅色） | [PNG](../images/generated/ai-course-page/ai-course-path-luminous-v1.png) | [提示词](../images/prompts/ai-course/ai-course-path-luminous-v1.md) |
| 首页 AI 实战培训 · 玉绿能力进阶（深色） | [PNG](../images/generated/ai-course-page/ai-course-path-luminous-dark-v1.png) | [提示词](../images/prompts/ai-course/ai-course-path-luminous-dark-v1.md) |
| 云朵记账 · 浅色玉绿仪表盘 | [PNG](../images/generated/cloud-ledger-page/cloud-ledger-dashboard-luminous-v1.png) | [提示词](../images/prompts/internal-expense/cloud-ledger-dashboard-luminous-v1.md) |
| 云朵记账 · 深色墨绿仪表盘 | [PNG](../images/generated/cloud-ledger-page/cloud-ledger-dashboard-luminous-dark-v1.png) | [提示词](../images/prompts/internal-expense/cloud-ledger-dashboard-luminous-dark-v1.md) |

## 2026-09-13 细化：界面完整性与卡片留白

LeadsHunter 与云朵记账改用无设备外框的平面界面图，取消笔记本、键盘和底座。首页、解决方案页和实践页同步引用，采用 3:2 完整比例，不放大裁切；悬停也不放大图片。首页两张实践卡片等宽，文字区桌面左右 28px、手机左右 20px，底部保留独立留白。Global 圆圈缩为桌面 36px、手机 28px。

商城闭环图使用暖白 / 墨绿背景与玉色主体，艺术项目的原生海报插画也随系统切换暖白 / 墨绿配色。Hero 与非 Hero 粒子的节奏保持不变。

以下六张图均使用内置 image_gen 编辑，保存1536×1024 PNG、原宽 WebP及768×512 WebP；完整提示词已归档，旧版素材保留。

| 配图 | 原图 | 完整提示词 |
| --- | --- | --- |
| LeadsHunter 完整界面 · 浅色 | [PNG](../images/generated/leadshunter-page/lh-interface-luminous-v1.png) | [提示词](../images/prompts/leadshunter/lh-interface-luminous-v1.md) |
| LeadsHunter 完整界面 · 深色 | [PNG](../images/generated/leadshunter-page/lh-interface-luminous-dark-v1.png) | [提示词](../images/prompts/leadshunter/lh-interface-luminous-dark-v1.md) |
| 云朵记账完整界面 · 浅色 | [PNG](../images/generated/cloud-ledger-page/cloud-ledger-interface-luminous-v1.png) | [提示词](../images/prompts/internal-expense/cloud-ledger-interface-luminous-v1.md) |
| 云朵记账完整界面 · 深色 | [PNG](../images/generated/cloud-ledger-page/cloud-ledger-interface-luminous-dark-v1.png) | [提示词](../images/prompts/internal-expense/cloud-ledger-interface-luminous-dark-v1.md) |
| 商城闭环 · 浅色 | [PNG](../images/generated/commerce-page/commerce-workflow-luminous-v1.png) | [提示词](../images/prompts/marketing/commerce-workflow-luminous-v1.md) |
| 商城闭环 · 深色 | [PNG](../images/generated/commerce-page/commerce-workflow-luminous-dark-v1.png) | [提示词](../images/prompts/marketing/commerce-workflow-luminous-dark-v1.md) |

当时的本地验收：桌面及 390px / 320px 手机宽度实际浏览器检查通过，无横向溢出；浅深图片均正确选择，产品图保持完整 3:2 比例。Hero、SEO、微信分享、Umami 与预上线资源校验通过，57 个冻结旧版文件保持不变。在该次验收时间点，新素材仅存于本地，尚未上传生产 OSS。


## 全量发布要求（取代本地预上线限制）

新版作为唯一公开站点，直接使用正式根路由；旧 `/preview` 链接仅 301 兼容。`legacy-site/` 是离线 Git 存档，旧版入口与返回按钮不再发布。上述“仅本地”“未上传”属于此前设计阶段的状态，本次发布须同步实际引用的图片及其浅深、响应式变体；上传与部署结果以对应发布记录为准。

- 全站共用 site-shell 导航和页脚，确保栏目顺序、当前位置及语言路由一致；404 使用同一套结构和粒子视觉。
- Hero 图形与进度线使用同一时间轴，阶段跳转后继续播放。全站动效默认开启，移除首屏和全局暂停按钮，保留重播与系统减少动效等自动回退；非 Hero 粒子维持轻缓节奏。
- 页脚与汉堡菜单提供系统 / 白天 / 黑夜选择。site-theme 同步 CSS、图片与粒子；使用 `lancloud.theme` 和跨公司子域的 `lancloud_theme` cookie，LeadsHunter 接入相同偏好。
- `build:company` 包含统一 shell、SEO、三语页面和粒子 404；发布包为 JS / CSS 添加指纹并保留稳定基础文件，避免已缓存 HTML 失去原资源路径。
- 正常页面在主域允许索引，国际地理副本保持 noindex，canonical / sitemap 仍统一为 apex；不因视觉或动效改动覆盖静态 SEO 元信息。
