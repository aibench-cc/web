import type { LeaderboardRow } from "@/lib/leaderboard";

export default function RecentActivityTicker({ rows }: { rows: LeaderboardRow[] }) {
  const items = rows.slice(0, 8);
  const loop = [...items, ...items];

  return (
    <div className="vendor-marquee overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.025]">
      <div className="vendor-track vendor-track--left gap-3 py-2">
        {loop.map((row, index) => (
          <div
            key={`${row.rankKey}-${index}`}
            className="flex min-w-max items-center gap-2 border-r border-white/[0.07] px-4 text-xs text-mid"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            <span className="font-mono text-hi">{row.channelHandle}</span>
            <span>{row.model}</span>
            <span className={gradeTone(row.grade)}>{row.grade} {row.score}%</span>
            <span className="text-lo">{formatActivityTime(row.lastCheckedHours)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function gradeTone(grade: LeaderboardRow["grade"]) {
  if (grade === "A") return "font-mono text-ok";
  if (grade === "B") return "font-mono text-warn";
  return "font-mono text-err";
}

function formatActivityTime(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} 分钟前`;
  return `${Math.round(hours)}h 前`;
}
