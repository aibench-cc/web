"use client";

import {
  BadgeCheck,
  Download,
  GitCompare,
  Printer,
  RotateCw,
  Share2,
} from "lucide-react";
import CopyToBossButton from "@/components/CopyToBossButton";
import SourceBadge, { type SourceKind } from "@/components/SourceBadge";
import { dimOrder, dimTitle, type Report, overallBadge, signalLabel } from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

const actionItems = [
  { label: "打印", icon: Printer },
  { label: "分享", icon: Share2 },
  { label: "加入对比", icon: GitCompare },
  { label: "重测", icon: RotateCw },
];

function sourceKindFor(host: string): SourceKind {
  const normalized = host.toLowerCase();
  if (
    normalized === "api.openai.com" ||
    normalized === "api.anthropic.com" ||
    normalized === "generativelanguage.googleapis.com"
  ) {
    return "official";
  }
  if (normalized.startsWith("ch-")) return "unknown";
  return "relay";
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
  const sourceKind = sourceKindFor(report.meta.channelHandle);
  const findings = buildFindings(report);

  return (
    <section className="glass-card min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/[0.08] px-2.5 py-1 text-xs font-medium text-brand-bright">
        <BadgeCheck className="h-3.5 w-3.5" />
        检测报告
      </div>

      <div className="grid gap-5">
        <div
          className={`mx-auto flex aspect-square w-32 flex-col items-center justify-center rounded-full border-2 sm:w-36 ${badge.box} verdict-pill verdict-pill--${eff}`}
        >
          <span className="text-4xl font-bold leading-none">{signalLabel[report.overall]}</span>
          <span className="mt-1 text-xs uppercase tracking-wide opacity-75">overall</span>
        </div>

        <div className="min-w-0">
          <SourceBadge
            kind={sourceKind}
            confidence={78}
            host={report.meta.channelHandle}
            signals={[
              { label: "URL", value: report.meta.channelHandle, signal: sourceKind === "official" ? "green" : "yellow" },
              { label: "headers", value: "anthropic-* present", signal: "green" },
              { label: "body id", value: "msg_* native", signal: "green" },
              { label: "rotation", value: "cache miss pattern", signal: "yellow" },
            ]}
          />

          <h1 className="mt-3 break-words text-2xl font-semibold leading-tight text-hi">
            {report.verdictTitle}
          </h1>
          <p className="mt-2 break-words text-sm leading-relaxed text-mid">{report.verdictDetail}</p>

          <div className="mt-4 grid min-w-0 gap-2 text-sm sm:grid-cols-2">
            <Meta label="协议" value={protocolLabel[report.meta.protocol]} />
            <Meta label="模型" value={report.meta.model} />
            <Meta label="样本" value={`${report.meta.sampleCount} 次`} />
            <Meta label="耗时" value={`${report.meta.durationSec}s`} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
          <h2 className="text-sm font-semibold text-hi">关键发现</h2>
          <div className="mt-3 space-y-2">
            {findings.map((finding, index) => (
              <div key={finding} className="flex gap-2 text-sm leading-relaxed text-mid">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[11px] text-hi">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words">{finding}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
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
            导出摘要
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <CopyToBossButton report={report} className="col-span-2" />
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

function buildFindings(report: Report) {
  const ranked = dimOrder
    .map((key) => ({ key, dim: report.dimensions[key] }))
    .sort((a, b) => signalRank(b.dim.signal) - signalRank(a.dim.signal));

  const primary = ranked.filter(({ dim }) => dim.signal !== "green").slice(0, 3);
  const chosen = primary.length > 0 ? primary : ranked.slice(0, 3);

  return chosen.map(({ key, dim }) => `${dimTitle[key]}：${dim.verdict}`);
}

function signalRank(signal: Report["overall"]) {
  if (signal === "red") return 3;
  if (signal === "yellow") return 2;
  if (signal === "skipped") return 1;
  return 0;
}
