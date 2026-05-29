"use client";

import {
  BadgeCheck,
  ClipboardCopy,
  Download,
  GitCompare,
  Printer,
  RotateCw,
  Share2,
} from "lucide-react";
import { type Report, type Signal, overallBadge, signalLabel } from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

const findings = [
  "缓存命中信号偏弱，长上下文重复调用可能没有拿到官方缓存折扣。",
  "模型字段与请求一致，但自报身份没有给出明确版本，需要结合更多探针判断。",
  "延迟表现稳定，适合普通业务流量先小范围试用。",
];

const actionItems = [
  { label: "打印", icon: Printer },
  { label: "分享", icon: Share2 },
  { label: "复制给老板", icon: ClipboardCopy },
  { label: "加入对比", icon: GitCompare },
  { label: "重测", icon: RotateCw },
];

function sourceTone(signal: Signal) {
  if (signal === "green") return "border-ok/40 bg-ok/[0.08] text-ok";
  if (signal === "red") return "border-err/40 bg-err/[0.08] text-err";
  return "border-warn/40 bg-warn/[0.08] text-warn";
}

export default function ReportHeaderV2({
  report,
  onAction,
}: {
  report: Report;
  onAction?: (action: string) => void;
}) {
  const eff = report.overall === "skipped" ? "green" : report.overall;
  const badge = overallBadge[eff];
  const provenance = report.dimensions.provenance;

  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/[0.08] px-2.5 py-1 text-xs font-medium text-brand-bright">
        <BadgeCheck className="h-3.5 w-3.5" />
        V2 预览
      </div>

      <div className="grid gap-5 xl:grid-cols-[9rem_1fr]">
        <div
          className={`flex aspect-square w-32 flex-col items-center justify-center rounded-full border-2 sm:w-36 ${badge.box} verdict-pill verdict-pill--${eff}`}
        >
          <span className="text-4xl font-bold leading-none">{signalLabel[report.overall]}</span>
          <span className="mt-1 text-xs uppercase tracking-wide opacity-75">overall</span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${sourceTone(provenance.signal)}`}>
              来源 {signalLabel[provenance.signal]} · 置信度中
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-lo">
              {report.meta.channelHandle}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold leading-tight text-hi">
            {report.verdictTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mid">{report.verdictDetail}</p>

          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Meta label="协议" value={protocolLabel[report.meta.protocol]} />
            <Meta label="模型" value={report.meta.model} />
            <Meta label="样本" value={`${report.meta.sampleCount} 次`} />
            <Meta label="耗时" value={`${report.meta.durationSec}s`} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
          <h2 className="text-sm font-semibold text-hi">关键发现</h2>
          <div className="mt-3 space-y-2">
            {findings.map((finding, index) => (
              <div key={finding} className="flex gap-2 text-sm leading-relaxed text-mid">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[11px] text-hi">
                  {index + 1}
                </span>
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
          <h2 className="text-sm font-semibold text-hi">采购建议</h2>
          <p className="mt-3 text-sm leading-relaxed text-mid">
            这条渠道可以进入候选池，但不要直接承担核心生产流量。建议先用低风险业务灰度 3 天，并重点观察缓存账单和来源稳定性。
          </p>
          <button
            type="button"
            onClick={() => onAction?.("export")}
            className="btn-ghost mt-4 h-10 w-full !rounded-lg !px-3 !py-2 text-sm"
          >
            <Download className="mr-1.5 h-4 w-4" />
            导出采购摘要
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onAction?.(item.label)}
              className="btn-ghost h-10 !rounded-lg !px-2 !py-2 text-xs sm:text-sm"
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
      <div className="text-[11px] text-lo">{label}</div>
      <div className="mt-0.5 truncate font-mono text-xs text-hi">{value}</div>
    </div>
  );
}
