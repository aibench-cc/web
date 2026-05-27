"use client";

import { Printer, Share2, RotateCw, Check, AlertTriangle, X, MinusCircle } from "lucide-react";
import {
  type ReportMeta,
  type Signal,
  type DimensionResult,
  type DimKey,
  overallBadge,
  signalLabel,
} from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

// 顶部 checklist 选用的四个关键维度,顺序固定
const CHECKLIST_KEYS: DimKey[] = ["purity", "latency", "cache", "cost"];
const CHECKLIST_LABEL: Record<DimKey, string> = {
  purity: "模型纯度",
  latency: "延迟分布",
  cache: "缓存命中",
  cost: "真实成本",
  ratelimit: "限流策略",
  ttft: "流式 TTFT",
  provenance: "渠道出处",
};

function signalIcon(s: Signal) {
  if (s === "green") return <Check className="h-3.5 w-3.5" />;
  if (s === "yellow") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (s === "red") return <X className="h-3.5 w-3.5" />;
  return <MinusCircle className="h-3.5 w-3.5" />;
}

function signalTone(s: Signal) {
  if (s === "green") return "border-ok/40 bg-ok/[0.08] text-ok";
  if (s === "yellow") return "border-warn/40 bg-warn/[0.08] text-warn";
  if (s === "red") return "border-err/40 bg-err/[0.08] text-err";
  return "border-white/10 bg-white/[0.04] text-lo";
}

export default function ReportHeader({
  overall,
  verdictTitle,
  verdictDetail,
  meta,
  dimensions,
  onPrint,
  onShare,
  onRecheck,
  shareToast,
}: {
  overall: Signal;
  verdictTitle: string;
  verdictDetail: string;
  meta: ReportMeta;
  dimensions: Record<DimKey, DimensionResult>;
  onPrint: () => void;
  onShare: () => void;
  onRecheck: () => void;
  shareToast: boolean;
}) {
  // skipped 不会作为整体档(取最差时已剔除),兜底当 green 处理
  const eff = overall === "skipped" ? "green" : overall;
  const badge = overallBadge[eff];
  const verdictBorder =
    eff === "red"
      ? "border-err/50 print:border-err"
      : eff === "yellow"
        ? "border-warn/50 print:border-warn"
        : "border-ok/50 print:border-ok";

  return (
    <div className="glass-card p-6 print:break-inside-avoid">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* 大圆判定徽章 */}
        <div
          className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-2 sm:h-32 sm:w-32 ${badge.box} verdict-pill verdict-pill--${eff} print:h-auto print:w-auto print:flex-row print:items-center print:gap-1.5 print:rounded-lg print:px-4 print:py-2 print:border`}
        >
          <span className="h-3 w-3 rounded-full bg-current animate-pulse-dot print:hidden" />
          <span className="mt-2 text-2xl font-bold leading-none print:mt-0 print:text-lg">
            {signalLabel[overall]}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider opacity-70 print:hidden">
            整体评估
          </span>
        </div>

        {/* 总结论 */}
        <div className={`min-w-0 flex-1 border-l-2 pl-4 ${verdictBorder} print:border-l-4`}>
          <h1 className="text-lg font-semibold text-hi sm:text-xl print:text-xl">
            {verdictTitle}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-mid">{verdictDetail}</p>
        </div>
      </div>

      {/* 四项 checklist */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CHECKLIST_KEYS.map((k) => {
          const d = dimensions[k];
          return (
            <div
              key={k}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${signalTone(d.signal)}`}
              title={d.verdict}
            >
              <span className="shrink-0">{signalIcon(d.signal)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                  {CHECKLIST_LABEL[k]}
                </div>
                <div className="truncate text-[11px] opacity-90">
                  {signalLabel[d.signal]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 元信息行(匿名) */}
      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-lo">
        <Meta k="协议" v={protocolLabel[meta.protocol]} />
        <Sep />
        <Meta k="模型" v={meta.model} />
        <Sep />
        <Meta k="渠道" v={meta.channelHandle} />
        <Sep />
        <Meta k="检测时间" v={meta.checkedAt} />
        <Sep />
        <Meta k="样本" v={`${meta.sampleCount} 次`} />
        <Sep />
        <Meta k="用时" v={`${meta.durationSec}s`} />
        {meta.claudeCode && (
          <>
            <Sep />
            <span
              className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/[0.08] px-1.5 py-0.5 text-xs font-medium text-brand-bright print:border-black/40 print:bg-transparent print:text-black"
              title="本次检测以 Claude Code CLI 客户端身份发起请求"
            >
              Claude Code 限制专属
            </span>
          </>
        )}
      </div>

      {/* 操作条(打印态隐藏) */}
      <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
        <button type="button" onClick={onPrint} className="btn-glow !px-4 !py-2.5 !text-sm">
          <Printer className="mr-1.5 h-4 w-4" />
          打印 / 导出报告
        </button>
        <button type="button" onClick={onShare} className="btn-ghost !px-4 !py-2.5 !text-sm">
          <Share2 className="mr-1.5 h-4 w-4" />
          {shareToast ? "已复制,链接匿名" : "分享链接"}
        </button>
        <button type="button" onClick={onRecheck} className="btn-ghost !px-4 !py-2.5 !text-sm">
          <RotateCw className="mr-1.5 h-4 w-4" />
          重新检测
        </button>
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-lo print:hidden">
        分享链接短期有效;若需长期留存,请用上面的“打印 / 导出报告”保存 PDF。
      </p>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {k}
      <span className="font-mono text-mid">{v}</span>
    </span>
  );
}

function Sep() {
  // 屏幕上极淡的分隔点;白纸打印时 white/15 会隐形,故打印态压成浅墨灰
  return <span className="text-white/15 print:text-black/25">·</span>;
}
