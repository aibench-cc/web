import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  fmtCacheHit,
  fmtLastChecked,
  fmtSeconds,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import RecentActivityTicker from "./RecentActivityTicker";

export default function LeaderboardPreview({ rows }: { rows: LeaderboardRow[] }) {
  const topRows = rows.slice(0, 5);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-ok/25 bg-ok/[0.08] px-3 py-1 text-xs font-medium text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
            最近 24h · 榜单预览
          </div>
          <h2 className="text-2xl font-semibold text-hi lg:text-3xl">
            谁家渠道真的稳？
          </h2>
          <p className="mt-2 max-w-xl text-mid">
            优先读取真实榜单 API；后端不可达时自动展示种子数据，首页不白屏。
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-hi"
        >
          查看完整榜单
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <RecentActivityTicker rows={topRows} />

      <div className="glass-card mt-4 overflow-hidden">
        <div className="hidden grid-cols-[44px_1.35fr_1fr_72px_84px_72px_80px] gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-lo md:grid">
          <div>#</div>
          <div>渠道 / 模型</div>
          <div></div>
          <div className="text-right">P95</div>
          <div className="text-right">缓存</div>
          <div className="text-center">评级</div>
          <div className="text-right">更新</div>
        </div>

        {topRows.map((row, index) => (
          <div
            key={row.rankKey}
            className="grid grid-cols-2 gap-2 border-b border-slate-100 px-5 py-3.5 text-sm transition-colors last:border-0 hover:bg-slate-50 md:grid-cols-[44px_1.35fr_1fr_72px_84px_72px_80px]"
          >
            <div className="font-mono text-lo md:self-center">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="min-w-0 font-medium text-hi md:self-center">
              <span className="block truncate">{row.channelHandle}</span>
            </div>
            <div className="truncate font-mono text-xs text-mid md:self-center">
              {row.model}
            </div>
            <div className="font-mono text-right text-hi md:self-center">
              {fmtSeconds(row.p95Ms)}
            </div>
            <div className="font-mono text-right text-mid md:self-center">
              {fmtCacheHit(row.cacheHitRate)}
            </div>
            <div className="text-center md:self-center">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 font-mono text-xs font-bold ${gradeTone(row.grade)}`}>
                {row.grade}
              </span>
            </div>
            <div className="text-right text-xs text-lo md:self-center">
              {fmtLastChecked(row.lastCheckedHours)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function gradeTone(grade: LeaderboardRow["grade"]) {
  if (grade === "A") return "text-ok";
  if (grade === "B") return "text-warn";
  return "text-err";
}
