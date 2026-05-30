"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  GitCompare,
  Printer,
  RotateCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import CopyToBossButton from "@/components/CopyToBossButton";
import SourceBadge, { type SourceKind } from "@/components/SourceBadge";
import {
  dimOrder,
  dimTitle,
  type DimensionResult,
  type Report,
  type Signal,
  signalLabel,
} from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

const actionItems = [
  { label: "打印", icon: Printer },
  { label: "分享", icon: Share2 },
  { label: "加入对比", icon: GitCompare },
  { label: "重测", icon: RotateCw },
];

const summaryTone: Record<
  Exclude<Signal, "skipped">,
  {
    panel: string;
    badge: string;
    icon: typeof AlertTriangle;
    title: string;
    grade: string;
    accent: string;
  }
> = {
  green: {
    panel: "border-ok/25 bg-ok/10",
    badge: "border-ok/30 bg-white text-ok",
    icon: CheckCircle2,
    title: "整体可用",
    grade: "A 级",
    accent: "bg-ok",
  },
  yellow: {
    panel: "border-warn/30 bg-warn/10",
    badge: "border-warn/35 bg-white text-warn",
    icon: ShieldAlert,
    title: "基本可用，需要复核",
    grade: "B 级",
    accent: "bg-warn",
  },
  red: {
    panel: "border-err/30 bg-err/10",
    badge: "border-err/35 bg-white text-err",
    icon: AlertTriangle,
    title: "暂不建议使用",
    grade: "C 级",
    accent: "bg-err",
  },
};

const signalTone: Record<Signal, { border: string; bg: string; text: string; dot: string }> = {
  green: {
    border: "border-ok/25",
    bg: "bg-ok/10",
    text: "text-ok",
    dot: "bg-ok",
  },
  yellow: {
    border: "border-warn/30",
    bg: "bg-warn/10",
    text: "text-warn",
    dot: "bg-warn",
  },
  red: {
    border: "border-err/30",
    bg: "bg-err/10",
    text: "text-err",
    dot: "bg-err",
  },
  skipped: {
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-lo",
    dot: "bg-lo",
  },
};

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
  const tone = summaryTone[eff];
  const StatusIcon = tone.icon;
  const sourceKind = sourceKindFor(report.meta.channelHandle);
  const findings = buildFindings(report);
  const riskCount = dimOrder.filter((key) => {
    const signal = report.dimensions[key].signal;
    return signal === "yellow" || signal === "red";
  }).length;
  const passCount = dimOrder.filter((key) => report.dimensions[key].signal === "green").length;

  return (
    <section className="glass-card min-w-0 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className={`min-w-0 rounded-lg border p-4 sm:p-5 ${tone.panel}`}>
            <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-2.5 py-1 text-xs font-medium text-hi">
                  <BadgeCheck className="h-3.5 w-3.5 text-brand" />
                  检测报告
                </div>
                <div className="mt-4 flex min-w-0 items-start gap-3">
                  <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone.badge}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${tone.badge}`}>
                        {signalLabel[report.overall]} · {tone.grade}
                      </span>
                      <span className="text-xs font-medium text-mid">
                        {riskCount} 项需注意 / {passCount} 项通过
                      </span>
                    </div>
                    <h1 className="mt-2 break-words text-2xl font-semibold leading-tight text-hi sm:text-3xl">
                      {tone.title}
                    </h1>
                    <p className="mt-2 max-h-24 max-w-2xl overflow-y-auto break-words pr-1 text-sm leading-relaxed text-mid">
                      {report.verdictDetail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-2 md:w-72 md:shrink-0">
                <Metric label="综合等级" value={tone.grade} />
                <Metric label="风险项" value={`${riskCount} 项`} />
                <Metric label="样本" value={`${report.meta.sampleCount} 次`} />
                <Metric label="耗时" value={`${report.meta.durationSec}s`} />
              </div>
            </div>

            <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Meta label="协议" value={protocolLabel[report.meta.protocol]} />
              <Meta label="模型" value={report.meta.model} />
              <Meta label="渠道" value={report.meta.channelHandle} />
              <Meta label="检查时间" value={report.meta.checkedAt} />
            </div>
          </div>

          <div className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-hi">来源与可信度</h2>
                <p className="mt-1 text-xs leading-relaxed text-lo">
                  通过 URL、响应头、body id 与缓存轮询特征综合判断。
                </p>
              </div>
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
            </div>
            <SourceBadge
              kind={sourceKind}
              confidence={78}
              host={report.meta.channelHandle}
              signals={[
                {
                  label: "URL",
                  value: report.meta.channelHandle,
                  signal: sourceKind === "official" ? "green" : "yellow",
                },
                { label: "headers", value: "anthropic-* present", signal: "green" },
                { label: "body id", value: "msg_* native", signal: "green" },
                { label: "rotation", value: "cache miss pattern", signal: "yellow" },
              ]}
            />
            <div className="max-h-24 overflow-y-auto rounded-lg border border-slate-200 bg-white px-3 py-2 pr-2 text-xs leading-relaxed text-mid">
              来源识别是基于响应特征的推断，不等同于渠道自证；建议结合账单、限流和复测结果一起判断。
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-hi">关键发现</h2>
                <p className="mt-1 text-xs text-lo">
                  按风险优先级排序，先处理会影响采购判断的项。
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-mid">
                Top {findings.length}
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              {findings.map((finding, index) => {
                const itemTone = signalTone[finding.signal];
                return (
                  <div
                    key={`${finding.title}-${finding.detail}`}
                    className={`grid min-w-0 gap-3 overflow-hidden rounded-lg border bg-white px-3 py-3 md:grid-cols-[2rem_9rem_minmax(0,1fr)] ${itemTone.border}`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${itemTone.bg} font-mono text-xs font-semibold ${itemTone.text}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${itemTone.dot}`} />
                        <span className="text-sm font-semibold text-hi">{finding.title}</span>
                      </div>
                      <div className={`mt-1 text-xs font-medium ${itemTone.text}`}>
                        {finding.label}
                      </div>
                    </div>
                    <p className="min-w-0 max-h-24 overflow-y-auto break-words pr-1 text-sm leading-relaxed text-mid">
                      {finding.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-hi">下一步建议</h2>
            <div className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1 text-sm leading-relaxed text-mid">
              <p>
                可以进入候选池，但先不要直接承接核心生产流量。
              </p>
              <p>
                建议先用低风险业务灰度 3 天，并重点观察缓存账单和来源稳定性。
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <CopyToBossButton report={report} className="col-span-2 min-w-0" />
              {actionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onAction?.(item.label)}
                    className="btn-ghost h-10 min-w-0 !rounded-lg !px-2 !py-2 text-xs sm:text-sm"
                  >
                    <Icon className="mr-1.5 h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 px-3 py-2">
      <div className="text-[11px] text-lo">{label}</div>
      <div className="mt-0.5 truncate font-mono text-sm font-semibold text-hi">{value}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/70 bg-white/70 px-3 py-2">
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

  return chosen.map(({ key, dim }) => ({
    title: dimTitle[key],
    detail: dim.verdict,
    signal: dim.signal,
    label: findingLabel(dim),
  }));
}

function findingLabel(dim: DimensionResult) {
  if (dim.signal === "red") return "需要优先处理";
  if (dim.signal === "yellow") return "建议复核";
  if (dim.signal === "green") return "表现正常";
  return "未参与评分";
}

function signalRank(signal: Signal) {
  if (signal === "red") return 3;
  if (signal === "yellow") return 2;
  if (signal === "skipped") return 1;
  return 0;
}
