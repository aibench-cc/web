"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  type DimKey,
  type DimensionResult,
  signalText,
} from "@/lib/report";
import { SignalDot, Evidence } from "./primitives";
import { LatencyScatter, CacheTokenBars, CostCompareBars, TtftTimeline } from "./charts";

export type DimensionCardProps = {
  dimKey: DimKey;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  data: DimensionResult;
  open: boolean;
  printing: boolean;
  printIncluded: boolean;
  onToggle: () => void;
};

export default function DimensionCard({
  dimKey,
  icon: Icon,
  title,
  data,
  open,
  printing,
  printIncluded,
  onToggle,
}: DimensionCardProps) {
  const expanded = open || printing;
  // 打印时被取消勾选的维度整卡隐藏
  const hideOnPrint = !printIncluded ? "print:hidden" : "";

  return (
    <div
      className={`glass-card overflow-hidden print:break-inside-avoid print:border print:border-black/10 ${hideOnPrint}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.025]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/[0.1] text-brand-bright print:bg-transparent">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-hi">{title}</span>
          <span className="block truncate text-sm text-mid">{data.verdict}</span>
        </span>
        <SignalDot signal={data.signal} pulse showLabel />
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-lo transition-transform print:hidden ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-5 border-t border-white/[0.04] bg-white/[0.015] px-4 py-5 print:bg-transparent">
          {/* 段1:小白翻译 */}
          <div className="border-l-2 border-brand/40 pl-3">
            <p className="mb-1 text-sm font-medium text-hi">这对你意味着什么?</p>
            <p className="text-sm leading-relaxed text-mid">{data.layman}</p>
          </div>

          {/* 段2:专业判据 —— 纯度走指纹清单, 出处走信号列表, 其余走 Evidence 网格 */}
          {dimKey === "purity" && data.fingerprints ? (
            <FingerprintList data={data} />
          ) : dimKey === "provenance" && data.provenanceSignals ? (
            <SignalList signals={data.provenanceSignals} evidence={data} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.evidence.map((e) => (
                <Evidence key={e.label} label={e.label} value={e.value} />
              ))}
            </div>
          )}

          {/* 段3:图表 */}
          <DimensionChart dimKey={dimKey} data={data} />

          {/* 中性补充说明(推理模型自报跳过 / 纯度&出处的局限声明) */}
          {data.note && (
            <p className="text-xs leading-relaxed text-lo">
              <span className="text-warn">说明:</span> {data.note}
            </p>
          )}

          {/* 判据来源 + 如何复核 */}
          <p className="text-xs text-lo">
            {data.thresholdNote && <>判据来源:{data.thresholdNote} · </>}
            <Link
              href="/about#methodology"
              className="text-brand-bright transition-colors hover:text-hi print:hidden"
            >
              如何复核 →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function DimensionChart({ dimKey, data }: { dimKey: DimKey; data: DimensionResult }) {
  if (dimKey === "latency" && data.latencyScatter) {
    return <LatencyScatter data={data.latencyScatter} p95Ms={data.latencyP95Ms} />;
  }
  if (dimKey === "cache" && data.cacheBars) {
    return <CacheTokenBars data={data.cacheBars} />;
  }
  if (dimKey === "cost" && data.costCompare) {
    return (
      <CostCompareBars
        actualUsd={data.costCompare.actualUsd}
        worstCaseUsd={data.costCompare.worstCaseUsd}
      />
    );
  }
  if (dimKey === "ttft" && data.ttftMarkers) {
    return <TtftTimeline markers={data.ttftMarkers} />;
  }
  return null;
}

// 纯度:逐路指纹「期望 vs 实际」
function FingerprintList({ data }: { data: DimensionResult }) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.fingerprints!.map((f) => (
        <div
          key={f.name}
          className="flex flex-col gap-1 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between print:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <SignalDot signal={f.status} showLabel />
            <span className="text-sm text-hi">{f.name}</span>
            {f.weak && (
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-lo">
                弱信号
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 font-mono text-xs text-mid sm:items-end">
            <span>期望 {f.expected}</span>
            <span className={signalText[f.status]}>实际 {f.actual}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// 出处:证据短句列表 + 标签/可信度 Evidence
function SignalList({
  signals,
  evidence,
}: {
  signals: string[];
  evidence: DimensionResult;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {evidence.evidence.map((e) => (
          <Evidence key={e.label} label={e.label} value={e.value} />
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {signals.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-mid">
            <span className="text-brand-bright">•</span>
            <span className="leading-relaxed">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
