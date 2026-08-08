const allowedStageKeys = Object.freeze({
  初阶: "foundation",
  中阶: "prototype",
  高阶: "delivery",
});

const publicCourseRecords = [
  {
    number: "01",
    stage: "初阶",
    title: "AI、大模型与Agent：基本概念与安全使用",
    summaryObjectives: [
      "能区分常见AI处理方式并判断任务适用边界。",
      "能识别AI输出中的幻觉、隐私与过度依赖风险并设计核验方法。",
    ],
    summaryOutput: "十个术语的场景化解释、任务处理方式判断，以及三项AI风险核验方案。",
  },
  {
    number: "02",
    stage: "初阶",
    title: "把工作讲清楚：Agent任务设计与上下文管理",
    summaryObjectives: [
      "能把模糊工作要求改写为具备输入、规则和完成条件的Agent任务。",
      "能筛选任务所需上下文并设置追问、暂停和人工接管条件。",
    ],
    summaryOutput: "三项可执行Agent任务、上下文筛选结果、周报输出结构与前后结果对比。",
  },
  {
    number: "03",
    stage: "初阶",
    title: "把工作跑起来：工作流设计与工具调用",
    summaryObjectives: [
      "能把日常工作拆解为步骤、判断、工具调用和异常路径。",
      "能为多步骤Agent定义工具契约并测试关键异常处理。",
    ],
    summaryOutput: "销售跟进任务工作流、三项工具说明，以及地区缺失、重复和发送失败测试记录。",
  },
  {
    number: "04",
    stage: "初阶",
    title: "做出第一个可验证的AI办公应用",
    summaryObjectives: [
      "能构建包含输入、处理、输出和人工确认的基础AI办公应用。",
      "能设计覆盖正常、边界、异常和恶意场景的测试并据此修订问题。",
    ],
    summaryOutput: "可运行的会议纪要待办提取器、至少八个测试案例、失败记录与修订后版本。",
  },
  {
    number: "05",
    stage: "中阶",
    title: "FDE到底做什么：角色、边界与交付闭环",
    summaryObjectives: [
      "能说明FDE在客户、产品与技术协作中的角色边界和责任分工。",
      "能判断项目阶段并安排从问题发现到业务采用的交付重点。",
    ],
    summaryOutput: "项目责任分配、阶段判断、FDE前两周行动安排与需求边界处理方案。",
  },
  {
    number: "06",
    stage: "中阶",
    title: "找到真问题：客户访谈与业务问题定义",
    summaryObjectives: [
      "能设计访谈计划并通过提问、追问和观察收集真实业务证据。",
      "能区分事实、意见、需求和假设并形成可验证的问题定义。",
    ],
    summaryOutput: "报销审批访谈方案、结构化访谈记录，以及有证据支持的问题定义和验证计划。",
  },
  {
    number: "07",
    stage: "中阶",
    title: "看懂业务怎么运转：流程、指标与数据发现",
    summaryObjectives: [
      "能还原真实业务流程并定位等待、返工、重复和责任断点。",
      "能设计业务指标并盘点关键数据的来源、质量和访问边界。",
    ],
    summaryOutput: "真实报销流程、流程问题标注、一个结果指标、三个过程指标与数据可用性盘点。",
  },
  {
    number: "08",
    stage: "中阶",
    title: "选对场景、收住范围：MVP与验收标准",
    summaryObjectives: [
      "能比较AI场景的价值、可行性和风险并明确业务结果。",
      "能收敛MVP范围并编写可执行、可测试的验收标准。",
    ],
    summaryOutput: "场景优先级结论、目标用户与业务结果、MVP最小闭环及可测试验收条件。",
  },
  {
    number: "09",
    stage: "中阶",
    title: "从需求到Modules：基本功能拆解与模块边界",
    summaryObjectives: [
      "能把业务流程拆成职责清晰、可独立验证的基本功能Module。",
      "能定义Module的输入、输出、规则和依赖并检查边界问题。",
    ],
    summaryOutput: "会议待办功能分解树、五至七个Module地图及两个Module的边界定义。",
  },
  {
    number: "10",
    stage: "中阶",
    title: "看懂一个全栈应用：前端、后端、数据与AI",
    summaryObjectives: [
      "能解释前端、后端、数据、AI和外部服务在应用中的职责。",
      "能追踪用户请求的全栈链路并初步定位问题所在层次。",
    ],
    summaryOutput: "全栈组件标注、完整请求链路、Module分层结果与错误位置判断。",
  },
  {
    number: "11",
    stage: "中阶",
    title: "让模块连接起来：接口与系统集成基础",
    summaryObjectives: [
      "能编写基础接口说明并使用接口在模块或系统间传递数据。",
      "能依据状态码和错误信息处理认证、超时与调用失败问题。",
    ],
    summaryOutput: "工单接口说明、接口调用测试、两个Module的数据契约与失败处理。",
  },
  {
    number: "12",
    stage: "中阶",
    title: "用规格指挥AI开发：按模块实现基本功能",
    summaryObjectives: [
      "能为单个Module编写可执行的功能规格并拆分可验证任务。",
      "能按研究、计划、实现、测试和修改流程使用AI编码工具并审查结果。",
    ],
    summaryOutput: "三个Module功能规格、一个可运行核心Module、测试结果与代码限制说明。",
  },
  {
    number: "13",
    stage: "中阶",
    title: "让应用稳定运行：环境、部署与运维基础",
    summaryObjectives: [
      "能配置并启动基础全栈应用并区分不同运行环境。",
      "能使用健康检查、日志、备份和回退操作处置基础运行问题。",
    ],
    summaryOutput: "可运行教学应用、配置故障定位、备份回退结果与基础运行步骤。",
  },
  {
    number: "14",
    stage: "中阶",
    title: "中阶综合实战：交付一个模块化全栈MVP",
    summaryObjectives: [
      "能在限定时间内完成问题定义、MVP范围与Module设计。",
      "能交付并测试可部署的全栈MVP，再依据客户试用证据迭代。",
    ],
    summaryOutput: "问题与范围定义、Module地图、可部署全栈MVP、客户试用与修订版本。",
  },
  {
    number: "15",
    stage: "高阶",
    title: "把业务说成统一语言：对象、关系、事件与状态",
    summaryObjectives: [
      "能识别业务对象、关系、事件和状态并区分其与流程、Module和数据表的边界。",
      "能用实例和反例验证领域模型及对象生命周期转换条件。",
    ],
    summaryOutput: "领域对象模型、状态生命周期、Module映射及边界案例验证记录。",
  },
  {
    number: "16",
    stage: "高阶",
    title: "让系统做对决定：规则、权限、行动与反馈",
    summaryObjectives: [
      "能定义业务决策所需输入、判断方式、结果和权限边界。",
      "能设计覆盖不确定、重复、失败和结果回写的决策执行闭环。",
    ],
    summaryOutput: "两个业务决策定义、权限风险、行动方案与状态回写闭环。",
  },
  {
    number: "17",
    stage: "高阶",
    title: "从模块化MVP到生产架构：可靠集成与故障边界",
    summaryObjectives: [
      "能把模块化MVP扩展为包含关键依赖与故障边界的生产架构。",
      "能设计超时、重试、幂等、降级和人工接管等可靠性措施。",
    ],
    summaryOutput: "生产架构图、Module组件映射、可靠性方案、故障推演与双版本说明。",
  },
  {
    number: "18",
    stage: "高阶",
    title: "给AI装上安全边界：隐私、权限与攻击防护",
    summaryObjectives: [
      "能识别AI应用中的安全和隐私风险并按最小权限原则设计控制。",
      "能构建输入、输出、权限和人工审批保护并说明审计证据与剩余风险。",
    ],
    summaryOutput: "安全风险清单、攻击测试、最小权限设计、审批流程与剩余风险说明。",
  },
  {
    number: "19",
    stage: "高阶",
    title: "证明系统可以上线：AI评测与发布治理",
    summaryObjectives: [
      "能建立覆盖业务、输出、过程和运行质量的AI评测体系。",
      "能管理关键版本并依据质量和运行证据作出发布、暂缓或回退决策。",
    ],
    summaryOutput: "十二个评测案例、多次运行与版本对比、发布版本记录及上线决策。",
  },
  {
    number: "20",
    stage: "高阶",
    title: "让系统真正被使用：客户交付、项目治理与价值验证",
    summaryObjectives: [
      "能面向业务、技术和管理角色沟通方案并制定边界清晰的试点计划。",
      "能设计采用支持机制并用使用行为和业务结果指导项目下一步。",
    ],
    summaryOutput: "业务与技术方案说明、试点计划、采用指标、阻力处理与项目决策。",
  },
  {
    number: "21",
    stage: "高阶",
    title: "毕业实战：生产就绪评审、客户答辩与故障演练",
    summaryObjectives: [
      "能整合业务、Module、架构、安全、评测和采用方案完成生产就绪评审。",
      "能完成故障处置、人工接管与客户答辩并提出明确项目后续建议。",
    ],
    summaryOutput: "端到端汇报、运行演示、生产答辩、故障处置与后续项目建议。",
  },
];

const definePublicCourse = ({ number, stage, title, summaryObjectives, summaryOutput }) =>
  Object.freeze({
    id: `lesson-${number}`,
    number,
    stage,
    stageKey: allowedStageKeys[stage],
    title,
    summaryObjectives: Object.freeze([...summaryObjectives]),
    summaryOutput,
    duration: "4课时",
  });

window.FDE_PUBLIC_COURSES = Object.freeze(publicCourseRecords.map(definePublicCourse));
