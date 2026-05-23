// 行业榜数据契约。当前为公测期种子数据;待后端聚合就绪后,
// 这里改为从 /api/leaderboard 拉取,页面与类型无需改动。

export type Protocol = "openai" | "anthropic" | "gemini";
export type Purity = "通过" | "存疑" | "降级";
export type Grade = "A" | "B" | "C";
export type Confidence = "高" | "中" | "低";
export type ChannelType = "官方直连" | "中转站";

export type LeaderboardRow = {
  rankKey: string;
  protocol: Protocol;
  model: string;
  channelHandle: string;
  channelType: ChannelType;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  // null 表示该模型不支持缓存,评分时该维度剔除
  cacheHitRate: number | null;
  costRatio: number; // 相对官方直连,官方 = 1.00
  successRate: number; // 0..1
  purity: Purity;
  sampleCount: number;
  contributorCount: number;
  lastCheckedHours: number;
  confidence: Confidence;
  score: number; // 0..100
  grade: Grade;
};

export const protocolLabel: Record<Protocol, string> = {
  openai: "OpenAI 兼容",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

export const gradeColor: Record<Grade, string> = {
  A: "text-ok",
  B: "text-warn",
  C: "text-err",
};

export const purityColor: Record<Purity, string> = {
  通过: "text-ok",
  存疑: "text-warn",
  降级: "text-err",
};

export const confidenceColor: Record<Confidence, string> = {
  高: "text-ok",
  中: "text-warn",
  低: "text-lo",
};

export function fmtSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

export function fmtCost(ratio: number): string {
  return `${ratio.toFixed(2)}x`;
}

export function fmtRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function fmtCacheHit(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

export function fmtLastChecked(hours: number): string {
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${Math.round(hours)}h 前`;
  return `${Math.round(hours / 24)}d 前`;
}

// 公测期种子数据(混合官方直连与中转站,跨三协议)。生产环境由匿名贡献聚合而来。
export const seedLeaderboard: LeaderboardRow[] = [
  { rankKey: "anthropic:claude-sonnet-4-5:official", protocol: "anthropic", model: "claude-sonnet-4-5", channelHandle: "官方直连", channelType: "官方直连", p50Ms: 540, p95Ms: 820, p99Ms: 1180, cacheHitRate: 0.94, costRatio: 1.0, successRate: 0.998, purity: "通过", sampleCount: 1240, contributorCount: 86, lastCheckedHours: 2, confidence: "高", score: 95, grade: "A" },
  { rankKey: "openai:gpt-4o:official", protocol: "openai", model: "gpt-4o", channelHandle: "官方直连", channelType: "官方直连", p50Ms: 560, p95Ms: 880, p99Ms: 1240, cacheHitRate: 0.9, costRatio: 1.0, successRate: 0.999, purity: "通过", sampleCount: 1100, contributorCount: 95, lastCheckedHours: 1, confidence: "高", score: 93, grade: "A" },
  { rankKey: "openai:gpt-4o:channel-7x", protocol: "openai", model: "gpt-4o", channelHandle: "channel-7x", channelType: "中转站", p50Ms: 600, p95Ms: 910, p99Ms: 1360, cacheHitRate: 0.88, costRatio: 1.03, successRate: 0.995, purity: "通过", sampleCount: 642, contributorCount: 41, lastCheckedHours: 1, confidence: "高", score: 90, grade: "A" },
  { rankKey: "openai:deepseek-chat:official", protocol: "openai", model: "deepseek-chat", channelHandle: "官方直连", channelType: "官方直连", p50Ms: 700, p95Ms: 1040, p99Ms: 1520, cacheHitRate: 0.91, costRatio: 1.0, successRate: 0.996, purity: "通过", sampleCount: 880, contributorCount: 60, lastCheckedHours: 3, confidence: "高", score: 89, grade: "A" },
  { rankKey: "openai:kimi-k2:official", protocol: "openai", model: "kimi-k2", channelHandle: "官方直连", channelType: "官方直连", p50Ms: 760, p95Ms: 1100, p99Ms: 1600, cacheHitRate: 0.8, costRatio: 1.0, successRate: 0.993, purity: "通过", sampleCount: 520, contributorCount: 33, lastCheckedHours: 2, confidence: "高", score: 86, grade: "A" },
  { rankKey: "gemini:gemini-2.5-pro:official", protocol: "gemini", model: "gemini-2.5-pro", channelHandle: "官方直连", channelType: "官方直连", p50Ms: 900, p95Ms: 1300, p99Ms: 1900, cacheHitRate: 0.72, costRatio: 1.0, successRate: 0.991, purity: "通过", sampleCount: 600, contributorCount: 40, lastCheckedHours: 2, confidence: "高", score: 85, grade: "A" },
  { rankKey: "gemini:gemini-2.5-flash:relay-cn-2", protocol: "gemini", model: "gemini-2.5-flash", channelHandle: "relay-cn-2", channelType: "中转站", p50Ms: 820, p95Ms: 1220, p99Ms: 1820, cacheHitRate: null, costRatio: 1.08, successRate: 0.987, purity: "通过", sampleCount: 410, contributorCount: 28, lastCheckedHours: 4, confidence: "中", score: 78, grade: "B" },
  { rankKey: "openai:glm-4.6:fast-proxy", protocol: "openai", model: "glm-4.6", channelHandle: "fast-proxy", channelType: "中转站", p50Ms: 920, p95Ms: 1350, p99Ms: 2050, cacheHitRate: 0.65, costRatio: 1.12, successRate: 0.98, purity: "通过", sampleCount: 350, contributorCount: 22, lastCheckedHours: 2, confidence: "中", score: 74, grade: "B" },
  { rankKey: "openai:qwen-max:relay-x9", protocol: "openai", model: "qwen-max", channelHandle: "relay-x9", channelType: "中转站", p50Ms: 1010, p95Ms: 1480, p99Ms: 2240, cacheHitRate: 0.58, costRatio: 1.15, successRate: 0.972, purity: "通过", sampleCount: 290, contributorCount: 19, lastCheckedHours: 5, confidence: "中", score: 70, grade: "B" },
  { rankKey: "anthropic:claude-sonnet-4-5:channel-3a", protocol: "anthropic", model: "claude-sonnet-4-5", channelHandle: "channel-3a", channelType: "中转站", p50Ms: 1100, p95Ms: 1580, p99Ms: 2480, cacheHitRate: 0.41, costRatio: 1.31, successRate: 0.964, purity: "存疑", sampleCount: 180, contributorCount: 12, lastCheckedHours: 6, confidence: "低", score: 55, grade: "C" },
  { rankKey: "anthropic:claude-3-5-haiku:relay-budget", protocol: "anthropic", model: "claude-3-5-haiku", channelHandle: "relay-budget", channelType: "中转站", p50Ms: 1200, p95Ms: 1700, p99Ms: 2700, cacheHitRate: 0.3, costRatio: 1.45, successRate: 0.95, purity: "存疑", sampleCount: 140, contributorCount: 9, lastCheckedHours: 7, confidence: "低", score: 48, grade: "C" },
  { rankKey: "openai:gpt-4o:cheap-relay", protocol: "openai", model: "gpt-4o", channelHandle: "cheap-relay", channelType: "中转站", p50Ms: 1500, p95Ms: 2040, p99Ms: 3200, cacheHitRate: 0.12, costRatio: 1.74, successRate: 0.921, purity: "降级", sampleCount: 96, contributorCount: 7, lastCheckedHours: 8, confidence: "低", score: 28, grade: "C" },
];
