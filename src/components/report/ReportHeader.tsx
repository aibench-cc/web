"use client";

import { Printer, Share2, RotateCw } from "lucide-react";
import {
  type ReportMeta,
  type Signal,
  overallBadge,
  signalLabel,
} from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

export default function ReportHeader({
  overall,
  verdictTitle,
  verdictDetail,
  meta,
  onPrint,
  onShare,
  onRecheck,
  shareToast,
}: {
  overall: Signal;
  verdictTitle: string;
  verdictDetail: string;
  meta: ReportMeta;
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
        {/* SLA 徽章 */}
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border sm:h-20 sm:w-20 ${badge.box} verdict-pill verdict-pill--${eff} print:h-auto print:w-auto print:flex-row print:items-center print:gap-1.5 print:rounded-lg print:px-4 print:py-2`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse-dot print:hidden" />
          <span className="mt-1.5 text-xs font-semibold print:mt-0 print:text-lg print:leading-none">
            {signalLabel[overall]}
          </span>
        </div>

        {/* 总结论 */}
        <div className={`min-w-0 flex-1 border-l-2 pl-4 ${verdictBorder} print:border-l-4`}>
          <h1 className="text-lg font-semibold text-hi sm:text-xl print:text-xl">
            整体评估:{verdictTitle}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-mid">{verdictDetail}</p>
        </div>
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
