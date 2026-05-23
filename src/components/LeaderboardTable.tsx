"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  type LeaderboardRow,
  type Protocol,
  type ChannelType,
  protocolLabel,
  gradeColor,
  purityColor,
  confidenceColor,
  fmtSeconds,
  fmtCost,
  fmtRate,
  fmtCacheHit,
  fmtLastChecked,
} from "@/lib/leaderboard";

type ProtocolFilter = "全部" | Protocol;
type ChannelFilter = "全部" | ChannelType;
type SortKey = "score" | "p95Ms" | "cacheHitRate" | "costRatio" | "sampleCount";
type WindowKey = "24h" | "30d";

const protocolFilters: { id: ProtocolFilter; label: string }[] = [
  { id: "全部", label: "全部协议" },
  { id: "openai", label: "OpenAI 兼容" },
  { id: "anthropic", label: "Anthropic" },
  { id: "gemini", label: "Gemini" },
];

const channelFilters: ChannelFilter[] = ["全部", "官方直连", "中转站"];

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "score", label: "综合评分" },
  { id: "p95Ms", label: "P95 延迟" },
  { id: "cacheHitRate", label: "缓存命中" },
  { id: "costRatio", label: "成本比" },
  { id: "sampleCount", label: "检测次数" },
];

// 完整字面量必须出现在源码中,Tailwind JIT 才会生成(不能用模板拼接 md: 前缀)
const GRID_COLS =
  "grid-cols-2 md:grid-cols-[40px_1.3fr_1.2fr_72px_70px_64px_64px_60px_60px_56px]";

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [windowKey, setWindowKey] = useState<WindowKey>("24h");
  const [protocol, setProtocol] = useState<ProtocolFilter>("全部");
  const [channel, setChannel] = useState<ChannelFilter>("全部");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = rows.filter(
      (r) =>
        (protocol === "全部" || r.protocol === protocol) &&
        (channel === "全部" || r.channelType === channel),
    );
    const asc = sortKey === "p95Ms" || sortKey === "costRatio"; // 越小越好
    return [...list].sort((a, b) => {
      const av = sortKey === "cacheHitRate" ? (a.cacheHitRate ?? -1) : a[sortKey];
      const bv = sortKey === "cacheHitRate" ? (b.cacheHitRate ?? -1) : b[sortKey];
      return asc ? av - bv : bv - av;
    });
  }, [rows, protocol, channel, sortKey]);

  return (
    <div className="flex flex-col gap-5">
      {/* 公测说明 */}
      <div className="glass-card flex items-start gap-3 p-4">
        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok animate-pulse-dot" />
        <p className="text-sm leading-relaxed text-mid">
          <span className="font-medium text-hi">公测期数据。</span>{" "}
          榜单由匿名检测结果聚合而来,样本达标(近 24h ≥ 20 次 / 近 30 天 ≥ 50
          次)的渠道才会上榜。纯度判定为「降级」的渠道无论延迟多快都封顶 C 级。排名只认数据,不收渠道一分钱 ——{" "}
          <Link
            href="/about#methodology"
            className="text-brand-bright transition-colors hover:text-hi"
          >
            查看评分方法学 →
          </Link>
        </p>
      </div>

      {/* 时间窗 + 筛选 + 排序 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
          {(["24h", "30d"] as WindowKey[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindowKey(w)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                windowKey === w
                  ? "bg-brand/[0.14] text-brand-bright"
                  : "text-mid hover:text-hi"
              }`}
            >
              {w === "24h" ? "近 24h" : "近 30 天"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {protocolFilters.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProtocol(p.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                protocol === p.id
                  ? "border-brand/60 bg-brand/[0.1] text-brand-bright"
                  : "border-white/10 bg-white/[0.03] text-mid hover:border-white/20"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {channelFilters.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                channel === c
                  ? "border-brand/60 bg-brand/[0.1] text-brand-bright"
                  : "border-white/10 bg-white/[0.03] text-mid hover:border-white/20"
              }`}
            >
              {c === "全部" ? "全部渠道" : c}
            </button>
          ))}
        </div>

        <label className="ml-auto inline-flex items-center gap-2 text-xs text-lo">
          排序
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="appearance-none rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-2.5 pr-7 text-xs font-medium text-hi focus:border-brand/60 focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-lo" />
          </div>
        </label>
      </div>

      {/* 表格 */}
      <div className="glass-card overflow-hidden">
        <div
          className={`hidden md:grid ${GRID_COLS} gap-2 px-4 py-3 border-b border-white/[0.06] text-xs font-medium uppercase tracking-wider text-lo`}
        >
          <div>#</div>
          <div>渠道</div>
          <div>模型 / 协议</div>
          <div className="text-right">P95</div>
          <div className="text-right">缓存</div>
          <div className="text-right">成本</div>
          <div className="text-right">成功率</div>
          <div className="text-center">纯度</div>
          <div className="text-right">样本</div>
          <div className="text-center">评级</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-lo">
            当前筛选条件下暂无达标渠道。
          </div>
        ) : (
          filtered.map((r, i) => (
            <Row
              key={r.rankKey}
              row={r}
              rank={i + 1}
              open={expanded === r.rankKey}
              onToggle={() =>
                setExpanded((cur) => (cur === r.rankKey ? null : r.rankKey))
              }
            />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-lo">
          共 {filtered.length} 条 · 时间窗{" "}
          {windowKey === "24h" ? "近 24h" : "近 30 天"} · 点击任意行展开检测凭证
        </p>
      )}
    </div>
  );
}

function Row({
  row,
  rank,
  open,
  onToggle,
}: {
  row: LeaderboardRow;
  rank: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={`grid w-full ${GRID_COLS} gap-2 px-4 py-3.5 text-left text-sm transition-colors hover:bg-white/[0.025]`}
      >
        <div className="hidden md:block font-mono text-lo md:self-center">
          {String(rank).padStart(2, "0")}
        </div>
        <div className="md:self-center">
          <div className="flex items-center gap-2 font-medium text-hi">
            {row.channelHandle}
            {row.channelType === "官方直连" && (
              <span className="rounded border border-ok/30 bg-ok/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-ok">
                官方
              </span>
            )}
          </div>
        </div>
        <div className="font-mono text-xs text-mid md:self-center">
          {row.model}
          <span className="ml-1.5 text-lo">· {protocolLabel[row.protocol]}</span>
        </div>
        <div className="font-mono text-right text-hi md:self-center">
          {fmtSeconds(row.p95Ms)}
        </div>
        <div className="font-mono text-right text-mid md:self-center">
          {fmtCacheHit(row.cacheHitRate)}
        </div>
        <div
          className={`font-mono text-right md:self-center ${row.costRatio > 1.3 ? "text-err" : "text-mid"}`}
        >
          {fmtCost(row.costRatio)}
        </div>
        <div className="font-mono text-right text-mid md:self-center">
          {fmtRate(row.successRate)}
        </div>
        <div
          className={`text-center md:self-center font-medium ${purityColor[row.purity]}`}
        >
          {row.purity}
        </div>
        <div className="font-mono text-right text-lo md:self-center">
          {row.sampleCount}
        </div>
        <div className="flex items-center justify-center gap-1.5 md:self-center">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-xs font-bold ${gradeColor[row.grade]}`}
          >
            {row.grade}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-lo transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] bg-white/[0.015] px-4 py-4 sm:grid-cols-4">
          <Evidence label="延迟 P50 / P95 / P99">
            {fmtSeconds(row.p50Ms)} / {fmtSeconds(row.p95Ms)} /{" "}
            {fmtSeconds(row.p99Ms)}
          </Evidence>
          <Evidence label="综合评分">{row.score} / 100</Evidence>
          <Evidence label="检测次数 / 贡献者">
            {row.sampleCount} 次 · {row.contributorCount} 人
          </Evidence>
          <Evidence label="最近检测">{fmtLastChecked(row.lastCheckedHours)}</Evidence>
          <Evidence label="成本比(对官方)">{fmtCost(row.costRatio)}</Evidence>
          <Evidence label="成功率">{fmtRate(row.successRate)}</Evidence>
          <Evidence label="数据可信度">
            <span className={confidenceColor[row.confidence]}>{row.confidence}</span>
          </Evidence>
          <Evidence label="复核">
            <Link
              href="/about#methodology"
              className="text-brand-bright transition-colors hover:text-hi"
            >
              如何复核 →
            </Link>
          </Evidence>
        </div>
      )}
    </div>
  );
}

function Evidence({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-lo">{label}</span>
      <span className="font-mono text-sm text-hi">{children}</span>
    </div>
  );
}
