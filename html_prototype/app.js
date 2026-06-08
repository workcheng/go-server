const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const baseData = await fetch(`./data.json?v=${Date.now()}`).then((response) => response.json());

const STATUS_META = {
  normal: { label: "正常生产", tone: "green" },
  ready: { label: "可以开工", tone: "orange" },
  blocked: { label: "不满足条件", tone: "red" },
  inactive: { label: "未启用", tone: "gray" },
  severe: { label: "严重", tone: "red" },
  warning: { label: "警告", tone: "orange" },
  info: { label: "信息", tone: "blue" },
  done: { label: "已闭环", tone: "green" },
  pending: { label: "待处理", tone: "orange" }
};

const LEVELS = [
  { id: "plant", label: "厂房级" },
  { id: "line", label: "产线级" },
  { id: "station", label: "工位级" }
];

const VIEWS = [
  { id: "plan", label: "二维平面" },
  { id: "objects", label: "对象台账" },
  { id: "three", label: "3D接口" }
];

const ELEMENTS = [
  { id: "overview", icon: "overview", label: "总览", desc: "车间态势 / 架次 / 计划" },
  { id: "personnel", icon: "personnel", label: "人员", desc: "出勤 / 技能 / 上机率" },
  { id: "tooling", icon: "tooling", label: "工装", desc: "齐套 / 定检 / 可用" },
  { id: "material", icon: "material", label: "物料", desc: "缺件 / 配套 / 影响AO" },
  { id: "tools", icon: "tools", label: "工刀量", desc: "库存 / 借还 / 超期" },
  { id: "environment", icon: "environment", label: "环境", desc: "温湿度 / 阈值 / 点位" },
  { id: "video", icon: "video", label: "视频", desc: "摄像头 / 盲区 / 证据" }
];

const RIGHT_TABS = [
  { id: "kpi", label: "指标" },
  { id: "alerts", label: "异常" },
  { id: "resources", label: "资源" },
  { id: "trace", label: "追溯" },
  { id: "three", label: "3D接口" }
];

const BOTTOM_TABS = [
  { id: "aircraft", label: "在制架次" },
  { id: "station", label: "工位详情" },
  { id: "material", label: "缺料影响" },
  { id: "issues", label: "问题单" },
  { id: "burn", label: "燃尽/趋势" },
  { id: "test", label: "业务测试" }
];

const DATA = {
  plant: {
    id: "digital-workshop",
    label: "数字车间",
    workshop: "C919部装",
    domain: "数字车间 / 生产监控",
    summary: "继承旧平台数字车间的空间索引、生产要素菜单、右侧BI、弹窗清单和视频证据能力。",
    metrics: {
      yearPlanRate: "82.6%",
      monthPlanRate: "93.7%",
      dayAoRate: "40.29%",
      firstPassRate: "99.98%",
      thousandHourFault: "0.05",
      frrMonth: 14
    },
    aircraft: [
      { msn: "MSN00060", aircraftNo: "B-0012", model: "C919", customer: "东方航空", lineId: "C02", stationId: "S4", progress: 65, offlineDate: "2026-06-02", risk: "severe" },
      { msn: "MSN00061", aircraftNo: "B-0014", model: "C919", customer: "中国国航", lineId: "C02", stationId: "S5", progress: 73, offlineDate: "2026-06-05", risk: "warning" },
      { msn: "MSN00068", aircraftNo: "B-0043", model: "C919", customer: "南方航空", lineId: "C06", stationId: "S4", progress: 57, offlineDate: "2026-06-06", risk: "info" },
      { msn: "MSN00072", aircraftNo: "B-0051", model: "C919", customer: "金鹏航空", lineId: "C06", stationId: "S7", progress: 47, offlineDate: "2026-06-10", risk: "warning" }
    ],
    resources: [
      { label: "液压源", value: 48, unit: "%", tone: "red", source: "IoT/厂务动力" },
      { label: "压缩空气", value: 73, unit: "%", tone: "green", source: "IoT/厂务动力" },
      { label: "工装齐套", value: 91, unit: "%", tone: "green", source: "EAM/工装系统" },
      { label: "物料配套", value: 86, unit: "%", tone: "orange", source: "ERP/MRP/WMS" }
    ]
  },
  lines: [
    {
      id: "C02",
      label: "C02 总装产线",
      type: "C919部装",
      summary: "中机身与后机身对接节拍产线，S4液压源不足为当前主导阻断。",
      position: { left: 6, top: 16, width: 42, height: 48 },
      metrics: { aoTotal: 320, aoOpen: 74, aaoTotal: 912, aaoOpen: 231, disrOpen: 6, frrOpen: 4, planRate: 78 },
      stations: [
        { id: "S1", code: "200A", name: "前机身装配", segment: "前机身装配", msn: "MSN00058", aircraftNo: "B-0008", customer: "海航", status: "normal", progress: 65, aoTotal: 96, aoOpen: 11, aaoTotal: 312, aaoOpen: 58, aaoRate: 81, disrTotal: 5, disrOpen: 1, frrTotal: 3, frrOpen: 0, planInArchive: 12, planOutArchive: 2, planInWork: 8, planOutWork: 1, dailyPlan: 23, people: "8/9", skillGap: 0, materials: "齐套", tooling: "6/7", tools: "正常", env: "22.8℃ / 48%", camera: "在线", finish: "2026-05-29 16:30", x: 10, y: 25 },
        { id: "S2", code: "204", name: "翼身待接", segment: "翼身段对接", msn: "MSN00059", aircraftNo: "B-0010", customer: "国航", status: "ready", progress: 22, aoTotal: 104, aoOpen: 31, aaoTotal: 286, aaoOpen: 96, aaoRate: 66, disrTotal: 4, disrOpen: 2, frrTotal: 2, frrOpen: 1, planInArchive: 5, planOutArchive: 1, planInWork: 10, planOutWork: 3, dailyPlan: 19, people: "9/9", skillGap: 0, materials: "齐套", tooling: "7/7", tools: "正常", env: "23.0℃ / 46%", camera: "在线", finish: "2026-05-29 18:00", x: 34, y: 25 },
        { id: "S4", code: "209", name: "中机身对接", segment: "209F Fuselage Docking", msn: "MSN00060", aircraftNo: "B-0012", customer: "东方航空", status: "blocked", progress: 68, aoTotal: 106, aoOpen: 34, aaoTotal: 506, aaoOpen: 198, aaoRate: 61, disrTotal: 7, disrOpen: 3, frrTotal: 4, frrOpen: 2, planInArchive: 8, planOutArchive: 1, planInWork: 14, planOutWork: 2, dailyPlan: 25, people: "9/10", skillGap: 1, materials: "待补2项", tooling: "7/8", tools: "定力扳手占用", env: "23.2℃ / 51%", camera: "离线", finish: "2026-05-29 22:00", x: 58, y: 25 },
        { id: "S5", code: "213", name: "后机身固化", segment: "213机身后段对接", msn: "MSN00061", aircraftNo: "B-0014", customer: "中国国航", status: "warning", progress: 73, aoTotal: 118, aoOpen: 37, aaoTotal: 438, aaoOpen: 144, aaoRate: 67, disrTotal: 6, disrOpen: 2, frrTotal: 5, frrOpen: 1, planInArchive: 9, planOutArchive: 2, planInWork: 12, planOutWork: 1, dailyPlan: 24, people: "8/10", skillGap: 1, materials: "待胶接件", tooling: "6/8", tools: "塞规待还", env: "温湿度关注", camera: "在线", finish: "2026-05-30 09:30", x: 82, y: 25 }
      ]
    },
    {
      id: "C06",
      label: "C06 总装产线",
      type: "C919部装",
      summary: "系统联调与尾段待接产线，当前关注人员技能与视频盲区。",
      position: { left: 52, top: 34, width: 42, height: 48 },
      metrics: { aoTotal: 322, aoOpen: 69, aaoTotal: 860, aaoOpen: 205, disrOpen: 5, frrOpen: 5, planRate: 82 },
      stations: [
        { id: "S3", code: "221", name: "电缆束复核", segment: "电缆束复核", msn: "MSN00066", aircraftNo: "B-0038", customer: "商飞快线", status: "normal", progress: 75, aoTotal: 88, aoOpen: 9, aaoTotal: 214, aaoOpen: 34, aaoRate: 84, disrTotal: 2, disrOpen: 0, frrTotal: 3, frrOpen: 0, planInArchive: 10, planOutArchive: 1, planInWork: 7, planOutWork: 1, dailyPlan: 19, people: "7/7", skillGap: 0, materials: "齐套", tooling: "5/5", tools: "正常", env: "22.9℃ / 47%", camera: "在线", finish: "2026-06-04 13:00", x: 12, y: 25 },
        { id: "S4", code: "223", name: "系统测试准备", segment: "系统联调准备", msn: "MSN00068", aircraftNo: "B-0043", customer: "南方航空", status: "warning", progress: 57, aoTotal: 112, aoOpen: 41, aaoTotal: 376, aaoOpen: 128, aaoRate: 66, disrTotal: 8, disrOpen: 4, frrTotal: 6, frrOpen: 3, planInArchive: 6, planOutArchive: 0, planInWork: 13, planOutWork: 2, dailyPlan: 21, people: "7/9", skillGap: 2, materials: "齐套", tooling: "6/7", tools: "正常", env: "23.0℃ / 49%", camera: "在线", finish: "2026-06-06 18:00", x: 36, y: 25 },
        { id: "S5", code: "224", name: "尾段待接", segment: "尾段对接", msn: "MSN00069", aircraftNo: "B-0046", customer: "东航", status: "blocked", progress: 49, aoTotal: 101, aoOpen: 36, aaoTotal: 270, aaoOpen: 91, aaoRate: 66, disrTotal: 3, disrOpen: 1, frrTotal: 4, frrOpen: 2, planInArchive: 4, planOutArchive: 1, planInWork: 12, planOutWork: 4, dailyPlan: 21, people: "8/8", skillGap: 0, materials: "尾段未到位", tooling: "6/8", tools: "正常", env: "23.1℃ / 48%", camera: "在线", finish: "2026-06-07 12:00", x: 60, y: 25 },
        { id: "S7", code: "228", name: "系统联调", segment: "系统联调", msn: "MSN00072", aircraftNo: "B-0051", customer: "金鹏航空", status: "blocked", progress: 47, aoTotal: 96, aoOpen: 29, aaoTotal: 318, aaoOpen: 109, aaoRate: 66, disrTotal: 5, disrOpen: 2, frrTotal: 5, frrOpen: 2, planInArchive: 5, planOutArchive: 1, planInWork: 11, planOutWork: 3, dailyPlan: 20, people: "8/9", skillGap: 1, materials: "齐套", tooling: "6/6", tools: "螺纹柄六角钻待还", env: "22.6℃ / 50%", camera: "盲区", finish: "2026-06-10 16:00", x: 84, y: 25 }
      ]
    }
  ],
  shortages: [
    { id: "MAT-001", materialCode: "C919-53-209-014", materialName: "中机身对接密封组件", affectedAo: "AO-C02-S4-018", items: 2, lineId: "C02", stationId: "S4", msn: "MSN00060", remark: "工程更改任务 DCI_C1W08-5755-014-R012 关联", eta: "2026-06-05 15:30", status: "待到料" },
    { id: "MAT-002", materialCode: "C919-55-224-006", materialName: "尾段对接定位衬套", affectedAo: "AO-C06-S5-011", items: 4, lineId: "C06", stationId: "S5", msn: "MSN00069", remark: "尾段未到位，影响主线AO开工", eta: "2026-06-05 18:00", status: "协调中" },
    { id: "MAT-003", materialCode: "C919-57-213-008", materialName: "胶接固化辅助件", affectedAo: "AO-C02-S5-021", items: 1, lineId: "C02", stationId: "S5", msn: "MSN00061", remark: "等待供应商补发", eta: "2026-06-06 09:00", status: "待确认" }
  ],
  issues: [
    { no: "DISR-20260605-017", type: "DISR", level: "severe", title: "中机身定位偏差待工程确认", lineId: "C02", stationId: "S4", msn: "MSN00060", owner: "工程技术", status: "开口", time: "09:15" },
    { no: "FRR-20260605-006", type: "FRR", level: "warning", title: "后段连接件一次提交未通过", lineId: "C02", stationId: "S5", msn: "MSN00061", owner: "质量", status: "处理中", time: "10:20" },
    { no: "DISR-20260605-021", type: "DISR", level: "warning", title: "系统联调线束接口版本待确认", lineId: "C06", stationId: "S4", msn: "MSN00068", owner: "工程技术", status: "开口", time: "11:10" },
    { no: "FRR-20260605-011", type: "FRR", level: "severe", title: "视频盲区引发安全复核", lineId: "C06", stationId: "S7", msn: "MSN00072", owner: "安全人员", status: "待复核", time: "11:35" }
  ],
  personnel: [
    { role: "飞机装配工", needed: 38, available: 35, skillGap: 3, perAo: 0.86, onMachine: "84%" },
    { role: "电工", needed: 12, available: 10, skillGap: 2, perAo: 0.72, onMachine: "78%" },
    { role: "仓储管理员", needed: 6, available: 6, skillGap: 0, perAo: 0.62, onMachine: "66%" }
  ],
  tooling: [
    { code: "TG-209-07", name: "中机身定位夹具", lineId: "C02", stationId: "S4", kit: "7/8", inspection: "2026-06-09", status: "缺1件" },
    { code: "TG-224-03", name: "尾段对接支撑工装", lineId: "C06", stationId: "S5", kit: "6/8", inspection: "2026-06-12", status: "待补齐" },
    { code: "TG-213-02", name: "后段胶接固化工装", lineId: "C02", stationId: "S5", kit: "6/8", inspection: "2026-06-06", status: "即将定检" }
  ],
  toolItems: [
    { category: "工具", name: "定力扳手", qty: 18, borrowed: 14, overdue: 2, stationId: "S4" },
    { category: "量具", name: "塞规", qty: 36, borrowed: 22, overdue: 1, stationId: "S5" },
    { category: "刀具", name: "螺纹柄六角钻", qty: 24, borrowed: 20, overdue: 3, stationId: "S7" },
    { category: "工具", name: "弹簧式定位销", qty: 42, borrowed: 31, overdue: 0, stationId: "S4" }
  ],
  environment: [
    { sensor: "ENV-C02-S4-01", lineId: "C02", stationId: "S4", label: "S4微环境", temp: 23.2, humidity: 51, threshold: "22-26℃ / 40-60%", status: "正常" },
    { sensor: "PWR-C02-S4-02", lineId: "C02", stationId: "S4", label: "液压源站", temp: 0.48, humidity: 0, threshold: "≥0.65MPa", status: "超限" },
    { sensor: "ENV-C02-S5-01", lineId: "C02", stationId: "S5", label: "胶接温湿度", temp: 23.5, humidity: 58, threshold: "22-25℃ / 45-55%", status: "预警" },
    { sensor: "ENV-C06-S7-01", lineId: "C06", stationId: "S7", label: "联调区域照明", temp: 520, humidity: 0, threshold: "≥500lx", status: "正常" }
  ],
  cameras: [
    { cameraId: "CAM-C02-S4", name: "摄像头 - 209工位", lineId: "C02", stationId: "S4", status: "离线", snapshot: "09:18:40", stream: "rtsp://demo/C02/S4" },
    { cameraId: "CAM-C02-S5", name: "摄像头 - 213工位", lineId: "C02", stationId: "S5", status: "在线", snapshot: "09:21:10", stream: "rtsp://demo/C02/S5" },
    { cameraId: "CAM-C06-S7", name: "摄像头 - 228工位", lineId: "C06", stationId: "S7", status: "盲区", snapshot: "09:28:00", stream: "rtsp://demo/C06/S7" }
  ],
  threeInterface: {
    endpoint: "POST /api/scene3/twin/focus",
    adapter: "scene3-object-state-adapter",
    payload: {
      objectId: "C02-S4",
      objectType: "station",
      geometryRef: "factory18/C02/S4",
      layer: "production-monitor",
      stateFields: ["status", "riskLevel", "aoOpen", "aaoOpen", "disrOpen", "frrOpen"],
      action: "focus-and-highlight"
    }
  }
};

const linesById = Object.fromEntries(DATA.lines.map((line) => [line.id, line]));
const state = {
  main: "manufacture",
  level: "plant",
  view: "plan",
  element: "overview",
  right: "kpi",
  bottom: "aircraft",
  scenario: "pressure",
  lineId: "C02",
  stationId: "S4",
  modalActions: {},
  userOpen: false,
  toastTimer: 0
};

function elementIconMarkup(type) {
  const icons = {
    overview: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="4.5" width="7" height="7" rx="1.5"></rect>
        <rect x="13.5" y="4.5" width="7" height="7" rx="1.5"></rect>
        <rect x="3.5" y="14.5" width="7" height="5" rx="1.5"></rect>
        <path d="M14 18.5h6.5"></path>
        <path d="M17.25 14.5v8"></path>
      </svg>`,
    personnel: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2"></circle>
        <path d="M6 18.5c1.4-3 3.6-4.5 6-4.5s4.6 1.5 6 4.5"></path>
        <path d="M4.5 11.2l2.2 1.4"></path>
        <path d="M17.3 12.6l2.2-1.4"></path>
      </svg>`,
    tooling: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.5 5.5a3.2 3.2 0 0 0 3.8 3.8l-7.6 7.6-3.1.7.7-3.1 7.6-7.6z"></path>
        <path d="M13 7l4 4"></path>
      </svg>`,
    material: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.8l7 3.6-7 3.6-7-3.6z"></path>
        <path d="M5 7.4v8l7 4v-8"></path>
        <path d="M19 7.4v8l-7 4"></path>
      </svg>`,
    tools: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18.5h14"></path>
        <path d="M7 15.5v3"></path>
        <path d="M11 12.5v6"></path>
        <path d="M15 9.5v9"></path>
        <path d="M19 6.5v12"></path>
      </svg>`,
    environment: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 6.5a2 2 0 1 1 4 0v6.1a4 4 0 1 1-4 0z"></path>
        <path d="M12 9v6"></path>
        <path d="M14.8 5.2c1.8-.1 3.2.3 4.4 1.6-1.6.8-3 1-4.4.7"></path>
      </svg>`,
    video: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6.5" width="11.5" height="11" rx="2"></rect>
        <path d="M15.5 10l4.5-2.5v9L15.5 14z"></path>
        <circle cx="9.8" cy="12" r="1.6"></circle>
      </svg>`
  };
  return icons[type] || icons.overview;
}

const SCENARIOS = {
  pressure: {
    id: "pressure",
    label: "动力不足",
    summary: "液压源压力不足，影响中机身对接工位",
    lineId: "C02",
    stationId: "S4",
    element: "environment",
    right: "resources",
    bottom: "station",
    level: "severe",
    timer: "00:48:32",
    note: "待厂务恢复",
    owner: "厂务/设备保障",
    affected: ["液压源站0.48MPa，低于开工阈值", "影响AO-C02-S4-018及相邻吊装协同动作"],
    chips: [{ label: "环境就绪", tone: "good" }, { label: "资源受限", tone: "bad" }, { label: "起重就绪", tone: "good" }, { label: "安全就绪", tone: "good" }]
  },
  material: {
    id: "material",
    label: "物料不足",
    summary: "尾段未到位导致主线AO无法开工",
    lineId: "C06",
    stationId: "S5",
    element: "material",
    right: "alerts",
    bottom: "material",
    level: "warning",
    timer: "02:46:18",
    note: "待物流确认",
    owner: "物料保障",
    affected: ["尾段对接定位衬套未到位", "影响MSN00069尾段对接节点"],
    chips: [{ label: "人力就绪", tone: "good" }, { label: "工装待补", tone: "warn" }, { label: "物料缺件", tone: "bad" }, { label: "视频在线", tone: "good" }]
  },
  staffing: {
    id: "staffing",
    label: "人力不足",
    summary: "系统测试班组技能配置不足",
    lineId: "C06",
    stationId: "S4",
    element: "personnel",
    right: "resources",
    bottom: "test",
    level: "warning",
    timer: "01:52:36",
    note: "待班组补位",
    owner: "现场负责人",
    affected: ["电工技能等级缺口2人", "系统联调准备推迟"],
    chips: [{ label: "物料齐套", tone: "good" }, { label: "人员缺口", tone: "bad" }, { label: "技能待补齐", tone: "warn" }, { label: "许可待批", tone: "warn" }]
  },
  environment: {
    id: "environment",
    label: "环境不达标",
    summary: "胶接固化温湿度偏离工艺阈值",
    lineId: "C02",
    stationId: "S5",
    element: "environment",
    right: "resources",
    bottom: "burn",
    level: "warning",
    timer: "01:13:40",
    note: "待暖通调整",
    owner: "厂务/设备保障",
    affected: ["胶接温湿度达到预警边界", "AO-C02-S5-021暂停开工"],
    chips: [{ label: "温湿度预警", tone: "bad" }, { label: "人员就绪", tone: "good" }, { label: "工装就绪", tone: "good" }, { label: "质量待复核", tone: "warn" }]
  },
  safety: {
    id: "safety",
    label: "安全事件",
    summary: "视频盲区与异物干扰触发安全复核",
    lineId: "C06",
    stationId: "S7",
    element: "video",
    right: "alerts",
    bottom: "issues",
    level: "severe",
    timer: "00:26:54",
    note: "待安全复核",
    owner: "安全人员",
    affected: ["摄像头盲区未解除", "FRR-20260605-011等待安全复核"],
    chips: [{ label: "视频盲区", tone: "bad" }, { label: "许可待复核", tone: "warn" }, { label: "人员已撤离", tone: "good" }, { label: "追溯记录中", tone: "good" }]
  }
};

const scenarioStore = JSON.parse(JSON.stringify(SCENARIOS));

function line(id = state.lineId) {
  return linesById[id] || DATA.lines[0];
}

function station(lineId = state.lineId, stationId = state.stationId) {
  return line(lineId).stations.find((item) => item.id === stationId) || line(lineId).stations[0];
}

function scenario() {
  return scenarioStore[state.scenario];
}

function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.info;
}

function toneLabel(tone) {
  return {
    green: "正常",
    orange: "预警",
    red: "异常",
    blue: "信息",
    purple: "关注",
    gray: "未启用"
  }[tone] || tone || "信息";
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTimer(value) {
  const [h = 0, m = 0, s = 0] = String(value).split(":").map((item) => Number(item) || 0);
  return h * 3600 + m * 60 + s;
}

function formatTimer(seconds) {
  const safe = Math.max(0, seconds);
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`;
}

function ensureDeadlines() {
  const now = Date.now();
  Object.values(scenarioStore).forEach((item) => {
    if (!item.deadlineAt) item.deadlineAt = now + parseTimer(item.timer) * 1000;
  });
}

function timerText(item = scenario()) {
  return formatTimer(Math.floor((item.deadlineAt - Date.now()) / 1000));
}

function scopeTitle() {
  if (state.level === "plant") return `${DATA.plant.workshop}厂房级总览`;
  if (state.level === "line") return `${line().id} 产线级`;
  const st = station();
  return `${st.id} ${st.name}`;
}

function scopeSummary() {
  if (state.level === "plant") return "默认以厂房级进入，继承旧平台总览、人员、工装、物料、工刀量、环境、视频等生产要素。";
  if (state.level === "line") return `${line().summary} 当前生产要素：${element().label}。`;
  const st = station();
  return `${st.msn} · ${st.segment} · 当前状态：${statusMeta(st.status).label} · 当前生产要素：${element().label}。`;
}

function element() {
  return ELEMENTS.find((item) => item.id === state.element) || ELEMENTS[0];
}

function currentScopeStations() {
  if (state.level === "plant") return DATA.lines.flatMap((item) => item.stations);
  if (state.level === "line") return line().stations;
  return [station()];
}

function elementCount(id) {
  const stations = currentScopeStations();
  const stationIds = new Set(stations.map((item) => `${item.lineId || state.lineId}-${item.id}`));
  if (id === "overview") return stations.length;
  if (id === "personnel") return stations.reduce((sum, item) => sum + item.skillGap, 0);
  if (id === "tooling") return DATA.tooling.filter((item) => stations.some((st) => st.id === item.stationId)).length;
  if (id === "material") return DATA.shortages.filter((item) => stations.some((st) => st.id === item.stationId)).length;
  if (id === "tools") return DATA.toolItems.filter((item) => stations.some((st) => st.id === item.stationId)).reduce((sum, item) => sum + item.overdue, 0);
  if (id === "environment") return DATA.environment.filter((item) => stations.some((st) => st.id === item.stationId && item.status !== "正常")).length;
  if (id === "video") return DATA.cameras.filter((item) => item.status !== "在线" && stations.some((st) => st.id === item.stationId)).length;
  return stationIds.size;
}

function scopeKpis() {
  const stations = currentScopeStations();
  const sum = (key) => stations.reduce((total, item) => total + (Number(item[key]) || 0), 0);
  if (state.element === "personnel") {
    return [
      ["出勤缺口", sum("skillGap"), "orange"],
      ["上机率", "84%", "blue"],
      ["人均AO", "0.86", "green"],
      ["技能预警", sum("skillGap"), "red"]
    ];
  }
  if (state.element === "material") {
    return [
      ["缺料项", DATA.shortages.length, "red"],
      ["影响AO", DATA.shortages.length, "orange"],
      ["物料配套", "86%", "blue"],
      ["本周齐套", 42, "green"]
    ];
  }
  if (state.element === "tooling") {
    return [
      ["AO齐套", "91%", "green"],
      ["工装缺口", 5, "orange"],
      ["即将定检", 3, "orange"],
      ["不可用", 2, "red"]
    ];
  }
  if (state.element === "tools") {
    return [
      ["库存种类", DATA.toolItems.length, "blue"],
      ["借出", 87, "orange"],
      ["超期未还", DATA.toolItems.reduce((sum, item) => sum + item.overdue, 0), "red"],
      ["安全库存", "78%", "green"]
    ];
  }
  if (state.element === "environment") {
    return [
      ["温湿度点", DATA.environment.length, "blue"],
      ["超限", DATA.environment.filter((item) => item.status === "超限").length, "red"],
      ["预警", DATA.environment.filter((item) => item.status === "预警").length, "orange"],
      ["稳定度", "92%", "green"]
    ];
  }
  if (state.element === "video") {
    return [
      ["摄像头", DATA.cameras.length, "blue"],
      ["离线", DATA.cameras.filter((item) => item.status === "离线").length, "red"],
      ["盲区", DATA.cameras.filter((item) => item.status === "盲区").length, "orange"],
      ["在线率", "67%", "green"]
    ];
  }
  return [
    ["AO开口", sum("aoOpen"), "orange"],
    ["AAO开口", sum("aaoOpen"), "orange"],
    ["DISR开口", sum("disrOpen"), "red"],
    ["FRR开口", sum("frrOpen"), "red"]
  ];
}

function recordsForElement() {
  const st = station();
  if (state.element === "personnel") return DATA.personnel.map((item) => ({ title: item.role, desc: `需求${item.needed} / 可用${item.available} · 技能缺口${item.skillGap} · 上机率${item.onMachine}`, tone: item.skillGap ? "orange" : "green" }));
  if (state.element === "material") return DATA.shortages.map((item) => ({ title: `${item.materialCode} ${item.materialName}`, desc: `影响${item.affectedAo} · ${item.msn} · ${item.status} · ${item.remark}`, tone: item.stationId === st.id ? "red" : "orange", source: item }));
  if (state.element === "tooling") return DATA.tooling.map((item) => ({ title: `${item.code} ${item.name}`, desc: `${item.lineId}/${item.stationId} · 齐套${item.kit} · 定检${item.inspection} · ${item.status}`, tone: item.status.includes("缺") ? "red" : "orange", source: item }));
  if (state.element === "tools") return DATA.toolItems.map((item) => ({ title: `${item.category} · ${item.name}`, desc: `库存${item.qty} · 借出${item.borrowed} · 超期${item.overdue} · 关联${item.stationId}`, tone: item.overdue ? "red" : "green", source: item }));
  if (state.element === "environment") return DATA.environment.map((item) => ({ title: `${item.label} ${item.sensor}`, desc: `${item.status} · 当前${item.temp}${item.humidity ? `℃ / ${item.humidity}%` : ""} · 阈值${item.threshold}`, tone: item.status === "超限" ? "red" : item.status === "预警" ? "orange" : "green", source: item }));
  if (state.element === "video") return DATA.cameras.map((item) => ({ title: `${item.name}`, desc: `${item.lineId}/${item.stationId} · ${item.status} · 截图${item.snapshot}`, tone: item.status === "在线" ? "green" : item.status === "盲区" ? "orange" : "red", source: item }));
  return [
    { title: "年度/月度/日计划达成", desc: `年度${DATA.plant.metrics.yearPlanRate} · 月度${DATA.plant.metrics.monthPlanRate} · 日计划AO ${DATA.plant.metrics.dayAoRate}`, tone: "blue" },
    { title: "在制架次概览", desc: DATA.plant.aircraft.map((item) => `${item.msn} ${item.progress}%`).join(" · "), tone: "green" },
    { title: "质量与故障", desc: `月度FRR ${DATA.plant.metrics.frrMonth} · 一次提交合格率${DATA.plant.metrics.firstPassRate} · 千工时故障${DATA.plant.metrics.thousandHourFault}`, tone: "orange" }
  ];
}

function alerts() {
  const issueAlerts = DATA.issues.map((item) => ({
    title: item.title,
    desc: `${item.no} · ${item.type} · ${item.lineId}/${item.stationId} · ${item.owner} · ${item.status}`,
    level: item.level,
    source: item
  }));
  const shortageAlerts = DATA.shortages.map((item) => ({
    title: `欠缺物料影响主线AO：${item.materialName}`,
    desc: `${item.affectedAo} · ${item.msn} · ETA ${item.eta}`,
    level: "warning",
    source: item
  }));
  const videoAlerts = DATA.cameras.filter((item) => item.status !== "在线").map((item) => ({
    title: `${item.name} ${item.status}`,
    desc: `${item.lineId}/${item.stationId} · ${item.snapshot} · 需现场复核`,
    level: item.status === "离线" ? "severe" : "warning",
    source: item
  }));
  return [...issueAlerts, ...shortageAlerts, ...videoAlerts];
}

function traces() {
  return [
    { title: "09:15 风险触发", desc: `${scenario().label} · ${scenario().affected[0]}` },
    { title: "09:18 定位对象", desc: `${scenario().lineId}/${scenario().stationId} · ${station(scenario().lineId, scenario().stationId).msn}` },
    { title: "09:25 推送责任角色", desc: `${scenario().owner} · ${scenario().note}` },
    { title: "09:40 等待恢复校验", desc: "处置动作完成后写入复盘记录并同步指标。" }
  ];
}

function renderMainNav() {
  $("#mainNav").innerHTML = baseData.mainNav.map((item) => `
    <button type="button" class="${state.main === item.id ? "active" : ""}" data-main="${item.id}">
      ${item.icon ? `<img src="${item.icon}" alt="" />` : ""}
      <span>${item.label}</span>
    </button>
  `).join("");
}

function renderClock() {
  const update = () => {
    const now = new Date();
    $("#clock").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    $("#today").textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timerNode = $("#heroTimer");
    if (timerNode) timerNode.textContent = timerText();
  };
  update();
  setInterval(update, 1000);
}

function renderCommand() {
  $("#levelSwitch").innerHTML = LEVELS.map((item) => `<button type="button" class="${state.level === item.id ? "active" : ""}" data-level="${item.id}">${item.label}</button>`).join("");
  $("#scopeFilters").innerHTML = [
    ["domain", DATA.plant.domain, "业务域"],
    ["workshop", DATA.plant.workshop, "车间/型号"],
    ["object", state.level === "plant" ? "全部对象" : state.level === "line" ? line().id : `${line().id}/${station().id}`, "当前对象"]
  ].map(([id, label, sub]) => `<button type="button" data-filter="${id}"><strong>${label}</strong><span>${sub}</span></button>`).join("");
  $("#viewTabs").innerHTML = VIEWS.map((item) => `<button type="button" class="${state.view === item.id ? "active" : ""}" data-view="${item.id}">${item.label}</button>`).join("");
}

function renderScope() {
  $("#scopeTitle").textContent = scopeTitle();
  $("#scopeSummary").textContent = scopeSummary();
  $("#backButton").disabled = state.level === "plant";
  const crumbs = [{ id: "plant", label: "厂房级" }];
  if (state.level !== "plant") crumbs.push({ id: "line", label: line().id });
  if (state.level === "station") crumbs.push({ id: "station", label: station().id });
  $("#crumbs").innerHTML = crumbs.map((item, index) => `<button type="button" class="${index === crumbs.length - 1 ? "active" : ""}" data-crumb="${item.id}">${item.label}</button>`).join("");
  $("#scopeKpis").innerHTML = scopeKpis().map(([label, value, tone]) => `
    <article class="mini-kpi" data-kpi="${label}">
      <span>${label}</span>
      <strong class="${tone}">${value}</strong>
    </article>
  `).join("");
}

function renderElements() {
  $("#elementMenu").innerHTML = ELEMENTS.map((item) => `
    <button type="button" class="element-item ${state.element === item.id ? "active" : ""}" data-element="${item.id}">
      <span class="element-icon">${elementIconMarkup(item.icon)}</span>
      <span><strong>${item.label}</strong><span>${item.desc}</span></span>
      <em>${elementCount(item.id)}</em>
    </button>
  `).join("");
}

function renderScenarios() {
  $("#scenarioList").innerHTML = Object.values(scenarioStore).map((item) => `
    <button type="button" class="scenario-item ${state.scenario === item.id ? "active" : ""}" data-scenario="${item.id}">
      <strong>${item.label}</strong>
      <span>${item.summary}</span>
      <small>${item.lineId}/${item.stationId} · ${item.owner}</small>
    </button>
  `).join("");
}

function renderHero() {
  const item = scenario();
  const st = station(item.lineId, item.stationId);
  const tone = statusMeta(item.level).tone;
  const alertText = item.affected.map((text) => text
    .replace("液压源站0.48MPa，低于开工阈值", "液压源0.48MPa低于阈值")
    .replace("影响AO-C02-S4-018及相邻吊装协同动作", "影响AO与吊装协同")
    .replace("尾段对接定位衬套未到位", "尾段定位衬套未到位")
    .replace("影响MSN00069尾段对接节点", "影响MSN00069对接节点")
  ).join("；");
  $("#heroBand").innerHTML = `
    <div class="hero-grid">
      <div class="hero-main">
        <div class="hero-meta">当前主导异常 · ${DATA.plant.domain} · ${element().label}</div>
        <div class="hero-title">${item.label} · ${st.name}</div>
        <div class="hero-desc">${item.lineId}/${item.stationId} · ${st.msn} · ${st.aircraftNo} · ${item.owner}</div>
        <div class="hero-alert ${tone}">${alertText}</div>
        <div class="chip-row">${item.chips.map((chip, index) => `<span class="status-chip ${chip.tone}" data-chip="${index}">${chip.label}</span>`).join("")}</div>
      </div>
      <div class="hero-side">
        <span>预计恢复倒计时</span>
        <div class="hero-timer" id="heroTimer">${timerText(item)}</div>
        <span>${item.note}</span>
      </div>
    </div>
  `;
}

function renderStageHead() {
  $("#stageEyebrow").textContent = `${state.view === "three" ? "3D接口预留" : state.view === "objects" ? "对象台账" : "二维平面"} · ${element().label}`;
  $("#stageTitle").textContent = scopeTitle();
  $("#stageSubtitle").textContent = `${element().desc} · ${state.level === "plant" ? "点击产线或工位完成下钻" : "点击卡片查看口径与闭环详情"}`;
  $("#boardActions").innerHTML = `
    <button class="icon-pill primary" type="button" data-action="focus">定位当前风险</button>
    <button class="icon-pill" type="button" data-action="legacy">旧平台映射</button>
    <button class="icon-pill" type="button" data-action="three">接入3D原型</button>
  `;
}

function renderMapContent() {
  if (state.view === "three") {
    return `
      <section class="map-panel">
        <div class="panel-toolbar">
          <div><h3>3D原型接口预留</h3><span>其他团队负责3D实现</span></div>
          <button class="panel-expand" type="button" data-action="expandStage">展开</button>
        </div>
        <div class="context-scroll">
          <article class="object-row" data-record="three">
            <div class="split-line"><h4>${DATA.threeInterface.endpoint}</h4><span class="status-pill blue">接口</span></div>
            <p>将当前2D对象、状态、风险等级、图层和高亮动作发送给3D原型，当前对象：${state.level === "plant" ? DATA.plant.workshop : state.level === "line" ? line().id : `${line().id}/${station().id}`}。</p>
          </article>
          <article class="object-row" data-action="threeBridgeStage">
            <div class="split-line"><h4>${DATA.threeInterface.adapter}</h4><span class="status-pill green">可模拟</span></div>
            <p>${JSON.stringify(DATA.threeInterface.payload)}</p>
          </article>
        </div>
      </section>
      <section class="context-panel">${renderContextCards()}</section>
    `;
  }

  if (state.view === "objects") {
    const rows = state.level === "plant" ? DATA.lines : line().stations;
    return `
      <section class="map-panel">
        <div class="panel-toolbar">
          <div><h3>对象台账</h3><span>旧平台对象体系</span></div>
          <button class="panel-expand" type="button" data-action="expandStage">展开</button>
        </div>
        <div class="context-scroll">
          ${rows.map((item) => "stations" in item ? `
            <article class="object-row" data-line="${item.id}">
              <div class="split-line"><h4>${item.id} ${item.label}</h4><span class="status-pill blue">产线</span></div>
              <p>${item.summary} · AO开口${item.metrics.aoOpen} · AAO开口${item.metrics.aaoOpen} · DISR/FRR ${item.metrics.disrOpen}/${item.metrics.frrOpen}</p>
            </article>
          ` : `
            <article class="object-row" data-line="${state.lineId}" data-station="${item.id}">
              <div class="split-line"><h4>${item.id} ${item.name}</h4><span class="status-pill ${statusMeta(item.status).tone}">${statusMeta(item.status).label}</span></div>
              <p>${item.msn} · ${item.segment} · AO/AAO开口 ${item.aoOpen}/${item.aaoOpen} · DISR/FRR ${item.disrOpen}/${item.frrOpen}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="context-panel">${renderContextCards()}</section>
    `;
  }

  if (state.level === "plant") {
    return `
      <section class="map-panel">
        <div class="panel-toolbar">
          <div><h3>厂房2D总览</h3><span>点击产线或工位下钻</span></div>
          <button class="panel-expand" type="button" data-action="expandStage">展开</button>
        </div>
        <div class="factory-map">
          ${DATA.lines.map((item) => `
            <section class="line-zone ${state.lineId === item.id ? "active" : ""}" style="left:${item.position.left}%;top:${item.position.top}%;width:${item.position.width}%;height:${item.position.height}%;" data-line="${item.id}">
              <header><span>${item.id}</span><small>${item.stations.length}工位 · ${item.metrics.planRate}%</small></header>
              <div class="line-body">
                ${item.stations.map((st) => `<button class="station-dot ${statusMeta(st.status).tone}" data-line="${item.id}" data-station="${st.id}"><span>${st.id}</span><small>${st.segment}</small></button>`).join("")}
              </div>
            </section>
          `).join("")}
        </div>
      </section>
      <section class="context-panel">${renderContextCards()}</section>
    `;
  }

  return `
    <section class="map-panel">
      <div class="panel-toolbar">
        <div><h3>${state.level === "line" ? `${line().id}产线2D布局` : `${station().id}工位2D对象`}</h3><span>状态色与右侧BI同步</span></div>
        <button class="panel-expand" type="button" data-action="expandStage">展开</button>
      </div>
      <div class="station-layout">
        ${line().stations.map((st) => `
          <section class="station-node ${state.stationId === st.id ? "active" : ""}" data-line="${line().id}" data-station="${st.id}">
            <header><span>${st.id} ${st.code}</span><span class="status-pill ${statusMeta(st.status).tone}">${statusMeta(st.status).label}</span></header>
            <main>
              <strong>${st.name}</strong>
              <small>${st.msn} · ${st.segment} · ${st.customer}</small>
              <div class="progress-bar"><i style="width:${st.progress}%"></i></div>
              <div class="station-mini-grid">
                <div class="station-mini" data-field="ao"><span>AO/AAO开口</span><strong>${st.aoOpen}/${st.aaoOpen}</strong></div>
                <div class="station-mini" data-field="issue"><span>DISR/FRR</span><strong>${st.disrOpen}/${st.frrOpen}</strong></div>
                <div class="station-mini" data-field="resource"><span>物料/工装</span><strong>${st.materials}/${st.tooling}</strong></div>
                <div class="station-mini" data-field="video"><span>视频</span><strong>${st.camera}</strong></div>
              </div>
            </main>
          </section>
        `).join("")}
      </div>
    </section>
    <section class="context-panel">${renderContextCards()}</section>
  `;
}

function renderContextCards() {
  const records = recordsForElement();
  return `
    <div class="context-scroll">
      <div class="panel-toolbar">
        <div><h3>${element().label}上下文</h3><span>${scopeTitle()}</span></div>
        <button class="panel-expand" type="button" data-action="expandContext">展开</button>
      </div>
      <div class="legacy-grid">
        ${scopeKpis().map(([label, value, tone]) => `<article class="legacy-card" data-kpi="${label}"><span>${label}</span><strong class="${tone}">${value}</strong></article>`).join("")}
      </div>
      <div style="height:10px"></div>
      ${records.map((item, index) => `
        <article class="object-row" data-element-record="${index}">
          <div class="split-line"><h4>${item.title}</h4><span class="status-pill ${item.tone}">${toneLabel(item.tone)}</span></div>
          <p>${item.desc}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderStage() {
  $("#stageContent").innerHTML = renderMapContent();
}

function renderDrawerTabs() {
  $("#drawerTabs").innerHTML = RIGHT_TABS.map((item) => `<button type="button" class="${state.right === item.id ? "active" : ""}" data-right="${item.id}">${item.label}</button>`).join("");
}

function renderDrawer() {
  let body = "";
  if (state.right === "alerts") {
    body = alerts().map((item, index) => `<article class="alert-row ${statusMeta(item.level).tone}" data-alert="${index}"><div class="split-line"><h4>${item.title}</h4><span class="status-pill ${statusMeta(item.level).tone}">${statusMeta(item.level).label}</span></div><p>${item.desc}</p></article>`).join("");
  } else if (state.right === "resources") {
    body = DATA.plant.resources.map((item, index) => `<article class="resource-row" data-resource="${index}"><strong>${item.label}</strong><span class="status-pill ${item.tone}">${item.value}${item.unit}</span><div class="bar"><i style="width:${item.value}%"></i></div><p>${item.source}</p></article>`).join("");
  } else if (state.right === "trace") {
    body = traces().map((item, index) => `<article class="trace-row" data-trace="${index}"><h4>${item.title}</h4><p>${item.desc}</p></article>`).join("");
  } else if (state.right === "three") {
    body = `<article class="object-row" data-record="three"><div class="split-line"><h4>2D对象状态输出</h4><span class="status-pill blue">JSON</span></div><p>${DATA.threeInterface.endpoint} · ${DATA.threeInterface.adapter}</p></article><article class="object-row" data-action="threeBridgeDrawer"><h4>模拟发送当前对象</h4><p>用于对接3D原型的对象ID、状态、图层、高亮动作和影响范围。</p></article>`;
  } else {
    body = [
      ["AO开口", station().aoOpen, "orange"],
      ["AAO开口", station().aaoOpen, "orange"],
      ["DISR开口", station().disrOpen, "red"],
      ["FRR开口", station().frrOpen, "red"],
      ["AAO完工率", `${station().aaoRate}%`, "green"],
      ["计划达成", `${line().metrics.planRate}%`, "blue"]
    ].map(([label, value, tone]) => `<article class="object-row" data-kpi="${label}"><div class="split-line"><h4>${label}</h4><span class="status-pill ${tone}">${value}</span></div><p>${scopeTitle()} · 数据来源：MES/QMS/计划系统。</p></article>`).join("");
  }
  $("#drawerPanel").innerHTML = `
    <div class="drawer-head">
      <div><h3>${RIGHT_TABS.find((item) => item.id === state.right).label}看板</h3><span>${element().label} · ${scopeTitle()}</span></div>
      <button class="icon-pill" type="button" data-action="expandDrawer">全部</button>
    </div>
    <div class="drawer-scroll">${body}</div>
  `;
}

function renderBottomTabs() {
  $("#bottomTabs").innerHTML = `
    <div class="bottom-tab-list">
      ${BOTTOM_TABS.map((item) => `<button type="button" class="${state.bottom === item.id ? "active" : ""}" data-bottom="${item.id}">${item.label}</button>`).join("")}
    </div>
    <button class="panel-expand" type="button" data-action="expandBottom">展开</button>
  `;
}

function renderBottom() {
  let rows = "";
  if (state.bottom === "aircraft") {
    rows = DATA.plant.aircraft.map((item, index) => `
      <article class="queue-row aircraft-row" data-aircraft="${index}">
        <div class="aircraft-head">
          <div class="aircraft-copy">
            <h4>${item.msn}</h4>
            <strong>${item.customer}</strong>
          </div>
          <span class="status-pill ${statusMeta(item.risk).tone}">${item.progress}%</span>
        </div>
        <p>${item.lineId}/${item.stationId} · ${item.aircraftNo} · 总装下线</p>
        <small>${item.offlineDate}</small>
      </article>
    `).join("");
  } else if (state.bottom === "material") {
    rows = DATA.shortages.map((item, index) => `<article class="queue-row" data-shortage="${index}"><div class="split-line"><h4>${item.materialName}</h4><span class="status-pill red">${item.items}项</span></div><p>${item.materialCode} · 影响${item.affectedAo} · ${item.msn}</p></article>`).join("");
  } else if (state.bottom === "issues") {
    rows = DATA.issues.map((item, index) => `<article class="queue-row" data-issue="${index}"><div class="split-line"><h4>${item.type} · ${item.title}</h4><span class="status-pill ${statusMeta(item.level).tone}">${item.status}</span></div><p>${item.no} · ${item.lineId}/${item.stationId} · ${item.owner}</p></article>`).join("");
  } else if (state.bottom === "burn") {
    rows = `<article class="queue-row" data-record="burn"><div class="split-line"><h4>计划/实际开口燃尽</h4><span class="status-pill blue">趋势</span></div><div class="chart-bars">${[42, 36, 34, 30, 26, 21, 18].map((v) => `<i style="height:${v * 2}px"></i>`).join("")}</div><p>用于模拟旧平台燃尽图和计划偏离趋势。</p></article><article class="queue-row" data-record="rate"><h4>配套率趋势</h4><p>物料配套86% · 工装齐套91% · 工刀量可用78%</p></article><article class="queue-row" data-record="quality"><h4>质量趋势</h4><p>一次提交合格率99.98% · 月度FRR 14 · 千工时故障0.05</p></article>`;
  } else if (state.bottom === "test") {
    rows = Object.values(scenarioStore).slice(0, 3).map((item) => `<article class="queue-row" data-scenario="${item.id}"><div class="split-line"><h4>${item.label}</h4><span class="status-pill ${statusMeta(item.level).tone}">${item.owner}</span></div><p>${item.summary} · 点击可切换场景并刷新全部数据。</p></article>`).join("");
  } else {
    const st = station();
    rows = [
      ["工位基础", `${st.id}/${st.code} · ${st.segment} · ${st.msn}`],
      ["本工位数据", `AO ${st.aoTotal}/${st.aoOpen} · AAO ${st.aaoTotal}/${st.aaoOpen} · 完工率${st.aaoRate}%`],
      ["问题数据", `DISR ${st.disrTotal}/${st.disrOpen} · FRR ${st.frrTotal}/${st.frrOpen}`],
      ["日计划", `归档${st.planInArchive + st.planOutArchive} · 工作中${st.planInWork + st.planOutWork} · 总数${st.dailyPlan}`]
    ].map(([title, desc]) => `<article class="queue-row" data-record="${title}"><h4>${title}</h4><p>${desc}</p></article>`).join("");
  }
  const layout = state.bottom === "station" || state.bottom === "aircraft" ? "four" : "three";
  $("#bottomContent").innerHTML = `<div class="bottom-scroll"><div class="bottom-grid ${layout}">${rows}</div></div>`;
}

function stageDetailRows() {
  if (state.view === "three") {
    return [
      { title: DATA.threeInterface.endpoint, label: "接口", tone: "blue", text: `当前对象：${state.level === "plant" ? DATA.plant.workshop : state.level === "line" ? line().id : `${line().id}/${station().id}`}。输出对象、状态、风险等级、图层和高亮动作。` },
      { title: DATA.threeInterface.adapter, label: "适配器", tone: "green", text: JSON.stringify(DATA.threeInterface.payload) }
    ];
  }
  if (state.view === "objects") {
    const rows = state.level === "plant" ? DATA.lines : line().stations;
    return rows.map((item) => "stations" in item
      ? { title: `${item.id} ${item.label}`, label: `${item.stations.length}工位`, tone: "blue", text: `${item.summary} AO/AAO开口 ${item.metrics.aoOpen}/${item.metrics.aaoOpen}，DISR/FRR ${item.metrics.disrOpen}/${item.metrics.frrOpen}，计划达成${item.metrics.planRate}%。` }
      : { title: `${item.id} ${item.name}`, label: statusMeta(item.status).label, tone: statusMeta(item.status).tone, text: `${item.msn} · ${item.segment} · ${item.customer}；AO/AAO开口 ${item.aoOpen}/${item.aaoOpen}，DISR/FRR ${item.disrOpen}/${item.frrOpen}，进度${item.progress}%。` });
  }
  if (state.level === "plant") {
    return DATA.lines.flatMap((item) => [
      { title: `${item.id} ${item.label}`, label: `${item.metrics.planRate}%`, tone: item.metrics.planRate >= 80 ? "green" : "orange", text: `${item.summary} AO开口${item.metrics.aoOpen}，AAO开口${item.metrics.aaoOpen}，DISR/FRR ${item.metrics.disrOpen}/${item.metrics.frrOpen}。` },
      ...item.stations.map((st) => ({ title: `${item.id}/${st.id} ${st.name}`, label: statusMeta(st.status).label, tone: statusMeta(st.status).tone, text: `${st.msn} · ${st.aircraftNo} · ${st.customer}；进度${st.progress}%，AO/AAO开口 ${st.aoOpen}/${st.aaoOpen}，预计完成 ${st.finish}。` }))
    ]);
  }
  return line().stations.map((st) => ({
    title: `${line().id}/${st.id} ${st.name}`,
    label: statusMeta(st.status).label,
    tone: statusMeta(st.status).tone,
    text: `${st.code} · ${st.msn} · ${st.customer}；进度${st.progress}%，人员${st.people}，物料${st.materials}，工装${st.tooling}，视频${st.camera}。`
  }));
}

function bottomDetailRows() {
  if (state.bottom === "aircraft") {
    return DATA.plant.aircraft.map((item) => ({
      title: `${item.msn} · ${item.customer}`,
      label: `${item.progress}%`,
      tone: statusMeta(item.risk).tone,
      text: `${item.model} · ${item.aircraftNo} · ${item.lineId}/${item.stationId} · 总装下线 ${item.offlineDate}`
    }));
  }
  if (state.bottom === "material") {
    return DATA.shortages.map((item) => ({ title: item.materialName, label: `${item.items}项`, tone: "red", text: `${item.materialCode} · ${item.lineId}/${item.stationId} · 影响${item.affectedAo} · 预计到料${item.eta} · ${item.status}` }));
  }
  if (state.bottom === "issues") {
    return DATA.issues.map((item) => ({ title: `${item.type} · ${item.title}`, label: item.status, tone: statusMeta(item.level).tone, text: `${item.no} · ${item.lineId}/${item.stationId} · ${item.msn} · 责任方${item.owner} · ${item.time}` }));
  }
  if (state.bottom === "test") {
    return Object.values(scenarioStore).map((item) => ({ title: item.label, label: item.owner, tone: statusMeta(item.level).tone, text: `${item.summary} · ${item.lineId}/${item.stationId} · ${item.note}` }));
  }
  if (state.bottom === "burn") {
    return [
      { title: "计划/实际开口燃尽", label: "趋势", tone: "blue", text: "按日展示AO、AAO、DISR与FRR计划开口、实际开口和关闭偏差。" },
      { title: "配套率趋势", label: "资源", tone: "green", text: "物料配套86% · 工装齐套91% · 工刀量可用78%。" },
      { title: "质量趋势", label: "质量", tone: "orange", text: "一次提交合格率99.98% · 月度FRR 14 · 千工时故障0.05。" }
    ];
  }
  const st = station();
  return [
    { title: "工位基础", label: `${line().id}/${st.id}`, tone: "blue", text: `${st.code} · ${st.segment} · ${st.msn} · ${st.aircraftNo} · ${st.customer}` },
    { title: "生产执行", label: `${st.progress}%`, tone: statusMeta(st.status).tone, text: `AO ${st.aoTotal}/${st.aoOpen} · AAO ${st.aaoTotal}/${st.aaoOpen} · 完工率${st.aaoRate}% · 预计完成${st.finish}` },
    { title: "问题与计划", label: `${st.disrOpen + st.frrOpen}项`, tone: st.disrOpen + st.frrOpen ? "red" : "green", text: `DISR ${st.disrTotal}/${st.disrOpen} · FRR ${st.frrTotal}/${st.frrOpen} · 日计划${st.dailyPlan}` },
    { title: "资源与环境", label: "条件", tone: "orange", text: `人员${st.people} · 物料${st.materials} · 工装${st.tooling} · 工刀量${st.tools} · 环境${st.env} · 视频${st.camera}` }
  ];
}

function expandedStageVisual() {
  if (state.view !== "plan") return "";
  if (state.level === "plant") {
    return `
      <section class="expanded-map">
        ${DATA.lines.map((item) => `
          <section class="expanded-line">
            <header>
              <div><strong>${item.id} ${item.label}</strong><span>${item.summary}</span></div>
              <em>${item.metrics.planRate}%</em>
            </header>
            <div class="expanded-stations">
              ${item.stations.map((st) => `
                <button type="button" class="expanded-station ${statusMeta(st.status).tone}" data-line="${item.id}" data-station="${st.id}">
                  <strong>${st.id}</strong>
                  <span>${st.name}</span>
                  <small>${st.msn} · ${st.progress}%</small>
                </button>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </section>
    `;
  }
  return `
    <section class="expanded-stations expanded-stations-wide">
      ${line().stations.map((st) => `
        <button type="button" class="expanded-station ${statusMeta(st.status).tone}" data-line="${line().id}" data-station="${st.id}">
          <strong>${st.id} ${st.code}</strong>
          <span>${st.name}</span>
          <small>${st.msn} · ${st.customer} · 进度${st.progress}%</small>
        </button>
      `).join("")}
    </section>
  `;
}

function openStageDetail() {
  openModal({
    kicker: state.view === "plan" ? "二维生产监控" : state.view === "objects" ? "对象台账" : "3D接口预留",
    title: `${scopeTitle()}完整视图`,
    desc: "主页面保留态势摘要，完整对象、状态与业务字段在此独立查看。",
    meta: [DATA.plant.domain, scopeTitle(), element().label],
    contentHtml: expandedStageVisual(),
    body: stageDetailRows(),
    actions: [{ id: "close", label: "关闭", primary: true, handler: closeModal }]
  });
}

function openContextDetail() {
  openModal({
    kicker: "生产要素详情",
    title: `${element().label} · ${scopeTitle()}`,
    desc: "展示当前层级生产要素的指标口径、关联对象与业务记录。",
    meta: [state.level === "plant" ? "厂房级" : state.level === "line" ? "产线级" : "工位级", `${recordsForElement().length}条记录`],
    body: [
      ...scopeKpis().map(([label, value, tone]) => ({ title: label, label: String(value), tone, text: `${scopeTitle()}当前指标，点击主页面指标卡可继续查看数据来源与口径。` })),
      ...recordsForElement().map((item) => ({ title: item.title, label: toneLabel(item.tone), tone: item.tone, text: item.desc }))
    ],
    actions: [{ id: "close", label: "关闭", primary: true, handler: closeModal }]
  });
}

function openBottomDetail() {
  const current = BOTTOM_TABS.find((item) => item.id === state.bottom);
  openModal({
    kicker: "业务明细",
    title: `${current.label} · ${scopeTitle()}`,
    desc: "底部区域只显示关键摘要，完整数据在此查看并保留对象联动。",
    meta: [current.label, scopeTitle(), `${bottomDetailRows().length}条记录`],
    body: bottomDetailRows(),
    actions: [{ id: "close", label: "关闭", primary: true, handler: closeModal }]
  });
}

function openDrawerDetail() {
  const current = RIGHT_TABS.find((item) => item.id === state.right);
  let body = [];
  if (state.right === "alerts") {
    body = alerts().map((item) => ({ title: item.title, label: statusMeta(item.level).label, tone: statusMeta(item.level).tone, text: item.desc }));
  } else if (state.right === "resources") {
    body = DATA.plant.resources.map((item) => ({ title: item.label, label: `${item.value}${item.unit}`, tone: item.tone, text: `数据来源：${item.source}，与当前对象及典型闭环同步。` }));
  } else if (state.right === "trace") {
    body = traces().map((item) => ({ title: item.title, label: "追溯", tone: "blue", text: item.desc }));
  } else if (state.right === "three") {
    body = stageDetailRows();
  } else {
    body = [
      ["AO开口", station().aoOpen, "orange"],
      ["AAO开口", station().aaoOpen, "orange"],
      ["DISR开口", station().disrOpen, "red"],
      ["FRR开口", station().frrOpen, "red"],
      ["AAO完工率", `${station().aaoRate}%`, "green"],
      ["计划达成", `${line().metrics.planRate}%`, "blue"]
    ].map(([title, value, tone]) => ({ title, label: String(value), tone, text: `${scopeTitle()}当前指标，数据来源：MES/QMS/计划系统。` }));
  }
  openModal({
    kicker: "右侧业务看板",
    title: `${current.label}看板 · ${scopeTitle()}`,
    desc: "查看当前业务看板的完整记录、指标及关联对象。",
    meta: [element().label, `${body.length}条记录`],
    body,
    actions: [{ id: "close", label: "关闭", primary: true, handler: closeModal }]
  });
}

function openModal({ kicker = "生产监控", title = "详情", desc = "", meta = [], contentHtml = "", body = [], actions = [] }) {
  $("#modalKicker").textContent = kicker;
  $("#modalTitle").textContent = title;
  $("#modalDesc").textContent = desc;
  $("#modalMeta").innerHTML = meta.map((item) => `<span>${item}</span>`).join("");
  $("#modalBody").innerHTML = `${contentHtml}${body.map((item) => `<article class="object-row"><div class="split-line"><h4>${item.title}</h4>${item.tone ? `<span class="status-pill ${item.tone}">${item.label || ""}</span>` : ""}</div><p>${item.text}</p></article>`).join("")}`;
  $("#modalActions").innerHTML = actions.map((item) => `<button type="button" class="${item.primary ? "primary" : ""}" data-modal-action="${item.id}">${item.label}</button>`).join("");
  state.modalActions = Object.fromEntries(actions.map((item) => [item.id, item.handler]));
  $("#modal").hidden = false;
  $("#modal").setAttribute("aria-hidden", "false");
  $("#modal").classList.add("open");
}

function closeModal() {
  $("#modal").classList.remove("open");
  $("#modal").hidden = true;
  $("#modal").setAttribute("aria-hidden", "true");
  state.modalActions = {};
}

function notify(text) {
  const toast = $("#statusToast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openRecord(type, payload = {}) {
  openModal({
    kicker: type,
    title: payload.title || payload.materialName || payload.no || "对象详情",
    desc: payload.desc || payload.remark || payload.summary || "该对象已接入生产监控状态机，可定位、查看口径、写入追溯或模拟闭环。",
    meta: [scopeTitle(), element().label, `${line().id}/${station().id}`],
    body: [
      { title: "业务来源", text: "继承旧平台数字车间中的空间索引、生产要素看板、BI面板和弹窗清单。" },
      { title: "数据来源", text: "模拟接入MES、APS、ERP/MRP/WMS、PLM、QMS、EAM、IoT、视频平台和3D孪生平台。" },
      { title: "联动范围", text: "当前对象、左侧生产要素、右侧BI、底部抽屉、异常中心和3D接口预留同步更新。" }
    ],
    actions: [
      { id: "focus", label: "定位对象", primary: true, handler: () => { closeModal(); drillTo("station", payload.lineId || scenario().lineId, payload.stationId || scenario().stationId); notify("已定位到关联对象"); } },
      { id: "trace", label: "写入追溯", handler: () => { closeModal(); notify("已写入模拟追溯记录"); } },
      { id: "resolve", label: "模拟闭环", handler: () => { closeModal(); resolveScenario(); } }
    ]
  });
}

function openLegacyMap() {
  openModal({
    kicker: "旧平台映射",
    title: "旧平台能力继承清单",
    desc: "新平台不是推倒重来，而是旧平台业务逻辑的新型展现层。",
    meta: ["厂房级", "产线级", "工位级", "要素联动"],
    body: ELEMENTS.map((item) => ({
      title: item.label,
      label: `${elementCount(item.id)}项`,
      tone: "blue",
      text: `承接旧平台${item.desc}相关字段，当前页面已与左侧生产要素、右侧看板和底部业务卡同步联动。`
    })),
    actions: [{ id: "close", label: "知道了", primary: true, handler: closeModal }]
  });
}

function openThreeInterface() {
  openModal({
    kicker: "3D接口预留",
    title: "2D对象状态输出到3D原型",
    desc: "3D由其他团队负责，本原型只提供对象、状态、图层、高亮动作和影响范围的接口模拟。",
    meta: [DATA.threeInterface.endpoint, DATA.threeInterface.adapter],
    body: [
      { title: "当前对象", text: state.level === "plant" ? DATA.plant.workshop : state.level === "line" ? line().id : `${line().id}/${station().id}` },
      { title: "模拟Payload", text: JSON.stringify({ ...DATA.threeInterface.payload, objectId: state.level === "plant" ? DATA.plant.id : state.level === "line" ? line().id : `${line().id}-${station().id}` }) },
      { title: "验证方式", text: "点击发送模拟接口后，仅产生toast和追溯记录，不调用真实3D服务。" }
    ],
    actions: [
      { id: "send3d", label: "发送模拟接口", primary: true, handler: () => { closeModal(); notify("已模拟发送2D对象状态到3D接口"); } },
      { id: "close", label: "关闭", handler: closeModal }
    ]
  });
}

function drillTo(level, lineId = state.lineId, stationId = state.stationId) {
  state.level = level;
  state.lineId = lineId;
  state.stationId = stationId;
  renderAll();
}

function applyScenario(id) {
  state.scenario = id;
  const item = scenario();
  state.lineId = item.lineId;
  state.stationId = item.stationId;
  state.element = item.element;
  state.right = item.right;
  state.bottom = item.bottom;
  state.level = "station";
  state.view = "plan";
  renderAll();
}

function resolveScenario() {
  const item = scenario();
  item.level = "info";
  item.note = "已闭环";
  item.deadlineAt = Date.now();
  const st = station(item.lineId, item.stationId);
  st.status = "normal";
  notify("已模拟完成闭环，工位状态已回写");
  renderAll();
}

function renderAll() {
  renderMainNav();
  renderCommand();
  renderScope();
  renderElements();
  renderScenarios();
  renderHero();
  renderStageHead();
  renderStage();
  renderDrawerTabs();
  renderDrawer();
  renderBottomTabs();
  renderBottom();
  $("#noticeBadge").textContent = String(alerts().filter((item) => item.level !== "info").length);
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, article, section, .status-chip");
    if (!target) return;

    if (target.dataset.main) {
      state.main = target.dataset.main;
      renderAll();
      if (state.main !== "manufacture") openRecord("门户功能入口", { title: target.textContent.trim(), desc: "头部非生产监控门户入口仅做占位交互。" });
      return;
    }
    if (target.dataset.level) return drillTo(target.dataset.level);
    if (target.dataset.view) { state.view = target.dataset.view; renderAll(); return; }
    if (target.dataset.element) { state.element = target.dataset.element; state.right = state.element === "overview" ? "kpi" : "resources"; renderAll(); return; }
    if (target.dataset.scenario) return applyScenario(target.dataset.scenario);
    if (target.dataset.crumb) return drillTo(target.dataset.crumb);
    if (target.dataset.line && !target.dataset.station) return drillTo("line", target.dataset.line, linesById[target.dataset.line].stations[0].id);
    if (target.dataset.station) {
      if (target.closest("#modal")) closeModal();
      return drillTo("station", target.dataset.line || state.lineId, target.dataset.station);
    }
    if (target.dataset.right) { state.right = target.dataset.right; renderAll(); return; }
    if (target.dataset.bottom) { state.bottom = target.dataset.bottom; renderAll(); return; }
    if (target.dataset.filter) { openRecord("全局筛选", { title: target.innerText.trim(), desc: "筛选用于定义业务域、车间/型号和当前对象上下文。" }); return; }
    if (target.dataset.kpi) { openRecord("指标口径", { title: target.dataset.kpi, desc: "指标可查看业务口径、数据来源、更新时间和关联对象。" }); return; }
    if (target.dataset.elementRecord) { openRecord(`${element().label}记录`, recordsForElement()[Number(target.dataset.elementRecord)]); return; }
    if (target.dataset.alert) { openRecord("异常详情", alerts()[Number(target.dataset.alert)]); return; }
    if (target.dataset.resource) { openRecord("资源详情", DATA.plant.resources[Number(target.dataset.resource)]); return; }
    if (target.dataset.trace) { openRecord("历史追溯", traces()[Number(target.dataset.trace)]); return; }
    if (target.dataset.aircraft) { openRecord("在制架次", DATA.plant.aircraft[Number(target.dataset.aircraft)]); return; }
    if (target.dataset.shortage) { openRecord("欠缺物料影响主线AO", DATA.shortages[Number(target.dataset.shortage)]); return; }
    if (target.dataset.issue) { openRecord("DISR/FRR问题单", DATA.issues[Number(target.dataset.issue)]); return; }
    if (target.dataset.record) { openRecord("业务明细", { title: target.querySelector("h4")?.textContent, desc: target.querySelector("p")?.textContent }); return; }
    if (target.dataset.field) { openRecord("工位字段", { title: target.querySelector("span")?.textContent, desc: target.querySelector("strong")?.textContent }); return; }
    if (target.dataset.chip) { openRecord("状态筹码", { title: scenario().chips[Number(target.dataset.chip)].label, desc: "状态筹码与当前典型闭环场景、开工条件和右侧BI联动。" }); return; }
    if (target.id === "backButton") {
      if (state.level === "station") return drillTo("line");
      if (state.level === "line") return drillTo("plant");
    }
    if (target.id === "legacyMapButton" || target.dataset.action === "legacy") return openLegacyMap();
    if (target.id === "scenarioMore") return openRecord("典型闭环", { title: "完整业务测试场景", desc: "查看全部典型闭环场景，并可切换当前场景联动页面数据。" });
    if (target.dataset.action === "expandStage") return openStageDetail();
    if (target.dataset.action === "expandContext") return openContextDetail();
    if (target.dataset.action === "expandBottom") return openBottomDetail();
    if (target.dataset.action === "expandDrawer") return openDrawerDetail();
    if (target.dataset.action === "focus") return drillTo("station", scenario().lineId, scenario().stationId);
    if (target.dataset.action === "three" || target.dataset.action === "threeBridgeStage" || target.dataset.action === "threeBridgeDrawer") return openThreeInterface();
    if (target.id === "noticeButton") { state.right = "alerts"; renderAll(); openRecord("消息通知", { title: "生产监控待处理消息", desc: `${alerts().length}条异常与角色消息待处理。` }); return; }
    if (target.id === "userEntry") {
      state.userOpen = !state.userOpen;
      $("#userMenu").hidden = !state.userOpen;
      $("#userMenu").setAttribute("aria-hidden", String(!state.userOpen));
      $("#userEntry").setAttribute("aria-expanded", String(state.userOpen));
      $("#userMenu").classList.toggle("open", state.userOpen);
      return;
    }
    if (target.dataset.userAction) {
      openRecord("用户中心", { title: target.textContent.trim(), desc: "用户信息、权限、消息推送与责任域绑定。" });
      $("#userMenu").hidden = true;
      $("#userMenu").classList.remove("open");
      state.userOpen = false;
      return;
    }
    if (target.id === "modalClose") return closeModal();
    if (target.dataset.modalAction) {
      const handler = state.modalActions[target.dataset.modalAction];
      if (handler) handler();
    }
  });

  $("#modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") closeModal();
  });
}

ensureDeadlines();
renderClock();
bindEvents();
renderAll();
