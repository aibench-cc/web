// 后端数据获取层。所有调用都带超时 + 失败回退种子数据,
// 这样后端没起或网络抖动时页面依然可渲染(永不白屏)。
//
// 真实数据接入点:报告页 /r/[id] 与行业榜 /leaderboard。
// 首页 hero 统计与榜单预览是经过编排的营销快照(与真实榜单刻意不同),
// 故保持静态,不在此处接线,避免改动已验收的首屏视觉。

import { seedReport, type Report } from "./report";
import { seedLeaderboard, type LeaderboardRow } from "./leaderboard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";

const TIMEOUT_MS = 6000;

export type TimeWindow = "24h" | "30d";

export type Stats = {
  channels: number;
  grades: { A: number; B: number; C: number };
  verdict: string;
  vendors: number;
  dimensions: number;
  avgSeconds: number;
  generatedAt: number;
};

// 与后端 stats_response() 对齐,用作后端不可达时的回退
export const seedStats: Stats = {
  channels: 1248,
  grades: { A: 316, B: 540, C: 392 },
  verdict: "参差不齐",
  vendors: 13,
  dimensions: 7,
  avgSeconds: 30,
  generatedAt: 0,
};

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

// 单次检测快照:不缓存、不收录。后端 404 或不可达时返回 null,
// 由调用方决定回退(报告页回退种子样本以保证 demo 永远可看)。
export async function fetchReport(reportId: string): Promise<Report | null> {
  try {
    return await getJson<Report>(
      `/api/report/${encodeURIComponent(reportId)}`,
      { cache: "no-store" },
    );
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(
  window: TimeWindow = "30d",
): Promise<LeaderboardRow[]> {
  try {
    const data = await getJson<{ rows: LeaderboardRow[] }>(
      `/api/leaderboard?window=${window}`,
      { next: { revalidate: 300 } },
    );
    return data.rows?.length ? data.rows : seedLeaderboard;
  } catch {
    return seedLeaderboard;
  }
}

export async function fetchStats(): Promise<Stats> {
  try {
    return await getJson<Stats>("/api/stats", { next: { revalidate: 300 } });
  } catch {
    return seedStats;
  }
}
