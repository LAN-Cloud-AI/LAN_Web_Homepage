/** Public FDE curriculum summaries by locale. */
export const FDE_PUBLIC_COURSES_BY_LOCALE = Object.freeze(
{
  "zh-Hans": [
    {
      "id": "lesson-01",
      "number": "01",
      "stageKey": "foundation",
      "title": "AI、大模型与Agent：基本概念与安全使用",
      "summaryObjectives": [
        "能区分常见AI处理方式并判断任务适用边界。",
        "能识别AI输出中的幻觉、隐私与过度依赖风险并设计核验方法。"
      ],
      "summaryOutput": "十个术语的场景化解释、任务处理方式判断，以及三项AI风险核验方案。",
      "duration": "4课时"
    },
    {
      "id": "lesson-02",
      "number": "02",
      "stageKey": "foundation",
      "title": "把工作讲清楚：Agent任务设计与上下文管理",
      "summaryObjectives": [
        "能把模糊工作要求改写为具备输入、规则和完成条件的Agent任务。",
        "能筛选任务所需上下文并设置追问、暂停和人工接管条件。"
      ],
      "summaryOutput": "三项可执行Agent任务、上下文筛选结果、周报输出结构与前后结果对比。",
      "duration": "4课时"
    },
    {
      "id": "lesson-03",
      "number": "03",
      "stageKey": "foundation",
      "title": "把工作跑起来：工作流设计与工具调用",
      "summaryObjectives": [
        "能把日常工作拆解为步骤、判断、工具调用和异常路径。",
        "能为多步骤Agent定义工具契约并测试关键异常处理。"
      ],
      "summaryOutput": "销售跟进任务工作流、三项工具说明，以及地区缺失、重复和发送失败测试记录。",
      "duration": "4课时"
    },
    {
      "id": "lesson-04",
      "number": "04",
      "stageKey": "foundation",
      "title": "做出第一个可验证的AI办公应用",
      "summaryObjectives": [
        "能构建包含输入、处理、输出和人工确认的基础AI办公应用。",
        "能设计覆盖正常、边界、异常和恶意场景的测试并据此修订问题。"
      ],
      "summaryOutput": "可运行的会议纪要待办提取器、至少八个测试案例、失败记录与修订后版本。",
      "duration": "4课时"
    },
    {
      "id": "lesson-05",
      "number": "05",
      "stageKey": "prototype",
      "title": "FDE到底做什么：角色、边界与交付闭环",
      "summaryObjectives": [
        "能说明FDE在客户、产品与技术协作中的角色边界和责任分工。",
        "能判断项目阶段并安排从问题发现到业务采用的交付重点。"
      ],
      "summaryOutput": "项目责任分配、阶段判断、FDE前两周行动安排与需求边界处理方案。",
      "duration": "4课时"
    },
    {
      "id": "lesson-06",
      "number": "06",
      "stageKey": "prototype",
      "title": "找到真问题：客户访谈与业务问题定义",
      "summaryObjectives": [
        "能设计访谈计划并通过提问、追问和观察收集真实业务证据。",
        "能区分事实、意见、需求和假设并形成可验证的问题定义。"
      ],
      "summaryOutput": "报销审批访谈方案、结构化访谈记录，以及有证据支持的问题定义和验证计划。",
      "duration": "4课时"
    },
    {
      "id": "lesson-07",
      "number": "07",
      "stageKey": "prototype",
      "title": "看懂业务怎么运转：流程、指标与数据发现",
      "summaryObjectives": [
        "能还原真实业务流程并定位等待、返工、重复和责任断点。",
        "能设计业务指标并盘点关键数据的来源、质量和访问边界。"
      ],
      "summaryOutput": "真实报销流程、流程问题标注、一个结果指标、三个过程指标与数据可用性盘点。",
      "duration": "4课时"
    },
    {
      "id": "lesson-08",
      "number": "08",
      "stageKey": "prototype",
      "title": "选对场景、收住范围：MVP与验收标准",
      "summaryObjectives": [
        "能比较AI场景的价值、可行性和风险并明确业务结果。",
        "能收敛MVP范围并编写可执行、可测试的验收标准。"
      ],
      "summaryOutput": "场景优先级结论、目标用户与业务结果、MVP最小闭环及可测试验收条件。",
      "duration": "4课时"
    },
    {
      "id": "lesson-09",
      "number": "09",
      "stageKey": "prototype",
      "title": "从需求到Modules：基本功能拆解与模块边界",
      "summaryObjectives": [
        "能把业务流程拆成职责清晰、可独立验证的基本功能Module。",
        "能定义Module的输入、输出、规则和依赖并检查边界问题。"
      ],
      "summaryOutput": "会议待办功能分解树、五至七个Module地图及两个Module的边界定义。",
      "duration": "4课时"
    },
    {
      "id": "lesson-10",
      "number": "10",
      "stageKey": "prototype",
      "title": "看懂一个全栈应用：前端、后端、数据与AI",
      "summaryObjectives": [
        "能解释前端、后端、数据、AI和外部服务在应用中的职责。",
        "能追踪用户请求的全栈链路并初步定位问题所在层次。"
      ],
      "summaryOutput": "全栈组件标注、完整请求链路、Module分层结果与错误位置判断。",
      "duration": "4课时"
    },
    {
      "id": "lesson-11",
      "number": "11",
      "stageKey": "prototype",
      "title": "让模块连接起来：接口与系统集成基础",
      "summaryObjectives": [
        "能编写基础接口说明并使用接口在模块或系统间传递数据。",
        "能依据状态码和错误信息处理认证、超时与调用失败问题。"
      ],
      "summaryOutput": "工单接口说明、接口调用测试、两个Module的数据契约与失败处理。",
      "duration": "4课时"
    },
    {
      "id": "lesson-12",
      "number": "12",
      "stageKey": "prototype",
      "title": "用规格指挥AI开发：按模块实现基本功能",
      "summaryObjectives": [
        "能为单个Module编写可执行的功能规格并拆分可验证任务。",
        "能按研究、计划、实现、测试和修改流程使用AI编码工具并审查结果。"
      ],
      "summaryOutput": "三个Module功能规格、一个可运行核心Module、测试结果与代码限制说明。",
      "duration": "4课时"
    },
    {
      "id": "lesson-13",
      "number": "13",
      "stageKey": "prototype",
      "title": "让应用稳定运行：环境、部署与运维基础",
      "summaryObjectives": [
        "能配置并启动基础全栈应用并区分不同运行环境。",
        "能使用健康检查、日志、备份和回退操作处置基础运行问题。"
      ],
      "summaryOutput": "可运行教学应用、配置故障定位、备份回退结果与基础运行步骤。",
      "duration": "4课时"
    },
    {
      "id": "lesson-14",
      "number": "14",
      "stageKey": "prototype",
      "title": "中阶综合实战：交付一个模块化全栈MVP",
      "summaryObjectives": [
        "能在限定时间内完成问题定义、MVP范围与Module设计。",
        "能交付并测试可部署的全栈MVP，再依据客户试用证据迭代。"
      ],
      "summaryOutput": "问题与范围定义、Module地图、可部署全栈MVP、客户试用与修订版本。",
      "duration": "4课时"
    },
    {
      "id": "lesson-15",
      "number": "15",
      "stageKey": "delivery",
      "title": "把业务说成统一语言：对象、关系、事件与状态",
      "summaryObjectives": [
        "能识别业务对象、关系、事件和状态并区分其与流程、Module和数据表的边界。",
        "能用实例和反例验证领域模型及对象生命周期转换条件。"
      ],
      "summaryOutput": "领域对象模型、状态生命周期、Module映射及边界案例验证记录。",
      "duration": "4课时"
    },
    {
      "id": "lesson-16",
      "number": "16",
      "stageKey": "delivery",
      "title": "让系统做对决定：规则、权限、行动与反馈",
      "summaryObjectives": [
        "能定义业务决策所需输入、判断方式、结果和权限边界。",
        "能设计覆盖不确定、重复、失败和结果回写的决策执行闭环。"
      ],
      "summaryOutput": "两个业务决策定义、权限风险、行动方案与状态回写闭环。",
      "duration": "4课时"
    },
    {
      "id": "lesson-17",
      "number": "17",
      "stageKey": "delivery",
      "title": "从模块化MVP到生产架构：可靠集成与故障边界",
      "summaryObjectives": [
        "能把模块化MVP扩展为包含关键依赖与故障边界的生产架构。",
        "能设计超时、重试、幂等、降级和人工接管等可靠性措施。"
      ],
      "summaryOutput": "生产架构图、Module组件映射、可靠性方案、故障推演与双版本说明。",
      "duration": "4课时"
    },
    {
      "id": "lesson-18",
      "number": "18",
      "stageKey": "delivery",
      "title": "给AI装上安全边界：隐私、权限与攻击防护",
      "summaryObjectives": [
        "能识别AI应用中的安全和隐私风险并按最小权限原则设计控制。",
        "能构建输入、输出、权限和人工审批保护并说明审计证据与剩余风险。"
      ],
      "summaryOutput": "安全风险清单、攻击测试、最小权限设计、审批流程与剩余风险说明。",
      "duration": "4课时"
    },
    {
      "id": "lesson-19",
      "number": "19",
      "stageKey": "delivery",
      "title": "证明系统可以上线：AI评测与发布治理",
      "summaryObjectives": [
        "能建立覆盖业务、输出、过程和运行质量的AI评测体系。",
        "能管理关键版本并依据质量和运行证据作出发布、暂缓或回退决策。"
      ],
      "summaryOutput": "十二个评测案例、多次运行与版本对比、发布版本记录及上线决策。",
      "duration": "4课时"
    },
    {
      "id": "lesson-20",
      "number": "20",
      "stageKey": "delivery",
      "title": "让系统真正被使用：客户交付、项目治理与价值验证",
      "summaryObjectives": [
        "能面向业务、技术和管理角色沟通方案并制定边界清晰的试点计划。",
        "能设计采用支持机制并用使用行为和业务结果指导项目下一步。"
      ],
      "summaryOutput": "业务与技术方案说明、试点计划、采用指标、阻力处理与项目决策。",
      "duration": "4课时"
    },
    {
      "id": "lesson-21",
      "number": "21",
      "stageKey": "delivery",
      "title": "毕业实战：生产就绪评审、客户答辩与故障演练",
      "summaryObjectives": [
        "能整合业务、Module、架构、安全、评测和采用方案完成生产就绪评审。",
        "能完成故障处置、人工接管与客户答辩并提出明确项目后续建议。"
      ],
      "summaryOutput": "端到端汇报、运行演示、生产答辩、故障处置与后续项目建议。",
      "duration": "4课时"
    }
  ],
  "zh-Hant": [
    {
      "id": "lesson-01",
      "number": "01",
      "stageKey": "foundation",
      "title": "AI、大模型與Agent：基本概念與安全使用",
      "summaryObjectives": [
        "能區分常見AI處理方式並判斷任務適用邊界。",
        "能識別AI輸出中的幻覺、隱私與過度依賴風險並設計核驗方法。"
      ],
      "summaryOutput": "十個術語的場景化解釋、任務處理方式判斷，以及三項AI風險核驗方案。",
      "duration": "4課時"
    },
    {
      "id": "lesson-02",
      "number": "02",
      "stageKey": "foundation",
      "title": "把工作講清楚：Agent任務設計與上下文管理",
      "summaryObjectives": [
        "能把模糊工作要求改寫爲具備輸入、規則和完成條件的Agent任務。",
        "能篩選任務所需上下文並設置追問、暫停和人工接管條件。"
      ],
      "summaryOutput": "三項可執行Agent任務、上下文篩選結果、周報輸出結構與前後結果對比。",
      "duration": "4課時"
    },
    {
      "id": "lesson-03",
      "number": "03",
      "stageKey": "foundation",
      "title": "把工作跑起來：工作流設計與工具調用",
      "summaryObjectives": [
        "能把日常工作拆解爲步驟、判斷、工具調用和異常路徑。",
        "能爲多步驟Agent定義工具契約並測試關鍵異常處理。"
      ],
      "summaryOutput": "銷售跟進任務工作流、三項工具說明，以及地區缺失、重複和發送失敗測試記錄。",
      "duration": "4課時"
    },
    {
      "id": "lesson-04",
      "number": "04",
      "stageKey": "foundation",
      "title": "做出第一個可驗證的AI辦公應用",
      "summaryObjectives": [
        "能構建包含輸入、處理、輸出和人工確認的基礎AI辦公應用。",
        "能設計覆蓋正常、邊界、異常和惡意場景的測試並據此修訂問題。"
      ],
      "summaryOutput": "可運行的會議紀要待辦提取器、至少八個測試案例、失敗記錄與修訂後版本。",
      "duration": "4課時"
    },
    {
      "id": "lesson-05",
      "number": "05",
      "stageKey": "prototype",
      "title": "FDE到底做什麼：角色、邊界與交付閉環",
      "summaryObjectives": [
        "能說明FDE在客戶、產品與技術協作中的角色邊界和責任分工。",
        "能判斷項目階段並安排從問題發現到業務採用的交付重點。"
      ],
      "summaryOutput": "項目責任分配、階段判斷、FDE前兩周行動安排與需求邊界處理方案。",
      "duration": "4課時"
    },
    {
      "id": "lesson-06",
      "number": "06",
      "stageKey": "prototype",
      "title": "找到真問題：客戶訪談與業務問題定義",
      "summaryObjectives": [
        "能設計訪談計劃並通過提問、追問和觀察收集真實業務證據。",
        "能區分事實、意見、需求和假設並形成可驗證的問題定義。"
      ],
      "summaryOutput": "報銷審批訪談方案、結構化訪談記錄，以及有證據支持的問題定義和驗證計劃。",
      "duration": "4課時"
    },
    {
      "id": "lesson-07",
      "number": "07",
      "stageKey": "prototype",
      "title": "看懂業務怎麼運轉：流程、指標與數據發現",
      "summaryObjectives": [
        "能還原真實業務流程並定位等待、返工、重複和責任斷點。",
        "能設計業務指標並盤點關鍵數據的來源、質量和訪問邊界。"
      ],
      "summaryOutput": "真實報銷流程、流程問題標註、一個結果指標、三個過程指標與數據可用性盤點。",
      "duration": "4課時"
    },
    {
      "id": "lesson-08",
      "number": "08",
      "stageKey": "prototype",
      "title": "選對場景、收住範圍：MVP與驗收標準",
      "summaryObjectives": [
        "能比較AI場景的價值、可行性和風險並明確業務結果。",
        "能收斂MVP範圍並編寫可執行、可測試的驗收標準。"
      ],
      "summaryOutput": "場景優先級結論、目標用戶與業務結果、MVP最小閉環及可測試驗收條件。",
      "duration": "4課時"
    },
    {
      "id": "lesson-09",
      "number": "09",
      "stageKey": "prototype",
      "title": "從需求到Modules：基本功能拆解與模塊邊界",
      "summaryObjectives": [
        "能把業務流程拆成職責清晰、可獨立驗證的基本功能Module。",
        "能定義Module的輸入、輸出、規則和依賴並檢查邊界問題。"
      ],
      "summaryOutput": "會議待辦功能分解樹、五至七個Module地圖及兩個Module的邊界定義。",
      "duration": "4課時"
    },
    {
      "id": "lesson-10",
      "number": "10",
      "stageKey": "prototype",
      "title": "看懂一個全棧應用：前端、後端、數據與AI",
      "summaryObjectives": [
        "能解釋前端、後端、數據、AI和外部服務在應用中的職責。",
        "能追蹤用戶請求的全棧鏈路並初步定位問題所在層次。"
      ],
      "summaryOutput": "全棧組件標註、完整請求鏈路、Module分層結果與錯誤位置判斷。",
      "duration": "4課時"
    },
    {
      "id": "lesson-11",
      "number": "11",
      "stageKey": "prototype",
      "title": "讓模塊連接起來：接口與系統集成基礎",
      "summaryObjectives": [
        "能編寫基礎接口說明並使用接口在模塊或系統間傳遞數據。",
        "能依據狀態碼和錯誤信息處理認證、超時與調用失敗問題。"
      ],
      "summaryOutput": "工單接口說明、接口調用測試、兩個Module的數據契約與失敗處理。",
      "duration": "4課時"
    },
    {
      "id": "lesson-12",
      "number": "12",
      "stageKey": "prototype",
      "title": "用規格指揮AI開發：按模塊實現基本功能",
      "summaryObjectives": [
        "能爲單個Module編寫可執行的功能規格並拆分可驗證任務。",
        "能按研究、計劃、實現、測試和修改流程使用AI編碼工具並審查結果。"
      ],
      "summaryOutput": "三個Module功能規格、一個可運行核心Module、測試結果與代碼限制說明。",
      "duration": "4課時"
    },
    {
      "id": "lesson-13",
      "number": "13",
      "stageKey": "prototype",
      "title": "讓應用穩定運行：環境、部署與運維基礎",
      "summaryObjectives": [
        "能配置並啓動基礎全棧應用並區分不同運行環境。",
        "能使用健康檢查、日誌、備份和回退操作處置基礎運行問題。"
      ],
      "summaryOutput": "可運行教學應用、配置故障定位、備份回退結果與基礎運行步驟。",
      "duration": "4課時"
    },
    {
      "id": "lesson-14",
      "number": "14",
      "stageKey": "prototype",
      "title": "中階綜合實戰：交付一個模塊化全棧MVP",
      "summaryObjectives": [
        "能在限定時間內完成問題定義、MVP範圍與Module設計。",
        "能交付並測試可部署的全棧MVP，再依據客戶試用證據迭代。"
      ],
      "summaryOutput": "問題與範圍定義、Module地圖、可部署全棧MVP、客戶試用與修訂版本。",
      "duration": "4課時"
    },
    {
      "id": "lesson-15",
      "number": "15",
      "stageKey": "delivery",
      "title": "把業務說成統一語言：對象、關係、事件與狀態",
      "summaryObjectives": [
        "能識別業務對象、關係、事件和狀態並區分其與流程、Module和數據表的邊界。",
        "能用實例和反例驗證領域模型及對象生命周期轉換條件。"
      ],
      "summaryOutput": "領域對象模型、狀態生命周期、Module映射及邊界案例驗證記錄。",
      "duration": "4課時"
    },
    {
      "id": "lesson-16",
      "number": "16",
      "stageKey": "delivery",
      "title": "讓系統做對決定：規則、權限、行動與反饋",
      "summaryObjectives": [
        "能定義業務決策所需輸入、判斷方式、結果和權限邊界。",
        "能設計覆蓋不確定、重複、失敗和結果回寫的決策執行閉環。"
      ],
      "summaryOutput": "兩個業務決策定義、權限風險、行動方案與狀態回寫閉環。",
      "duration": "4課時"
    },
    {
      "id": "lesson-17",
      "number": "17",
      "stageKey": "delivery",
      "title": "從模塊化MVP到生產架構：可靠集成與故障邊界",
      "summaryObjectives": [
        "能把模塊化MVP擴展爲包含關鍵依賴與故障邊界的生產架構。",
        "能設計超時、重試、冪等、降級和人工接管等可靠性措施。"
      ],
      "summaryOutput": "生產架構圖、Module組件映射、可靠性方案、故障推演與雙版本說明。",
      "duration": "4課時"
    },
    {
      "id": "lesson-18",
      "number": "18",
      "stageKey": "delivery",
      "title": "給AI裝上安全邊界：隱私、權限與攻擊防護",
      "summaryObjectives": [
        "能識別AI應用中的安全和隱私風險並按最小權限原則設計控制。",
        "能構建輸入、輸出、權限和人工審批保護並說明審計證據與剩餘風險。"
      ],
      "summaryOutput": "安全風險清單、攻擊測試、最小權限設計、審批流程與剩餘風險說明。",
      "duration": "4課時"
    },
    {
      "id": "lesson-19",
      "number": "19",
      "stageKey": "delivery",
      "title": "證明系統可以上線：AI評測與發布治理",
      "summaryObjectives": [
        "能建立覆蓋業務、輸出、過程和運行質量的AI評測體系。",
        "能管理關鍵版本並依據質量和運行證據作出發布、暫緩或回退決策。"
      ],
      "summaryOutput": "十二個評測案例、多次運行與版本對比、發布版本記錄及上線決策。",
      "duration": "4課時"
    },
    {
      "id": "lesson-20",
      "number": "20",
      "stageKey": "delivery",
      "title": "讓系統真正被使用：客戶交付、項目治理與價值驗證",
      "summaryObjectives": [
        "能面向業務、技術和管理角色溝通方案並制定邊界清晰的試點計劃。",
        "能設計採用支持機制並用使用行爲和業務結果指導項目下一步。"
      ],
      "summaryOutput": "業務與技術方案說明、試點計劃、採用指標、阻力處理與項目決策。",
      "duration": "4課時"
    },
    {
      "id": "lesson-21",
      "number": "21",
      "stageKey": "delivery",
      "title": "畢業實戰：生產就緒評審、客戶答辯與故障演練",
      "summaryObjectives": [
        "能整合業務、Module、架構、安全、評測和採用方案完成生產就緒評審。",
        "能完成故障處置、人工接管與客戶答辯並提出明確項目後續建議。"
      ],
      "summaryOutput": "端到端匯報、運行演示、生產答辯、故障處置與後續項目建議。",
      "duration": "4課時"
    }
  ],
  "en": [
    {
      "id": "lesson-01",
      "number": "01",
      "stageKey": "foundation",
      "title": "AI, LLMs, and agents: concepts and safe use",
      "summaryObjectives": [
        "Distinguish common AI approaches and decide when a task is a good fit.",
        "Spot hallucination, privacy, and over-reliance risks, then design verification methods."
      ],
      "summaryOutput": "Scenario explanations for ten terms, task-fit judgments, and three AI risk-check plans.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-02",
      "number": "02",
      "stageKey": "foundation",
      "title": "Make work clear: agent task design and context",
      "summaryObjectives": [
        "Rewrite vague work into agent tasks with inputs, rules, and done criteria.",
        "Select required context and set ask-back, pause, and human-handoff conditions."
      ],
      "summaryOutput": "Three executable agent tasks, context filters, a weekly-report structure, and before/after comparisons.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-03",
      "number": "03",
      "stageKey": "foundation",
      "title": "Make work run: workflow design and tool use",
      "summaryObjectives": [
        "Break daily work into steps, decisions, tool calls, and exception paths.",
        "Define tool contracts for multi-step agents and test key failure handling."
      ],
      "summaryOutput": "A sales follow-up workflow, three tool specs, and tests for missing region, duplicates, and send failures.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-04",
      "number": "04",
      "stageKey": "foundation",
      "title": "Build your first verifiable AI office app",
      "summaryObjectives": [
        "Build a basic AI office app with input, processing, output, and human confirmation.",
        "Design tests for normal, edge, failure, and malicious cases, then revise from results."
      ],
      "summaryOutput": "A runnable meeting-notes action extractor, at least eight test cases, failure notes, and a revised version.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-05",
      "number": "05",
      "stageKey": "prototype",
      "title": "What an FDE actually does: role, boundaries, delivery",
      "summaryObjectives": [
        "Explain FDE role boundaries across customer, product, and engineering collaboration.",
        "Judge project stage and prioritize delivery from discovery to business adoption."
      ],
      "summaryOutput": "Responsibility map, stage judgment, first-two-week FDE plan, and scope-boundary handling.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-06",
      "number": "06",
      "stageKey": "prototype",
      "title": "Find the real problem: interviews and problem definition",
      "summaryObjectives": [
        "Design interview plans and gather real business evidence through questions and observation.",
        "Separate facts, opinions, needs, and assumptions into a verifiable problem definition."
      ],
      "summaryOutput": "An expense-approval interview plan, structured notes, and an evidence-backed problem definition with validation plan.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-07",
      "number": "07",
      "stageKey": "prototype",
      "title": "See how the business runs: process, metrics, data",
      "summaryObjectives": [
        "Reconstruct a real process and locate waits, rework, duplication, and ownership breaks.",
        "Design business metrics and inventory data sources, quality, and access boundaries."
      ],
      "summaryOutput": "A real expense process map, issue annotations, one outcome metric, three process metrics, and a data-availability inventory.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-08",
      "number": "08",
      "stageKey": "prototype",
      "title": "Choose the scene and bound the MVP",
      "summaryObjectives": [
        "Compare AI scenes by value, feasibility, and risk, then state the business outcome.",
        "Converge MVP scope and write executable, testable acceptance criteria."
      ],
      "summaryOutput": "Scene priority, target users and outcomes, a minimal MVP loop, and testable acceptance conditions.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-09",
      "number": "09",
      "stageKey": "prototype",
      "title": "From needs to modules: function breakdown and boundaries",
      "summaryObjectives": [
        "Split a business flow into clear, independently verifiable modules.",
        "Define module inputs, outputs, rules, and dependencies, then check boundary issues."
      ],
      "summaryOutput": "A meeting-action breakdown tree, a five-to-seven module map, and boundary definitions for two modules.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-10",
      "number": "10",
      "stageKey": "prototype",
      "title": "Read a full-stack app: front end, back end, data, AI",
      "summaryObjectives": [
        "Explain the roles of front end, back end, data, AI, and external services.",
        "Trace a user request across the stack and locate likely failure layers."
      ],
      "summaryOutput": "Component annotations, a full request path, module layering, and error-location judgment.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-11",
      "number": "11",
      "stageKey": "prototype",
      "title": "Connect modules: APIs and system integration basics",
      "summaryObjectives": [
        "Write basic API specs and move data between modules or systems.",
        "Handle auth, timeout, and call failures using status codes and error info."
      ],
      "summaryOutput": "A work-order API note, call tests, data contracts for two modules, and failure handling.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-12",
      "number": "12",
      "stageKey": "prototype",
      "title": "Steer AI coding with specs: implement module by module",
      "summaryObjectives": [
        "Write executable specs for one module and split verifiable tasks.",
        "Use an AI coding workflow of research, plan, implement, test, and revise, then review results."
      ],
      "summaryOutput": "Specs for three modules, one runnable core module, test results, and code-limit notes.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-13",
      "number": "13",
      "stageKey": "prototype",
      "title": "Keep the app running: environments, deploy, ops basics",
      "summaryObjectives": [
        "Configure and start a basic full-stack app across environments.",
        "Use health checks, logs, backups, and rollback for basic runtime issues."
      ],
      "summaryOutput": "A runnable teaching app, config-fault localization, backup/rollback results, and basic run steps.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-14",
      "number": "14",
      "stageKey": "prototype",
      "title": "Mid-level studio: ship a modular full-stack MVP",
      "summaryObjectives": [
        "Finish problem definition, MVP scope, and module design under time limits.",
        "Deliver and test a deployable full-stack MVP, then iterate from customer trial evidence."
      ],
      "summaryOutput": "Problem and scope definition, module map, deployable MVP, customer trial, and revised version.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-15",
      "number": "15",
      "stageKey": "delivery",
      "title": "One business language: objects, relations, events, state",
      "summaryObjectives": [
        "Identify objects, relations, events, and state, and separate them from process, modules, and tables.",
        "Validate the domain model and lifecycle transitions with examples and counterexamples."
      ],
      "summaryOutput": "A domain object model, state lifecycle, module mapping, and boundary-case validation notes.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-16",
      "number": "16",
      "stageKey": "delivery",
      "title": "Help the system decide well: rules, permissions, action, feedback",
      "summaryObjectives": [
        "Define the inputs, judgment method, outcomes, and permission bounds for business decisions.",
        "Design a decision loop covering uncertainty, duplication, failure, and result write-back."
      ],
      "summaryOutput": "Two decision definitions, permission risks, action plans, and a state write-back loop.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-17",
      "number": "17",
      "stageKey": "delivery",
      "title": "From modular MVP to production architecture",
      "summaryObjectives": [
        "Extend a modular MVP into a production architecture with key dependencies and failure bounds.",
        "Design reliability measures such as timeout, retry, idempotency, degrade, and human takeover."
      ],
      "summaryOutput": "A production architecture diagram, module-component map, reliability plan, failure drill, and dual-version notes.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-18",
      "number": "18",
      "stageKey": "delivery",
      "title": "Put safety bounds on AI: privacy, permissions, attack defense",
      "summaryObjectives": [
        "Identify security and privacy risks in AI apps and design least-privilege controls.",
        "Build input/output/permission/approval protections and state audit evidence plus residual risk."
      ],
      "summaryOutput": "A security risk list, attack tests, least-privilege design, approval flow, and residual-risk notes.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-19",
      "number": "19",
      "stageKey": "delivery",
      "title": "Prove it can ship: AI evaluation and release governance",
      "summaryObjectives": [
        "Build an AI evaluation system covering business, output, process, and runtime quality.",
        "Manage key versions and decide release, hold, or rollback from quality and runtime evidence."
      ],
      "summaryOutput": "Twelve evaluation cases, multi-run and version comparisons, release records, and a go-live decision.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-20",
      "number": "20",
      "stageKey": "delivery",
      "title": "Make the system actually used: delivery, governance, value",
      "summaryObjectives": [
        "Brief business, technical, and management roles and write a clear pilot plan.",
        "Design adoption support and use usage behavior plus business results to guide next steps."
      ],
      "summaryOutput": "Business and technical briefings, pilot plan, adoption metrics, resistance handling, and project decisions.",
      "duration": "4 hours"
    },
    {
      "id": "lesson-21",
      "number": "21",
      "stageKey": "delivery",
      "title": "Capstone: production readiness, customer defense, failure drill",
      "summaryObjectives": [
        "Integrate business, modules, architecture, security, evaluation, and adoption into a readiness review.",
        "Complete failure handling, human takeover, and customer defense with clear next-step recommendations."
      ],
      "summaryOutput": "End-to-end briefing, live demo, production defense, failure handling, and follow-on recommendations.",
      "duration": "4 hours"
    }
  ]
}
);

export const getFdePublicCourses = (locale = "zh-Hans") =>
  FDE_PUBLIC_COURSES_BY_LOCALE[locale] || FDE_PUBLIC_COURSES_BY_LOCALE["zh-Hans"];
