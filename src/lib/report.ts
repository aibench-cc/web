// 检测报告数据契约。当前为种子样本(供前端渲染与设计验收),
// 待后端 /api/report/{id} 就绪后,这里改为按 reportId 拉取,组件与类型无需改动。
//
// 字段命名与后端 bench_web.py 的 _build_report 输出对齐(camelCase),
// 由 api 层 (FastAPI CamelModel) 做 snake_case -> camelCase 转换。

import type { Protocol, Purity, Confidence } from "./leaderboard";

export type { Protocol, Purity, Confidence } from "./leaderboard";

// 信号档:绿优 / 黄警告 / 红异常 / 灰未测(不参与取最差档)
export type Signal = "green" | "yellow" | "red" | "skipped";

export type DimKey =
  | "latency"
  | "cache"
  | "ratelimit"
  | "purity"
  | "cost"
  | "ttft"
  | "provenance";

// 一格"专业判据":标签 + 值(值可能是 — 表示该维度此项不适用)
export type Evidence = { label: string; value: string };

// 纯度的逐路指纹(展开态列出每路对/不对)
export type Fingerprint = {
  name: string;
  status: Signal;
  expected: string;
  actual: string;
  weak?: boolean; // 弱信号(如自报身份),不单独触发降级
};

// 缓存堆叠条:每次预热请求的 token 构成
export type CacheBar = {
  label: string;
  cacheRead: number;
  cacheCreation: number;
  uncachedInput: number;
};

// TTFT 时间轴泳道节点(相对请求起点的 ms)
export type TtftMarker = { label: string; atMs: number };

export type DimensionResult = {
  signal: Signal;
  verdict: string; // 折叠态一句话结论
  layman: string; // "这对你意味着什么"小白翻译
  evidence: Evidence[];
  thresholdNote?: string; // 判据来源脚注
  note?: string | null; // 中性补充(如推理模型自报信号跳过)
  // 维度特有可视化数据(可选)
  latencyScatter?: { i: number; ms: number }[];
  latencyP95Ms?: number;
  cacheBars?: CacheBar[];
  fingerprints?: Fingerprint[];
  costCompare?: { actualUsd: number; worstCaseUsd: number; savedPct: number };
  ttftMarkers?: TtftMarker[];
  provenanceSignals?: string[];
};

export type ReportMeta = {
  protocol: Protocol;
  model: string;
  channelHandle: string; // 脱敏,不含完整域名与 key
  checkedAt: string; // 本地可读时间
  sampleCount: number;
  durationSec: number;
  claudeCode?: boolean; // 是否以 Claude Code CLI 身份测试
};

export type Report = {
  reportId: string;
  meta: ReportMeta;
  overall: Signal; // = 七维最差档(skipped 不计)
  verdictTitle: string; // 一句话总结论标题
  verdictDetail: string; // 副句
  dimensions: Record<DimKey, DimensionResult>;
};

// ---------- 维度元信息(图标在组件层映射,这里只管标题/顺序) ----------

export const dimOrder: DimKey[] = [
  "latency",
  "cache",
  "ratelimit",
  "purity",
  "cost",
  "ttft",
  "provenance",
];

export const dimTitle: Record<DimKey, string> = {
  latency: "延迟分布",
  cache: "缓存命中",
  ratelimit: "限流策略",
  purity: "模型纯度",
  cost: "真实成本",
  ttft: "流式 TTFT",
  provenance: "渠道出处",
};

// ---------- 颜色映射(语义 token,不硬编码 hex) ----------

export const signalDot: Record<Signal, string> = {
  green: "bg-ok",
  yellow: "bg-warn",
  red: "bg-err",
  skipped: "bg-lo",
};

export const signalText: Record<Signal, string> = {
  green: "text-ok",
  yellow: "text-warn",
  red: "text-err",
  skipped: "text-lo",
};

// 无障碍 + 黑白打印:信号点旁强制带文字档位,不只靠颜色
export const signalLabel: Record<Signal, string> = {
  green: "优",
  yellow: "警告",
  red: "异常",
  skipped: "未测",
};

// 总览徽章配色(边框 + 浅底 + 文字)
export const overallBadge: Record<
  Exclude<Signal, "skipped">,
  { box: string; title: string }
> = {
  green: {
    box: "border-ok/30 bg-ok/[0.08] text-ok",
    title: "整体表现优秀",
  },
  yellow: {
    box: "border-warn/30 bg-warn/[0.08] text-warn",
    title: "基本可用,有项需注意",
  },
  red: {
    box: "border-err/30 bg-err/[0.08] text-err",
    title: "发现明显问题,请谨慎",
  },
};

// ---------- 格式化(复用 leaderboard 的 fmtSeconds / fmtRate;此处补充报告专用) ----------

export function fmtUsd(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}

export function fmtPct(n: number): string {
  return `${Math.round(n)}%`;
}

export function fmtTokensPerSec(tps: number): string {
  return `${tps.toFixed(0)} tok/s`;
}

export function fmtTokens(n: number): string {
  return n.toLocaleString("en-US");
}

// ---------- 种子样本报告(对应 PM 设计稿的示例:中转站 channel ch-3a*,黄档) ----------

export const seedReport: Report = {
  reportId: "demo-3a9f",
  meta: {
    protocol: "anthropic",
    model: "claude-sonnet-4-5",
    channelHandle: "ch-3a*",
    checkedAt: "2026-05-23 14:02",
    sampleCount: 24,
    durationSec: 31,
  },
  overall: "yellow",
  verdictTitle: "基本可用,有 2 项需注意",
  verdictDetail:
    "这条渠道延迟和成本都不错,但缓存疑似被网关剥离、出处疑似多账号共享池。判据见下,我们不替你下结论。",
  dimensions: {
    latency: {
      signal: "green",
      verdict: "响应很快,P95 0.82s,体验流畅",
      layman:
        "延迟就是你按下回车到收到完整回复的等待时间。P95 = 每 20 次请求里最慢的那 1 次,也不会超过这个数。这条渠道 0.82s 属于很快的水平,日常对话基本无感。",
      evidence: [
        { label: "P50", value: "0.54s" },
        { label: "P95", value: "0.82s" },
        { label: "P99", value: "1.18s" },
        { label: "均值", value: "0.61s" },
        { label: "样本数", value: "24" },
        { label: "成功率", value: "100%" },
      ],
      thresholdNote: "阈值 P95 <2s 优 / 2–5s 警告 / >5s 异常",
      latencyP95Ms: 820,
      latencyScatter: [
        { i: 1, ms: 540 }, { i: 2, ms: 580 }, { i: 3, ms: 610 }, { i: 4, ms: 560 },
        { i: 5, ms: 720 }, { i: 6, ms: 590 }, { i: 7, ms: 820 }, { i: 8, ms: 600 },
        { i: 9, ms: 640 }, { i: 10, ms: 570 }, { i: 11, ms: 1180 }, { i: 12, ms: 620 },
        { i: 13, ms: 560 }, { i: 14, ms: 600 }, { i: 15, ms: 690 }, { i: 16, ms: 580 },
        { i: 17, ms: 610 }, { i: 18, ms: 750 }, { i: 19, ms: 590 }, { i: 20, ms: 620 },
        { i: 21, ms: 560 }, { i: 22, ms: 700 }, { i: 23, ms: 600 }, { i: 24, ms: 640 },
      ],
    },
    cache: {
      signal: "red",
      verdict: "缓存字段疑似被网关剥离,你可能在重复付费",
      layman:
        "缓存就像点外卖时「老顾客免重做」:你反复发的同一段开头,官方会记住、第二次半价。但这条渠道第二次请求里那个「命中了多少缓存」的数字是 0 —— 要么真没缓存,要么是中间商把这个字段抹掉了。后者意味着你以为省了钱,其实在按全价重复付费。我们不能 100% 断定是哪种,但两次都没读到缓存,很可疑。",
      evidence: [
        { label: "命中率", value: "0%" },
        { label: "命中 token", value: "0" },
        { label: "未命中 token", value: "1,420" },
        { label: "Redis 层 cache_hit", value: "false" },
        { label: "5m 写入", value: "—" },
        { label: "1h 写入", value: "—" },
        { label: "字段剥离?", value: "疑似是" },
        { label: "第二次命中?", value: "否" },
      ],
      thresholdNote: "阈值 命中 ≥80% 优 / 40–80% 警告 / <40% 异常",
      cacheBars: [
        { label: "第 1 次预热", cacheRead: 0, cacheCreation: 0, uncachedInput: 1420 },
        { label: "第 2 次预热", cacheRead: 0, cacheCreation: 0, uncachedInput: 1420 },
      ],
    },
    ratelimit: {
      signal: "green",
      verdict: "未触发限流,余量充足",
      layman:
        "限流就像餐厅排号——发太快服务器会让你等(返回 429)。这里测的是你能多快发、还剩多少额度。本次全程没被限流,说明并发能力够用。",
      evidence: [
        { label: "429 次数", value: "0" },
        { label: "剩余请求数", value: "3,980" },
        { label: "剩余 token 数", value: "1.9M" },
        { label: "输入 token 余量", value: "1.2M" },
        { label: "输出 token 余量", value: "640K" },
        { label: "回标准限流头?", value: "是" },
      ],
      thresholdNote: "阈值 429 = 0 优 / ≥1 异常",
    },
    purity: {
      signal: "yellow",
      verdict: "服务端 model 与你填的一致,但版本指纹存疑",
      layman:
        "你点的是 A 牌咖啡,我们用四种方法验它到底是不是 A 牌:看包装上写的名字、问它「你是谁」、看它的「计量习惯」(tokenizer)、对暗号(版本指纹)。任一项对不上我们都告诉你,但不替你下定论——单次抽检也可能误判。",
      evidence: [
        { label: "请求模型", value: "claude-sonnet-4-5" },
        { label: "响应 model", value: "claude-sonnet-4-5" },
        { label: "自报身份", value: "Claude(未给版本)" },
        { label: "prompt_tokens", value: "18(基线 14–22)" },
      ],
      thresholdNote: "通过=全部一致 / 存疑=弱信号或单路不符 / 降级=强信号(① 或 ④)明确不符",
      note: "纯度给出的是「强烈怀疑」而非法律结论;自报身份可能被系统提示覆盖、多语言会让 tokenizer 计数偏移、单次探针无法发现请求中途被切换。判据已全部公开。",
      fingerprints: [
        {
          name: "① 响应体 model 字段",
          status: "green",
          expected: "claude-sonnet-4-5",
          actual: "claude-sonnet-4-5",
        },
        {
          name: "② 模型自报身份",
          status: "yellow",
          expected: "含 sonnet-4-5 版本",
          actual: "自称 Claude,未给版本",
          weak: true,
        },
        {
          name: "③ prompt_tokens 落点",
          status: "green",
          expected: "基线 14–22(±30%)",
          actual: "实测 18",
        },
        {
          name: "④ system_fingerprint / 版本号",
          status: "yellow",
          expected: "稳定版本指纹",
          actual: "缺失(中转常见)",
        },
      ],
    },
    cost: {
      signal: "yellow",
      verdict: "本次实测 $0.012;因缓存几乎没命中,比理想情况贵约 80%",
      layman:
        "这是你这次检测真花的钱,以及如果缓存全程不命中、最坏会花多少。两个数差得越多,说明缓存帮你省得越多——反过来,如果你这条渠道缓存老不命中,你就一直在花那个「最坏价」。",
      evidence: [
        { label: "本次实测", value: "$0.012" },
        { label: "缓存写成本", value: "$0" },
        { label: "缓存读成本", value: "$0" },
        { label: "未命中输入成本", value: "$0.004" },
        { label: "输出成本", value: "$0.008" },
        { label: "推理 token 成本", value: "—" },
        { label: "最坏情况", value: "$0.012" },
        { label: "缓存节省比例", value: "0%" },
      ],
      thresholdNote: "成本本身正常→绿;缓存失效导致偏贵→黄;对官方 >1.3x 标黄",
      costCompare: { actualUsd: 0.012, worstCaseUsd: 0.012, savedPct: 0 },
    },
    ttft: {
      signal: "green",
      verdict: "首字 0.6s 就出来了,打字流畅",
      layman:
        "TTFT = 你按回车后,屏幕上蹦出第一个字要等多久。推理模型(会先「想一想」的那种)会先沉默思考一会儿再开始吐字,这不是卡,是它在打草稿。这条渠道不是推理模型,首字 0.6s 直接开吐。",
      evidence: [
        { label: "首字 (真 TTFT)", value: "0.60s" },
        { label: "首个事件", value: "0.58s" },
        { label: "首个推理 token", value: "—" },
        { label: "思考时长", value: "—" },
        { label: "token 速度", value: "62 tok/s" },
        { label: "输出 token", value: "50" },
      ],
      thresholdNote: "阈值 TTFT P95 <800ms 优 / 800–2000ms 警告 / >2000ms 异常",
      note: "首个 SSE 帧未必是首个正文 token;网络缓冲可能抬高 TTFT;若渠道流式不返回 usage,会回退非流式以保计费完整。",
      ttftMarkers: [
        { label: "请求发出", atMs: 0 },
        { label: "首个事件", atMs: 580 },
        { label: "首字", atMs: 600 },
        { label: "完成", atMs: 1400 },
      ],
    },
    provenance: {
      signal: "yellow",
      verdict: "中可信:疑似多账号共享池",
      layman:
        "这一项回答「你这个 API 到底从哪来的」:是官方亲自供货,还是中间商从云厂商(Bedrock/Vertex/Azure)转手,还是拿别人的订阅账号「逆向」出来的,或者干脆是好多账号拼的共享池。来源不同,稳定性、合规性、缓存表现都会不一样。你的缓存打不中,可能就因为请求被分到了不同账号。",
      evidence: [
        { label: "出处标签", value: "疑似共享池/反代" },
        { label: "可信度", value: "中" },
        { label: "一句话", value: "字段像官方,但重复请求缓存打不中" },
      ],
      note: "出处为基于响应特征的推断,非渠道自述、亦非法律认定;我们列出全部信号供你判断,不下定论。",
      provenanceSignals: [
        "有官方 anthropic-ratelimit-* 限流头,字段像官方直连",
        "但同前缀重复请求未命中缓存 → 疑似多个上游 key 轮询",
        "id 以 msg_ 开头,响应结构符合 Anthropic 原生",
      ],
    },
  },
};
