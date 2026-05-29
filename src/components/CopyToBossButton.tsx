"use client";

import { useMemo, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import type { Report } from "@/lib/report";
import { protocolLabel } from "@/lib/leaderboard";

export default function CopyToBossButton({ report }: { report: Report }) {
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => buildBossSummary(report), [report]);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-ghost h-10 !rounded-lg !px-2 !py-2 text-xs sm:text-sm"
      title="复制 7 行以内的采购摘要"
    >
      <ClipboardCopy className="mr-1.5 h-4 w-4" />
      {copied ? "已复制" : "复制给老板"}
    </button>
  );
}

function buildBossSummary(report: Report) {
  const source = report.meta.channelHandle || "未知渠道";
  const findings = [
    report.dimensions.cache.verdict,
    report.dimensions.purity.verdict,
    report.dimensions.latency.verdict,
  ].map((line) => compact(line));

  return [
    `AIBench 检测摘要：${source} / ${report.meta.model}`,
    `结论：${report.verdictTitle}`,
    `协议：${protocolLabel[report.meta.protocol]}，样本 ${report.meta.sampleCount} 次，用时 ${report.meta.durationSec}s`,
    `发现 1：${findings[0]}`,
    `发现 2：${findings[1]}`,
    `发现 3：${findings[2]}`,
    `建议：先小流量灰度，重点复核缓存账单和来源稳定性。`,
  ].join("\n");
}

function compact(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 46);
}
