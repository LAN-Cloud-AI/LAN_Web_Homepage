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
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && LOCALES.some((item) => item.id === saved)) return saved;
  } catch {
    /* ignore */
  }
  return detectLocale();
};

const dict = {
  "zh-Hans": {
    "meta.title": "兰芯云朵 · LAN Cloud AI",
    "meta.description":
      "兰芯云朵用 AI 重新定义汽车零售与售后：看见公域信号，理解客户关系，调度车间流转。",
    "nav.brand": "兰芯云朵",
    "nav.products": "产品",
    "nav.method": "造法",
    "nav.beliefs": "信念",
    "nav.open": "开源",
    "nav.contact": "联系",
    "nav.cta": "预约沟通",
    "lang.label": "选择语言",
    "hero.lede": "用 AI 重新定义汽车零售与售后怎么被经营。",
    "hero.ctaPrimary": "预约沟通",
    "hero.ctaSecondary": "了解产品",
    "hero.imgAlt": "兰芯云朵产品能力总览界面",
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
    "beliefs.imgAlt": "兰芯云朵信念：可信数据、责任动作、可解释与契约门禁",
    "beliefs.b1": "<strong>AI 的第一份工作不是画图，</strong>是决定哪些数据值得相信。",
    "beliefs.b2": "<strong>看见风险还不够，</strong>必须把动作送到正确岗位。",
    "beliefs.b3": "<strong>自动化必须可解释、可审计；</strong>高风险动作保留人工与 Owner 确认。",
    "beliefs.b4": "<strong>先在真实业务跑通，</strong>再用契约把门，再谈规模化开通。",
    "open.title": "在 GitHub 上跟随我们",
    "open.desc": "公开仓库欢迎阅读与讨论；生产链路保持私有。训练场与契约仓是理解兰芯的最佳入口。",
    "repo.org": "组织主页与 Overview",
    "repo.tact": "车间编排 Phase 0 契约",
    "repo.lh": "线索模型训练场",
    "repo.expense": "订阅资产与报销",
    "contact.title": "需要进一步了解？",
    "contact.lede": "经销商合作、产品演示或技术交流，我们很乐意聊聊。",
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
    "footer.copy": "Copyright © 2026 兰芯云朵. 保留所有权利.",
  },
  "zh-Hant": {
    "meta.title": "蘭芯雲朵 · LAN Cloud AI",
    "meta.description":
      "蘭芯雲朵用 AI 重新定義汽車零售與售後：看見公域訊號，理解客戶關係，調度車間流轉。",
    "nav.brand": "蘭芯雲朵",
    "nav.products": "產品",
    "nav.method": "造法",
    "nav.beliefs": "信念",
    "nav.open": "開源",
    "nav.contact": "聯繫",
    "nav.cta": "預約溝通",
    "lang.label": "選擇語言",
    "hero.lede": "用 AI 重新定義汽車零售與售後怎麼被經營。",
    "hero.ctaPrimary": "預約溝通",
    "hero.ctaSecondary": "了解產品",
    "hero.imgAlt": "蘭芯雲朵產品能力總覽介面",
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
    "tact.img1": "TACT 數字工單",
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
    "beliefs.imgAlt": "蘭芯雲朵信念：可信數據、責任動作、可解釋與契約門禁",
    "beliefs.b1": "<strong>AI 的第一份工作不是畫圖，</strong>是決定哪些數據值得相信。",
    "beliefs.b2": "<strong>看見風險還不夠，</strong>必須把動作送到正確崗位。",
    "beliefs.b3": "<strong>自動化必須可解釋、可審計；</strong>高風險動作保留人工與 Owner 確認。",
    "beliefs.b4": "<strong>先在真實業務跑通，</strong>再用契約把門，再談規模化開通。",
    "open.title": "在 GitHub 上跟隨我們",
    "open.desc": "公開倉庫歡迎閱讀與討論；生產鏈路保持私有。訓練場與契約倉是理解蘭芯的最佳入口。",
    "repo.org": "組織主頁與 Overview",
    "repo.tact": "車間編排 Phase 0 契約",
    "repo.lh": "線索模型訓練場",
    "repo.expense": "訂閱資產與報銷",
    "contact.title": "需要進一步了解？",
    "contact.lede": "經銷商合作、產品演示或技術交流，我們很樂意聊聊。",
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
    "footer.copy": "Copyright © 2026 蘭芯雲朵. 保留所有權利.",
  },
  en: {
    "meta.title": "LAN Cloud AI",
    "meta.description":
      "LAN Cloud AI redefines automotive retail and aftersales with AI: see public signals, understand customer relationships, orchestrate workshop flow.",
    "nav.brand": "LAN Cloud AI",
    "nav.products": "Products",
    "nav.method": "Method",
    "nav.beliefs": "Beliefs",
    "nav.open": "Open Source",
    "nav.contact": "Contact",
    "nav.cta": "Talk to us",
    "lang.label": "Language",
    "hero.lede": "AI that redefines how automotive retail and aftersales are run.",
    "hero.ctaPrimary": "Talk to us",
    "hero.ctaSecondary": "Explore products",
    "hero.imgAlt": "LAN Cloud AI product capability overview",
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
    "lh.img1": "LeadsHunter public battlefield dashboard",
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
    "beliefs.imgAlt":
      "LAN Cloud AI beliefs: trusted data, accountable action, explainability, contractual gates",
    "beliefs.b1":
      "<strong>AI's first job isn't drawing.</strong> It's deciding which data deserves trust.",
    "beliefs.b2":
      "<strong>Seeing risk isn't enough.</strong> The action must reach the right role.",
    "beliefs.b3":
      "<strong>Automation must be explainable and auditable;</strong> high-risk actions keep humans and owners in the loop.",
    "beliefs.b4":
      "<strong>Prove it in real operations first,</strong> gate with contracts, then talk about scale.",
    "open.title": "Follow us on GitHub",
    "open.desc":
      "Public repos are open for reading and discussion; production paths stay private. The training ground and contract kit are the best way in.",
    "repo.org": "Organization home and overview",
    "repo.tact": "Workshop orchestration Phase 0 contracts",
    "repo.lh": "Lead-model training ground",
    "repo.expense": "Subscription assets and expenses",
    "contact.title": "Want to go further?",
    "contact.lede":
      "Dealer partnerships, product demos, or technical conversations — we're happy to talk.",
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
    "footer.copy": "Copyright © 2026 LAN Cloud AI. All rights reserved.",
  },
};

const htmlLang = {
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  en: "en",
};

export const applyI18n = (locale = resolveLocale()) => {
  const resolved = dict[locale] ? locale : "zh-Hans";
  const table = dict[resolved];
  document.documentElement.lang = htmlLang[resolved] || "zh-CN";
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

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && title) ogTitle.setAttribute("content", title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && table["meta.description"]) ogDesc.setAttribute("content", table["meta.description"]);

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

export const setLocale = (locale) => {
  const next = dict[locale] ? locale : "zh-Hans";
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  return applyI18n(next);
};
