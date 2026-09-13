import {
  DEFAULT_LOCALE,
  HTML_LANG,
  isSiteLocale,
  localeAwareUrl,
  localeFromPathname,
} from "./site-identity.js";

export const LOCALE_STORAGE_KEY = "lancloud.locale";

export const LOCALES = [
  { id: "zh-Hans", short: "简", label: "简体中文" },
  { id: "zh-Hant", short: "繁", label: "繁體中文" },
  { id: "en", short: "EN", label: "English" },
];

/** Infer locale from device language. */
export const detectLocale = () => {
  const tags = [...(navigator.languages || []), navigator.language || "zh-CN"];
  for (const raw of tags) {
    const tag = String(raw || "").toLowerCase();
    if (!tag) continue;
    if (tag.startsWith("zh")) {
      if (
        tag.includes("hant") ||
        tag.includes("-tw") ||
        tag.includes("-hk") ||
        tag.includes("-mo") ||
        tag.endsWith("tw") ||
        tag.endsWith("hk") ||
        tag.endsWith("mo")
      ) {
        return "zh-Hant";
      }
      return "zh-Hans";
    }
    if (tag.startsWith("en")) return "en";
  }
  return "zh-Hans";
};

export const resolveLocale = () => {
  if (typeof location !== "undefined" && location.pathname) {
    return localeFromPathname(location.pathname);
  }
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && isSiteLocale(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
};

const dict = {
  "zh-Hans": {
    "meta.title": "兰芯云朵 · LAN Cloud AI",
    "meta.description":
      "兰芯云朵用 AI 重新定义汽车零售与售后：看见公域信号，理解客户关系，调度车间流转。",
    "meta.shareTitle": "兰芯云朵",
    "meta.shareDescription": "汽车经营智能系统",
    "hero.h1": "让 AI 看懂业务 让经营先行一步",
    "hero.h1a": "让 AI 看懂业务",
    "hero.h1b": "让经营先行一步",
    "nav.brand": "兰芯云朵",
    "nav.products": "产品",
    "nav.method": "造法",
    "nav.beliefs": "信念",
    "nav.academy": "培养",
    "nav.open": "开源",
    "nav.contact": "联系",
    "nav.cta": "预约沟通",
    "nav.menu": "菜单",
    "nav.closeMenu": "关闭菜单",
    "lang.label": "选择语言",
    "hero.eyebrow": "汽车经营智能系统",
    "hero.lede": "用 AI 重新定义汽车零售与售后<span class=\"lede-rest\">怎么被经营</span>",
    "hero.ctaPrimary": "预约沟通",
    "hero.ctaSecondary": "了解产品",
    "hero.imgAlt": "汽车运营精密工作流视觉",
    "strip.see": "看见",
    "strip.understand": "理解",
    "strip.orchestrate": "调度",
    "strip.judge": "判断",
    "strip.note":
      "业务规则 × 多维表格 / 事件系统 × AI · 先在真实门店验证，再契约先行地 SaaS 化",
    "products.title": "三款产品，一条经营链",
    "products.desc": "从公域机会到客户关系，再到车间交期——把动作送到正确的人手里。",
    "lh.title": "客户并没有沉默，他只是没在你的 CRM 里说话",
    "lh.desc":
      "从抖音、小红书等公开内容里识别经营信号，完成意向评分、属地分发与飞书交付。生产链路 Mercury 已稳定运行。",
    "lh.li1": "公域采集 → AI 评分 → 线索入池",
    "lh.li2": "多租户组织与属地化指派",
    "lh.li3": "训练场 Skill 可同步回生产",
    "lh.page": "产品官网",
    "lh.img1": "LeadsHunter 公域战情盘",
    "lh.img2": "S4 高优机会卡",
    "vect.title": "客户说「没事」，系统却看见他正在离开",
    "vect.desc":
      "把预约、工单、回访、NPS 拼成一段关系：全功能档案、AI 质检、雷达预警与责任动作闭环。飞书验证完成，SaaS 筹备中。",
    "vect.li1": "关系温度与可解释风险",
    "vect.li2": "SA / 客服 / 店长 / 区域作战面",
    "vect.li3": "差评发生前完成挽救",
    "vect.img1": "VECT 全功能客户档案",
    "vect.img2": "VECT AI 智能质检",
    "tact.title": "车辆还没延误，系统已经看见延误会在哪里发生",
    "tact.desc":
      "数字工单建立唯一可信状态；可解释派工、时效云图与主动调度。飞书验证后，Phase 0 契约与 SaaS 工程已启动。",
    "tact.li1": "状态 · 责任 · 证据 · 下一步",
    "tact.li2": "技能 / 负载 / 交期综合派工",
    "tact.li3": "事件可审计，Agent 只建议不越权",
    "tact.link": "TACT 仓库",
    "tact.img1": "TACT 数字工单",
    "tact.img2": "TACT 调度驾驶舱",
    "method.title": "管理系统的造法",
    "method.desc":
      "VECT 与 TACT 证明：任何管理流程都能拆成对象、状态、责任、时点、证据与风险。",
    "method.p1.t": "业务对象",
    "method.p1.d": "客户、车辆、订单、门店",
    "method.p2.t": "状态",
    "method.p2.d": "当前在哪一步，下一步是什么",
    "method.p3.t": "责任人",
    "method.p3.d": "谁负责，谁协同，谁审批",
    "method.p4.t": "时点",
    "method.p4.d": "何时开始，何时截止，是否超时",
    "method.p5.t": "证据",
    "method.p5.d": "记录、照片、录音、结果",
    "method.p6.t": "风险",
    "method.p6.d": "规则预警、AI 判断、升级条件",
    "beliefs.title": "我们相信什么",
    "beliefs.imgAlt": "可信业务工作流视觉",
    "beliefs.b1": "<strong>AI 的第一份工作不是画图，</strong>是决定哪些数据值得相信。",
    "beliefs.b2": "<strong>看见风险还不够，</strong>必须把动作送到正确岗位。",
    "beliefs.b3": "<strong>自动化必须可解释、可审计；</strong>高风险动作保留人工与 Owner 确认。",
    "beliefs.b4": "<strong>先在真实业务跑通，</strong>再用契约把门，再谈规模化开通。",
    "academy.eyebrow": "Academy · 人才培养",
    "academy.title": "从 AI 应用到一线 FDE",
    "academy.lede": "84 课时通用 FDE 培养路径，以及面向真实业务的三天 AI 工具 MVP 定制课。",
    "academy.stat1": "课",
    "academy.stat2": "课时",
    "academy.stat3": "阶段",
    "academy.ctaPrimary": "了解课程体系",
    "academy.ctaSecondary": "浏览公开课表",
    "open.title": "在 GitHub 上跟随我们",
    "open.desc": "公开仓库欢迎阅读与讨论；生产链路保持私有。训练场与契约仓是理解兰芯的最佳入口。",
    "repo.org": "组织主页与 Overview",
    "repo.tact": "车间编排 Phase 0 契约",
    "repo.lh": "线索模型训练场",
    "repo.expense": "开源订阅与报销管理",
    "contact.title": "需要进一步了解？",
    "contact.lede": "经销商合作、产品演示或技术交流，我们很乐意聊聊。",
    "contact.wecom": "添加企业微信",
    "contact.email": "发送邮件",
    "contact.call": "致电咨询",
    "contact.mailSubject": "预约沟通 · 兰芯云朵",
    "footer.explore": "探索",
    "footer.products": "产品",
    "footer.contact": "联系",
    "footer.navLabel": "页脚导航",
    "footer.company": "四川兰芯云朵智能科技有限公司",
    "footer.tax": "统一社会信用代码：91510100MAEP9GMR9R",
    "footer.address":
      "中国（四川）自由贸易试验区成都高新区新程南一路19号3栋15层1501-1504号",
    "footer.beian": "蜀ICP备2026002396号",
    "footer.sitemap": "网站地图",
    "footer.copy": "Copyright © 2026 兰芯云朵. 保留所有权利.",
    "expense.skip": "跳到主要内容",
    "expense.brandAria": "返回兰芯云朵官网",
    "expense.product": "云朵记账",
    "expense.menu": "菜单",
    "expense.navLabel": "云朵记账页面导航",
    "expense.nav.subs": "订阅资产",
    "expense.nav.reimb": "报销闭环",
    "expense.nav.open": "开源与边界",
    "expense.nav.source": "查看源码",
    "expense.support": "开源管理工具",
    "expense.h1a": "每笔订阅都清楚，",
    "expense.h1b": "每次报销都有据可查",
    "expense.lede1": "为中小企业统一梳理订阅、",
    "expense.lede2": "付款者与账期，",
    "expense.lede3": "把候选费用整理为可追溯的报销批次，",
    "expense.lede4": "让每一项日常支出都经得起回看。",
    "expense.ctaSource": "在 GitHub 查看源码",
    "expense.ctaHow": "了解工作方式",
    "expense.proofLabel": "云朵记账核心能力",
    "expense.p1t": "订阅资产",
    "expense.p1d": "付款者、使用者与账期",
    "expense.p2t": "报销候选",
    "expense.p2d": "合单、状态与留痕",
    "expense.p3t": "持续可查",
    "expense.p3d": "历史记录可回溯",
    "expense.p4t": "开放透明",
    "expense.p4d": "Apache-2.0 开源",
    "expense.heroAlt": "云朵记账的匿名订阅与报销总览产品展示图",
    "expense.heroFig1": "订阅与报销，",
    "expense.heroFig2": "在同一个清晰的工作台里。",
    "expense.subsEyebrow": "订阅资产",
    "expense.subsH2a": "看清正在发生的",
    "expense.subsH2b": "每一笔固定支出",
    "expense.subsP1": "把软件、服务与日常订阅，",
    "expense.subsP2": "集中成一份资产清单。",
    "expense.subsP3": "谁在付款、谁在使用、何时续费，",
    "expense.subsP4": "都按条款与账期保留清晰上下文。",
    "expense.subsDt1": "版本化条款",
    "expense.subsDd1a": "保留订阅变更的时间线，",
    "expense.subsDd1b": "方便复盘当前约定。",
    "expense.subsDt2": "付款与使用归属",
    "expense.subsDd2a": "将付款者与使用者分开记录，",
    "expense.subsDd2b": "减少口头交接。",
    "expense.subsDt3": "续费节奏",
    "expense.subsDd3a": "把临近账期的项目提前呈现，",
    "expense.subsDd3b": "便于团队安排。",
    "expense.subsAlt": "云朵记账的匿名订阅资产工作台产品展示图",
    "expense.subsFig1": "用统一的资产视角，",
    "expense.subsFig2": "理解重复发生的经营支出。",
    "expense.reimbEyebrow": "报销闭环",
    "expense.reimbH2a": "从候选费用，",
    "expense.reimbH2b": "到可追溯的报销批次",
    "expense.reimbP1": "把待处理费用先作为候选记录，",
    "expense.reimbP2": "再按付款者整理进报销批次。",
    "expense.reimbP3": "汇率快照、审批与付款状态同步留痕，",
    "expense.reimbP4": "让一次报销的来处与去向都更清楚。",
    "expense.flow1t": "记录候选费用",
    "expense.flow1a": "先收集，",
    "expense.flow1b": "不急着打断原有流程。",
    "expense.flow2t": "按付款者合单",
    "expense.flow2a": "把同一付款者的项目，",
    "expense.flow2b": "整理为可核对的批次。",
    "expense.flow3t": "留存状态与快照",
    "expense.flow3a": "记录审批、付款与汇率时点，",
    "expense.flow3b": "保留完整回溯路径。",
    "expense.reimbAlt": "云朵记账的匿名报销候选与批次流程产品展示图",
    "expense.reimbFig1": "从一笔候选费用开始，",
    "expense.reimbFig2": "到一条完整的报销记录。",
    "expense.openEyebrow": "开源与数据边界",
    "expense.openH2a": "把日常财务整理，",
    "expense.openH2b": "交给看得见的系统",
    "expense.openP1": "云朵记账以 Apache-2.0 许可开源。",
    "expense.openP2": "团队可以阅读、部署和改进代码，",
    "expense.openP3": "也能持续保留订阅资产、报销批次，",
    "expense.openP4": "以及历史记录的上下文。",
    "expense.boundLabel": "云朵记账的数据边界",
    "expense.b1t": "订阅资产可回看",
    "expense.b1a": "围绕条款、账期、付款与使用归属，",
    "expense.b1b": "建立可持续更新的记录。",
    "expense.b2t": "报销批次有来处",
    "expense.b2a": "候选费用、合单关系与状态变化，",
    "expense.b2b": "在同一条路径中留痕。",
    "expense.b3t": "账号边界更明确",
    "expense.b3a": "账号资产不保存密码、OTP、MFA、",
    "expense.b3b": "token 或完整卡号。",
    "expense.contactEyebrow": "开始使用",
    "expense.contactH2a": "把下一笔支出，",
    "expense.contactH2b": "放进清楚的账里",
    "expense.backHome": "返回兰芯云朵官网",
    "expense.footerTag": "面向中小企业的开源订阅与报销管理。",
    "wecom.skip": "跳到主要内容",
    "wecom.brandAria": "返回兰芯云朵官网首页",
    "wecom.kicker": "企业微信",
    "wecom.h1a": "联系兰芯云朵",
    "wecom.h1b": "销售经理",
    "wecom.qrAlt": "兰芯云朵销售经理企业微信二维码",
    "wecom.default1": "我是兰芯云朵销售经理，",
    "wecom.default2": "这是我的企业微信，",
    "wecom.default3": "请您使用微信扫描二维码",
    "wecom.default4": "与我取得联系",
    "wecom.inapp1": "我是兰芯云朵销售经理，",
    "wecom.inapp2": "请您长按二维码，",
    "wecom.inapp3": "添加我的企业微信",
    "wecom.back": "返回兰芯云朵官网",
    "sitemap.skip": "跳到网站地图",
    "sitemap.brandAria": "返回兰芯云朵官网",
    "sitemap.h1": "网站地图",
    "sitemap.ledeBefore": "兰芯云朵官网公开页面索引。机器可读版本见 ",
    "sitemap.ledeAfter": "。",
    "sitemap.home": "官网",
    "sitemap.homeLink": "首页",
    "sitemap.products": "产品",
    "sitemap.lh": "LeadsHunter 线索猎手",
    "sitemap.lhNote": "独立官网",
    "sitemap.expense": "云朵记账",
    "sitemap.academy": "培养",
    "sitemap.hub": "AI 课程总览",
    "sitemap.fde": "FDE 公开课表",
    "sitemap.mvp": "企业定制三天课",
    "sitemap.contact": "联系",
    "sitemap.wecom": "企业微信名片",
    "sitemap.homeContact": "首页联系区块",
    "notfound.h1": "页面不存在",
    "notfound.lede": "这个地址没有对应页面。",
    "notfound.home": "返回首页",
  },
  "zh-Hant": {
    "meta.title": "蘭芯雲朵 · LAN Cloud AI",
    "meta.description":
      "蘭芯雲朵用 AI 重新定義汽車零售與售後：看見公域訊號，理解客戶關係，調度車間流轉。",
    "meta.shareTitle": "蘭芯雲朵",
    "meta.shareDescription": "汽車經營智能系統",
    "hero.h1": "讓 AI 看懂業務 讓經營先行一步",
    "hero.h1a": "讓 AI 看懂業務",
    "hero.h1b": "讓經營先行一步",
    "nav.brand": "蘭芯雲朵",
    "nav.products": "產品",
    "nav.method": "造法",
    "nav.beliefs": "信念",
    "nav.academy": "培養",
    "nav.open": "開源",
    "nav.contact": "聯繫",
    "nav.cta": "預約溝通",
    "nav.menu": "選單",
    "nav.closeMenu": "關閉選單",
    "lang.label": "選擇語言",
    "hero.eyebrow": "汽車營運智能系統",
    "hero.lede": "用 AI 重新定義汽車零售與售後<span class=\"lede-rest\">怎麼被經營</span>",
    "hero.ctaPrimary": "預約溝通",
    "hero.ctaSecondary": "了解產品",
    "hero.imgAlt": "汽車營運精密工作流程視覺",
    "strip.see": "看見",
    "strip.understand": "理解",
    "strip.orchestrate": "調度",
    "strip.judge": "判斷",
    "strip.note":
      "業務規則 × 多維表格 / 事件系統 × AI · 先在真實門店驗證，再契約先行地 SaaS 化",
    "products.title": "三款產品，一條經營鏈",
    "products.desc": "從公域機會到客戶關係，再到車間交期——把動作送到正確的人手裡。",
    "lh.title": "客戶並沒有沉默，他只是沒在你的 CRM 裡說話",
    "lh.desc":
      "從抖音、小紅書等公開內容裡識別經營訊號，完成意向評分、屬地分發與飛書交付。生產鏈路 Mercury 已穩定運行。",
    "lh.li1": "公域採集 → AI 評分 → 線索入池",
    "lh.li2": "多租戶組織與屬地化指派",
    "lh.li3": "訓練場 Skill 可同步回生產",
    "lh.page": "產品官網",
    "lh.img1": "LeadsHunter 公域戰情盤",
    "lh.img2": "S4 高優機會卡",
    "vect.title": "客戶說「沒事」，系統卻看見他正在離開",
    "vect.desc":
      "把預約、工單、回訪、NPS 拼成一段關係：全功能檔案、AI 質檢、雷達預警與責任動作閉環。飛書驗證完成，SaaS 籌備中。",
    "vect.li1": "關係溫度與可解釋風險",
    "vect.li2": "SA / 客服 / 店長 / 區域作戰面",
    "vect.li3": "差評發生前完成挽救",
    "vect.img1": "VECT 全功能客戶檔案",
    "vect.img2": "VECT AI 智能質檢",
    "tact.title": "車輛還沒延誤，系統已經看見延誤會在哪裡發生",
    "tact.desc":
      "數字工單建立唯一可信狀態；可解釋派工、時效雲圖與主動調度。飛書驗證後，Phase 0 契約與 SaaS 工程已啟動。",
    "tact.li1": "狀態 · 責任 · 證據 · 下一步",
    "tact.li2": "技能 / 負載 / 交期綜合派工",
    "tact.li3": "事件可審計，Agent 只建議不越權",
    "tact.link": "TACT 倉庫",
    "tact.img1": "TACT 數位工單",
    "tact.img2": "TACT 調度駕駛艙",
    "method.title": "管理系統的造法",
    "method.desc":
      "VECT 與 TACT 證明：任何管理流程都能拆成對象、狀態、責任、時點、證據與風險。",
    "method.p1.t": "業務對象",
    "method.p1.d": "客戶、車輛、訂單、門店",
    "method.p2.t": "狀態",
    "method.p2.d": "當前在哪一步，下一步是什麼",
    "method.p3.t": "責任人",
    "method.p3.d": "誰負責，誰協同，誰審批",
    "method.p4.t": "時點",
    "method.p4.d": "何時開始，何時截止，是否超時",
    "method.p5.t": "證據",
    "method.p5.d": "記錄、照片、錄音、結果",
    "method.p6.t": "風險",
    "method.p6.d": "規則預警、AI 判斷、升級條件",
    "beliefs.title": "我們相信什麼",
    "beliefs.imgAlt": "可信業務工作流程視覺",
    "beliefs.b1": "<strong>AI 的第一份工作不是畫圖，</strong>是決定哪些數據值得相信。",
    "beliefs.b2": "<strong>看見風險還不夠，</strong>必須把動作送到正確崗位。",
    "beliefs.b3": "<strong>自動化必須可解釋、可審計；</strong>高風險動作保留人工與 Owner 確認。",
    "beliefs.b4": "<strong>先在真實業務跑通，</strong>再用契約把門，再談規模化開通。",
    "academy.eyebrow": "Academy · 人才培養",
    "academy.title": "從 AI 應用到一線 FDE",
    "academy.lede": "84 課時通用 FDE 培養路徑，以及面向真實業務的三天 AI 工具 MVP 定制課。",
    "academy.stat1": "課",
    "academy.stat2": "課時",
    "academy.stat3": "階段",
    "academy.ctaPrimary": "了解課程體系",
    "academy.ctaSecondary": "瀏覽公開課表",
    "open.title": "在 GitHub 上跟隨我們",
    "open.desc": "公開倉庫歡迎閱讀與討論；生產鏈路保持私有。訓練場與契約倉是理解蘭芯的最佳入口。",
    "repo.org": "組織主頁與 Overview",
    "repo.tact": "車間編排 Phase 0 契約",
    "repo.lh": "線索模型訓練場",
    "repo.expense": "開源訂閱與報銷管理",
    "contact.title": "需要進一步了解？",
    "contact.lede": "經銷商合作、產品演示或技術交流，我們很樂意聊聊。",
    "contact.wecom": "新增企業微信",
    "contact.email": "發送郵件",
    "contact.call": "致電諮詢",
    "contact.mailSubject": "預約溝通 · 蘭芯雲朵",
    "footer.explore": "探索",
    "footer.products": "產品",
    "footer.contact": "聯繫",
    "footer.navLabel": "頁腳導航",
    "footer.company": "四川蘭芯雲朵智能科技有限公司",
    "footer.tax": "統一社會信用代碼：91510100MAEP9GMR9R",
    "footer.address":
      "中國（四川）自由貿易試驗區成都高新區新程南一路19號3棟15層1501-1504號",
    "footer.beian": "蜀ICP备2026002396号",
    "footer.sitemap": "網站地圖",
    "footer.copy": "Copyright © 2026 蘭芯雲朵. 保留所有權利.",
    "expense.skip": "跳到主要內容",
    "expense.brandAria": "返回蘭芯雲朵官網",
    "expense.product": "雲朵記賬",
    "expense.menu": "選單",
    "expense.navLabel": "雲朵記賬頁面導航",
    "expense.nav.subs": "訂閱資產",
    "expense.nav.reimb": "報銷閉環",
    "expense.nav.open": "開源與邊界",
    "expense.nav.source": "查看源碼",
    "expense.support": "開源管理工具",
    "expense.h1a": "每筆訂閱都清楚，",
    "expense.h1b": "每次報銷都有據可查",
    "expense.lede1": "為中小企業統一梳理訂閱、",
    "expense.lede2": "付款者與賬期，",
    "expense.lede3": "把候選費用整理為可追溯的報銷批次，",
    "expense.lede4": "讓每一項日常支出都經得起回看。",
    "expense.ctaSource": "在 GitHub 查看源碼",
    "expense.ctaHow": "了解工作方式",
    "expense.proofLabel": "雲朵記賬核心能力",
    "expense.p1t": "訂閱資產",
    "expense.p1d": "付款者、使用者與賬期",
    "expense.p2t": "報銷候選",
    "expense.p2d": "合單、狀態與留痕",
    "expense.p3t": "持續可查",
    "expense.p3d": "歷史記錄可回溯",
    "expense.p4t": "開放透明",
    "expense.p4d": "Apache-2.0 開源",
    "expense.heroAlt": "雲朵記賬的匿名訂閱與報銷總覽產品展示圖",
    "expense.heroFig1": "訂閱與報銷，",
    "expense.heroFig2": "在同一個清晰的工作臺裡。",
    "expense.subsEyebrow": "訂閱資產",
    "expense.subsH2a": "看清正在發生的",
    "expense.subsH2b": "每一筆固定支出",
    "expense.subsP1": "把軟件、服務與日常訂閱，",
    "expense.subsP2": "集中成一份資產清單。",
    "expense.subsP3": "誰在付款、誰在使用、何時續費，",
    "expense.subsP4": "都按條款與賬期保留清晰上下文。",
    "expense.subsDt1": "版本化條款",
    "expense.subsDd1a": "保留訂閱變更的時間線，",
    "expense.subsDd1b": "方便復盤當前約定。",
    "expense.subsDt2": "付款與使用歸屬",
    "expense.subsDd2a": "將付款者與使用者分開記錄，",
    "expense.subsDd2b": "減少口頭交接。",
    "expense.subsDt3": "續費節奏",
    "expense.subsDd3a": "把臨近賬期的項目提前呈現，",
    "expense.subsDd3b": "便於團隊安排。",
    "expense.subsAlt": "雲朵記賬的匿名訂閱資產工作臺產品展示圖",
    "expense.subsFig1": "用統一的資產視角，",
    "expense.subsFig2": "理解重複發生的經營支出。",
    "expense.reimbEyebrow": "報銷閉環",
    "expense.reimbH2a": "從候選費用，",
    "expense.reimbH2b": "到可追溯的報銷批次",
    "expense.reimbP1": "把待處理費用先作為候選記錄，",
    "expense.reimbP2": "再按付款者整理進報銷批次。",
    "expense.reimbP3": "匯率快照、審批與付款狀態同步留痕，",
    "expense.reimbP4": "讓一次報銷的來處與去向都更清楚。",
    "expense.flow1t": "記錄候選費用",
    "expense.flow1a": "先收集，",
    "expense.flow1b": "不急著打斷原有流程。",
    "expense.flow2t": "按付款者合單",
    "expense.flow2a": "把同一付款者的項目，",
    "expense.flow2b": "整理為可核對的批次。",
    "expense.flow3t": "留存狀態與快照",
    "expense.flow3a": "記錄審批、付款與匯率時點，",
    "expense.flow3b": "保留完整回溯路徑。",
    "expense.reimbAlt": "雲朵記賬的匿名報銷候選與批次流程產品展示圖",
    "expense.reimbFig1": "從一筆候選費用開始，",
    "expense.reimbFig2": "到一條完整的報銷記錄。",
    "expense.openEyebrow": "開源與數據邊界",
    "expense.openH2a": "把日常財務整理，",
    "expense.openH2b": "交給看得見的系統",
    "expense.openP1": "雲朵記賬以 Apache-2.0 許可開源。",
    "expense.openP2": "團隊可以閱讀、部署和改進代碼，",
    "expense.openP3": "也能持續保留訂閱資產、報銷批次，",
    "expense.openP4": "以及歷史記錄的上下文。",
    "expense.boundLabel": "雲朵記賬的數據邊界",
    "expense.b1t": "訂閱資產可回看",
    "expense.b1a": "圍繞條款、賬期、付款與使用歸屬，",
    "expense.b1b": "建立可持續更新的記錄。",
    "expense.b2t": "報銷批次有來處",
    "expense.b2a": "候選費用、合單關係與狀態變化，",
    "expense.b2b": "在同一條路徑中留痕。",
    "expense.b3t": "賬號邊界更明確",
    "expense.b3a": "賬號資產不保存密碼、OTP、MFA、",
    "expense.b3b": "token 或完整卡號。",
    "expense.contactEyebrow": "開始使用",
    "expense.contactH2a": "把下一筆支出，",
    "expense.contactH2b": "放進清楚的賬裡",
    "expense.backHome": "返回蘭芯雲朵官網",
    "expense.footerTag": "面向中小企業的開源訂閱與報銷管理。",
    "wecom.skip": "跳到主要內容",
    "wecom.brandAria": "返回蘭芯雲朵官網首頁",
    "wecom.kicker": "企業微信",
    "wecom.h1a": "聯繫蘭芯雲朵",
    "wecom.h1b": "銷售經理",
    "wecom.qrAlt": "蘭芯雲朵銷售經理企業微信二維碼",
    "wecom.default1": "我是蘭芯雲朵銷售經理，",
    "wecom.default2": "這是我的企業微信，",
    "wecom.default3": "請您使用微信掃描二維碼",
    "wecom.default4": "與我取得聯繫",
    "wecom.inapp1": "我是蘭芯雲朵銷售經理，",
    "wecom.inapp2": "請您長按二維碼，",
    "wecom.inapp3": "新增我的企業微信",
    "wecom.back": "返回蘭芯雲朵官網",
    "sitemap.skip": "跳到網站地圖",
    "sitemap.brandAria": "返回蘭芯雲朵官網",
    "sitemap.h1": "網站地圖",
    "sitemap.ledeBefore": "蘭芯雲朵官網公開頁面索引。機器可讀版本見 ",
    "sitemap.ledeAfter": "。",
    "sitemap.home": "官網",
    "sitemap.homeLink": "首頁",
    "sitemap.products": "產品",
    "sitemap.lh": "LeadsHunter 線索獵手",
    "sitemap.lhNote": "獨立官網",
    "sitemap.expense": "雲朵記賬",
    "sitemap.academy": "培養",
    "sitemap.hub": "AI 課程總覽",
    "sitemap.fde": "FDE 公開課表",
    "sitemap.mvp": "企業定製三天課",
    "sitemap.contact": "聯繫",
    "sitemap.wecom": "企業微信名片",
    "sitemap.homeContact": "首頁聯繫區塊",
    "notfound.h1": "頁面不存在",
    "notfound.lede": "這個地址沒有對應頁面。",
    "notfound.home": "返回首頁",
  },
  en: {
    "meta.title": "LAN Cloud AI",
    "meta.description":
      "LAN Cloud AI redefines automotive retail and aftersales with AI: see public signals, understand customer relationships, orchestrate workshop flow.",
    "meta.shareTitle": "LAN Cloud AI",
    "meta.shareDescription": "Automotive ops intelligence",
    "hero.h1": "Let AI understand the business Let operations stay a step ahead",
    "hero.h1a": "Let AI understand the business",
    "hero.h1b": "Let operations stay a step ahead",
    "nav.brand": "LAN Cloud AI",
    "nav.products": "Products",
    "nav.method": "Method",
    "nav.beliefs": "Beliefs",
    "nav.academy": "Academy",
    "nav.open": "Open Source",
    "nav.contact": "Contact",
    "nav.cta": "Talk to us",
    "nav.menu": "Menu",
    "nav.closeMenu": "Close menu",
    "lang.label": "Language",
    "hero.eyebrow": "Automotive operations intelligence",
    "hero.lede": "AI that redefines how automotive retail and aftersales <span class=\"lede-rest\">are run</span>",
    "hero.ctaPrimary": "Talk to us",
    "hero.ctaSecondary": "Explore products",
    "hero.imgAlt": "Precision automotive operations workflow visual",
    "strip.see": "See",
    "strip.understand": "Understand",
    "strip.orchestrate": "Orchestrate",
    "strip.judge": "Decide",
    "strip.note":
      "Business rules × spreadsheets / event systems × AI · Prove in real stores, then scale with contracts first",
    "products.title": "Three products. One operating chain.",
    "products.desc":
      "From public-domain opportunity to customer relationships to workshop delivery — put the next action in the right hands.",
    "lh.title": "Customers aren't silent. They're just not speaking in your CRM.",
    "lh.desc":
      "Detect operating signals from public content on Douyin, Xiaohongshu and more, score intent, route by territory, and deliver via Feishu. The Mercury production pipeline is already running.",
    "lh.li1": "Public capture → AI scoring → lead pool",
    "lh.li2": "Multi-tenant orgs and territorial assignment",
    "lh.li3": "Training Ground skills sync back to production",
    "lh.page": "Official site",
    "lh.img1": "LeadsHunter public-signal dashboard",
    "lh.img2": "S4 high-priority opportunity card",
    "vect.title": 'Customers say "it\'s fine." The system sees they\'re leaving.',
    "vect.desc":
      "Appointments, work orders, follow-ups and NPS become one relationship: full profiles, AI QC, radar alerts and closed-loop ownership. Proven on Feishu; SaaS in preparation.",
    "vect.li1": "Relationship temperature and explainable risk",
    "vect.li2": "Surfaces for SA / CS / store / region",
    "vect.li3": "Rescue before a bad review happens",
    "vect.img1": "VECT full customer profile",
    "vect.img2": "VECT AI quality inspection",
    "tact.title": "Delays aren't late yet — the system already sees where they will be.",
    "tact.desc":
      "Digital work orders create a single trusted state; explainable dispatch, time-cloud views and proactive orchestration. After Feishu validation, Phase 0 contracts and SaaS engineering are underway.",
    "tact.li1": "State · ownership · evidence · next step",
    "tact.li2": "Skills / load / due-date aware dispatch",
    "tact.li3": "Auditable events; agents suggest, never overreach",
    "tact.link": "TACT repository",
    "tact.img1": "TACT digital work order",
    "tact.img2": "TACT dispatch cockpit",
    "method.title": "How management systems are made",
    "method.desc":
      "VECT and TACT show that any management flow can be broken into object, state, owner, timing, evidence and risk.",
    "method.p1.t": "Business object",
    "method.p1.d": "Customer, vehicle, order, store",
    "method.p2.t": "State",
    "method.p2.d": "Where it is now, and what comes next",
    "method.p3.t": "Owner",
    "method.p3.d": "Who owns it, who collaborates, who approves",
    "method.p4.t": "Timing",
    "method.p4.d": "When it starts, when it's due, whether it's late",
    "method.p5.t": "Evidence",
    "method.p5.d": "Records, photos, audio, outcomes",
    "method.p6.t": "Risk",
    "method.p6.d": "Rule alerts, AI judgment, escalation rules",
    "beliefs.title": "What we believe",
    "beliefs.imgAlt": "Trusted operational workflow visual",
    "beliefs.b1":
      "<strong>AI's first job isn't drawing.</strong> It's deciding which data deserves trust.",
    "beliefs.b2":
      "<strong>Seeing risk isn't enough.</strong> The action must reach the right role.",
    "beliefs.b3":
      "<strong>Automation must be explainable and auditable;</strong> high-risk actions keep humans and owners in the loop.",
    "beliefs.b4":
      "<strong>Prove it in real operations first,</strong> gate with contracts, then talk about scale.",
    "academy.eyebrow": "Academy · Talent development",
    "academy.title": "From AI application to frontline FDE",
    "academy.lede":
      "An 84-hour general FDE path, plus a three-day enterprise AI tool MVP workshop built around a real business problem.",
    "academy.stat1": "lessons",
    "academy.stat2": "hours",
    "academy.stat3": "stages",
    "academy.ctaPrimary": "Explore the curriculum",
    "academy.ctaSecondary": "Browse the public schedule",
    "open.title": "Follow us on GitHub",
    "open.desc":
      "Public repos are open for reading and discussion; production paths stay private. The training ground and contract kit are the best way in.",
    "repo.org": "Organization home and overview",
    "repo.tact": "Workshop orchestration Phase 0 contracts",
    "repo.lh": "Lead-model training ground",
    "repo.expense": "Open-source subscription and reimbursement management",
    "contact.title": "Want to go further?",
    "contact.lede":
      "Dealer partnerships, product demos, or technical conversations — we're happy to talk.",
    "contact.wecom": "Add Work WeChat",
    "contact.email": "Email us",
    "contact.call": "Call us",
    "contact.mailSubject": "Conversation · LAN Cloud AI",
    "footer.explore": "Explore",
    "footer.products": "Products",
    "footer.contact": "Contact",
    "footer.navLabel": "Footer",
    "footer.company": "Sichuan Lanxin Yunduo Intelligent Technology Co., Ltd.",
    "footer.tax": "Unified Social Credit Code: 91510100MAEP9GMR9R",
    "footer.address":
      "1501-1504, Floor 15, Building 3, No. 19 Xincheng South 1st Road, High-tech Zone, Chengdu, China (Sichuan) Pilot Free Trade Zone",
    "footer.beian": "蜀ICP备2026002396号",
    "footer.sitemap": "Sitemap",
    "footer.copy": "Copyright © 2026 LAN Cloud AI. All rights reserved.",
    "expense.skip": "Skip to main content",
    "expense.brandAria": "Back to LAN Cloud AI",
    "expense.product": "Cloud Ledger",
    "expense.menu": "Menu",
    "expense.navLabel": "Cloud Ledger page navigation",
    "expense.nav.subs": "Subscriptions",
    "expense.nav.reimb": "Reimbursements",
    "expense.nav.open": "Open source and boundaries",
    "expense.nav.source": "View source",
    "expense.support": "Open-source ops tool",
    "expense.h1a": "Every subscription is clear,",
    "expense.h1b": "every reimbursement is traceable",
    "expense.lede1": "Help small teams inventory subscriptions,",
    "expense.lede2": "payers and billing cycles,",
    "expense.lede3": "then fold candidate costs into traceable reimbursement batches,",
    "expense.lede4": "so everyday spend can stand a second look.",
    "expense.ctaSource": "View source on GitHub",
    "expense.ctaHow": "See how it works",
    "expense.proofLabel": "Cloud Ledger capabilities",
    "expense.p1t": "Subscription assets",
    "expense.p1d": "Payer, user, and cycle",
    "expense.p2t": "Expense candidates",
    "expense.p2d": "Batches, status, and trail",
    "expense.p3t": "Always reviewable",
    "expense.p3d": "History you can replay",
    "expense.p4t": "Open by default",
    "expense.p4d": "Apache-2.0",
    "expense.heroAlt": "Cloud Ledger anonymized subscription and reimbursement overview",
    "expense.heroFig1": "Subscriptions and reimbursements,",
    "expense.heroFig2": "on one clear workbench.",
    "expense.subsEyebrow": "Subscription assets",
    "expense.subsH2a": "See every recurring",
    "expense.subsH2b": "cost as it happens",
    "expense.subsP1": "Put software, services, and everyday subscriptions",
    "expense.subsP2": "into one asset list.",
    "expense.subsP3": "Who pays, who uses, and when it renews",
    "expense.subsP4": "stay in context with terms and cycles.",
    "expense.subsDt1": "Versioned terms",
    "expense.subsDd1a": "Keep a timeline of subscription changes",
    "expense.subsDd1b": "so the current deal is reviewable.",
    "expense.subsDt2": "Payer and user ownership",
    "expense.subsDd2a": "Record payer and user separately",
    "expense.subsDd2b": "to cut verbal handoffs.",
    "expense.subsDt3": "Renewal rhythm",
    "expense.subsDd3a": "Surface items near their cycle",
    "expense.subsDd3b": "so the team can plan.",
    "expense.subsAlt": "Cloud Ledger anonymized subscription-asset workbench",
    "expense.subsFig1": "One asset view",
    "expense.subsFig2": "for spend that keeps repeating.",
    "expense.reimbEyebrow": "Reimbursement loop",
    "expense.reimbH2a": "From candidate costs",
    "expense.reimbH2b": "to traceable batches",
    "expense.reimbP1": "Capture pending costs as candidates first,",
    "expense.reimbP2": "then group them by payer into batches.",
    "expense.reimbP3": "FX snapshots, approval, and payment status stay on the record,",
    "expense.reimbP4": "so origin and destination stay clear.",
    "expense.flow1t": "Record candidate costs",
    "expense.flow1a": "Collect first.",
    "expense.flow1b": "Do not break the existing flow.",
    "expense.flow2t": "Batch by payer",
    "expense.flow2a": "Items for the same payer",
    "expense.flow2b": "become a checkable batch.",
    "expense.flow3t": "Keep status and snapshots",
    "expense.flow3a": "Record approval, payment, and FX timing",
    "expense.flow3b": "for a full replay path.",
    "expense.reimbAlt": "Cloud Ledger anonymized reimbursement-candidate flow",
    "expense.reimbFig1": "Start with one candidate cost,",
    "expense.reimbFig2": "finish with a complete reimbursement record.",
    "expense.openEyebrow": "Open source and data boundaries",
    "expense.openH2a": "Put everyday finance in order",
    "expense.openH2b": "with a system you can see",
    "expense.openP1": "Cloud Ledger is Apache-2.0.",
    "expense.openP2": "Teams can read, deploy, and improve the code,",
    "expense.openP3": "while keeping subscription assets, reimbursement batches,",
    "expense.openP4": "and historical context.",
    "expense.boundLabel": "Cloud Ledger data boundaries",
    "expense.b1t": "Subscription assets stay reviewable",
    "expense.b1a": "Terms, cycles, payers, and users",
    "expense.b1b": "become a living record.",
    "expense.b2t": "Batches have an origin",
    "expense.b2a": "Candidates, grouping, and status changes",
    "expense.b2b": "share one trail.",
    "expense.b3t": "Account secrets stay out",
    "expense.b3a": "Account assets never store passwords, OTP, MFA,",
    "expense.b3b": "tokens, or full card numbers.",
    "expense.contactEyebrow": "Get started",
    "expense.contactH2a": "Put the next cost",
    "expense.contactH2b": "on a clear ledger",
    "expense.backHome": "Back to LAN Cloud AI",
    "expense.footerTag": "Open-source subscription and reimbursement for small teams.",
    "wecom.skip": "Skip to main content",
    "wecom.brandAria": "Back to the LAN Cloud AI homepage",
    "wecom.kicker": "WeCom",
    "wecom.h1a": "Contact LAN Cloud AI",
    "wecom.h1b": "sales",
    "wecom.qrAlt": "WeCom QR code for the LAN Cloud AI sales manager",
    "wecom.default1": "I am the LAN Cloud AI sales manager.",
    "wecom.default2": "This is my WeCom QR code.",
    "wecom.default3": "Scan it with WeChat",
    "wecom.default4": "to reach me.",
    "wecom.inapp1": "I am the LAN Cloud AI sales manager.",
    "wecom.inapp2": "Long-press the QR code",
    "wecom.inapp3": "to add me on WeCom.",
    "wecom.back": "Back to LAN Cloud AI",
    "sitemap.skip": "Skip to sitemap",
    "sitemap.brandAria": "Back to LAN Cloud AI",
    "sitemap.h1": "Sitemap",
    "sitemap.ledeBefore": "Public pages on LAN Cloud AI. Machine-readable copy: ",
    "sitemap.ledeAfter": ".",
    "sitemap.home": "Site",
    "sitemap.homeLink": "Home",
    "sitemap.products": "Products",
    "sitemap.lh": "LeadsHunter",
    "sitemap.lhNote": "Dedicated site",
    "sitemap.expense": "Cloud Ledger",
    "sitemap.academy": "Academy",
    "sitemap.hub": "AI course hub",
    "sitemap.fde": "FDE schedule",
    "sitemap.mvp": "3-day workshop",
    "sitemap.contact": "Contact",
    "sitemap.wecom": "WeCom card",
    "sitemap.homeContact": "Homepage contact block",
    "notfound.h1": "Page not found",
    "notfound.lede": "This address has no page.",
    "notfound.home": "Back to home",
  },
};

export const getI18nTable = (locale = DEFAULT_LOCALE) =>
  dict[isSiteLocale(locale) ? locale : DEFAULT_LOCALE];

export const t = (key, locale = resolveLocale()) => {
  const resolved = isSiteLocale(locale) ? locale : DEFAULT_LOCALE;
  const table = dict[resolved];
  return table[key] ?? dict[DEFAULT_LOCALE][key] ?? null;
};

export const applyI18n = (locale = resolveLocale()) => {
  const resolved = isSiteLocale(locale) ? locale : DEFAULT_LOCALE;
  const table = dict[resolved];
  document.documentElement.lang = HTML_LANG[resolved] || "zh-CN";
  document.documentElement.dataset.locale = resolved;

  document.querySelectorAll("[data-locale]").forEach((el) => {
    const id = el.getAttribute("data-locale");
    const active = id === resolved;
    el.classList.toggle("is-active", active);
    if (el instanceof HTMLButtonElement || el.getAttribute("role") === "button") {
      el.setAttribute("aria-pressed", active ? "true" : "false");
    }
  });

  const title = table["meta.title"];
  if (title) document.title = title;

  const desc = document.querySelector('meta[name="description"]');
  if (desc && table["meta.description"]) desc.setAttribute("content", table["meta.description"]);

  // Keep share-card fields short; do not overwrite them with longer SEO meta.
  const shareTitle = table["meta.shareTitle"] || title;
  const shareDescription = table["meta.shareDescription"] || table["meta.description"];
  const setMeta = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach((el) => el.setAttribute("content", value));
  };
  setMeta('meta[property="og:title"]', shareTitle);
  setMeta('meta[property="og:description"]', shareDescription);
  setMeta('meta[name="twitter:title"]', shareTitle);
  setMeta('meta[name="twitter:description"]', shareDescription);
  setMeta('meta[itemprop="name"]', shareTitle);
  setMeta('meta[itemprop="description"]', shareDescription);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = table[key];
    if (value == null) return;
    if (el.childElementCount && [...el.childNodes].some((n) => n.nodeType === Node.ELEMENT_NODE)) {
      const textNode = [...el.childNodes].find(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
      );
      if (textNode) textNode.textContent = value;
      else el.insertBefore(document.createTextNode(value), el.firstChild);
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const value = table[key];
    if (value != null) el.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    const value = table[key];
    if (value != null) el.setAttribute("alt", value);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const value = table[key];
    if (value != null) el.setAttribute("aria-label", value);
  });

  document.querySelectorAll(".nav-toggle").forEach((toggle) => {
    const menuLabel = table["nav.menu"];
    const closeLabel = table["nav.closeMenu"] || menuLabel;
    toggle.dataset.menuLabel = menuLabel || "Menu";
    toggle.dataset.closeMenuLabel = closeLabel || "Close menu";
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-label", isOpen ? toggle.dataset.closeMenuLabel : toggle.dataset.menuLabel);
  });

  const mail = document.querySelector("[data-i18n-mail-subject]");
  if (mail && table["contact.mailSubject"]) {
    const href = mail.getAttribute("href") || "";
    const base = href.split("?")[0];
    mail.setAttribute(
      "href",
      `${base}?subject=${encodeURIComponent(table["contact.mailSubject"])}`
    );
  }

  return resolved;
};

export const persistLocale = (locale) => {
  const next = isSiteLocale(locale) ? locale : DEFAULT_LOCALE;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
};

export const navigateToLocale = (locale) => {
  const next = persistLocale(locale);
  if (typeof location === "undefined") return next;
  const current = localeFromPathname(location.pathname);
  if (current === next) return applyI18n(next);
  location.assign(localeAwareUrl(`${location.pathname}${location.search}${location.hash}`, next));
  return next;
};

export const setLocale = (locale) => navigateToLocale(locale);
