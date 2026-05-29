"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCopy, X } from "lucide-react";
import type { Report, Signal } from "@/lib/report";
import { loadCompareIds, removeCompareId, saveCompareIds } from "@/lib/compare";
import { getDemoReport } from "@/lib/demoReports";
import { signalLabel } from "@/lib/report";

type CompareItem = {
  id: string;
  report: Report | null;
};

const rows: Array<{ label: string; value: (report: Report) => string; tone?: (report: Report) => string }> = [
  { label: "结论", value: (r) => r.verdictTitle },
  { label: "模型", value: (r) => r.meta.model },
  { label: "协议", value: (r) => r.meta.protocol },
  { label: "来源", value: (r) => r.meta.channelHandle },
  { label: "样本", value: (r) => `${r.meta.sampleCount} 次` },
  { label: "P95 延迟", value: (r) => valueOf(r, "latency", "P95") },
  { label: "缓存命中", value: (r) => valueOf(r, "cache", "命中率"), tone: (r) => signalTone(r.dimensions.cache.signal) },
  { label: "模型纯度", value: (r) => signalLabel[r.dimensions.purity.signal], tone: (r) => signalTone(r.dimensions.purity.signal) },
  { label: "成本", value: (r) => valueOf(r, "cost", "本次实测"), tone: (r) => signalTone(r.dimensions.cost.signal) },
  { label: "采购建议", value: (r) => recommendation(r.overall) },
];

export default function CompareTable({
  initialIds,
  initialReports,
}: {
  initialIds: string[];
  initialReports: CompareItem[];
}) {
  const [ids, setIds] = useState(initialIds);
  const [copied, setCopied] = useState(false);
  const initialKey = initialIds.join(",");

  useEffect(() => {
    if (initialIds.length > 0) {
      saveCompareIds(initialIds);
      setIds(initialIds);
      return;
    }
    const stored = loadCompareIds();
    if (stored.length > 0) setIds(stored);
  }, [initialIds, initialKey]);

  const items = useMemo(() => {
    const byId = new Map(initialReports.map((item) => [item.id, item.report]));
    return ids.slice(0, 4).map((id) => ({ id, report: byId.get(id) ?? getDemoReport(id) ?? null }));
  }, [ids, initialReports]);

  const remove = (id: string) => {
    const next = removeCompareId(id);
    setIds(next);
  };

  const copy = async () => {
    const text = buildCompareSummary(items);
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (items.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <h1 className="text-xl font-semibold text-hi">对比清单为空</h1>
        <p className="mt-2 text-sm text-mid">在报告页点击“加入对比”，最多可并排 4 份报告。</p>
        <Link href="/r/sample-yellow" className="btn-glow mt-5">
          打开示例报告
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-hi">对比清单</h1>
          <p className="mt-1 text-sm text-mid">最多 4 列并排，优先看来源、缓存、延迟和采购建议。</p>
        </div>
        <button type="button" onClick={copy} className="btn-ghost !rounded-lg !px-4 !py-2.5 text-sm">
          <ClipboardCopy className="mr-1.5 h-4 w-4" />
          {copied ? "已复制" : "复制对比给老板"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/[0.07] bg-card/70">
        <div
          className="grid min-w-[760px]"
          style={{ gridTemplateColumns: `9rem repeat(${items.length}, minmax(10rem, 1fr))` }}
        >
          <div className="border-b border-white/[0.06] px-3 py-3 text-xs uppercase tracking-wide text-lo">指标</div>
          {items.map((item) => (
            <div key={item.id} className="border-b border-l border-white/[0.06] px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-hi">{item.report?.meta.channelHandle ?? item.id}</div>
                  <div className="mt-1 truncate text-xs text-lo">{item.report?.meta.model ?? "报告不可达"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="shrink-0 rounded-md border border-white/10 p-1 text-lo hover:text-hi"
                  title="移出对比"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {rows.map((row) => (
            <CompareRow key={row.label} label={row.label} items={items} value={row.value} tone={row.tone} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareRow({
  label,
  items,
  value,
  tone,
}: {
  label: string;
  items: CompareItem[];
  value: (report: Report) => string;
  tone?: (report: Report) => string;
}) {
  return (
    <>
      <div className="border-b border-white/[0.04] px-3 py-3 text-sm text-lo">{label}</div>
      {items.map((item) => (
        <div key={`${label}-${item.id}`} className="border-b border-l border-white/[0.04] px-3 py-3 text-sm">
          {item.report ? (
            <span className={tone?.(item.report) ?? "text-mid"}>{value(item.report)}</span>
          ) : (
            <span className="text-lo">快照不可达</span>
          )}
        </div>
      ))}
    </>
  );
}

function valueOf(report: Report, dim: keyof Report["dimensions"], label: string) {
  return report.dimensions[dim].evidence.find((item) => item.label === label)?.value ?? "—";
}

function signalTone(signal: Signal) {
  if (signal === "green") return "text-ok";
  if (signal === "yellow") return "text-warn";
  if (signal === "red") return "text-err";
  return "text-lo";
}

function recommendation(signal: Signal) {
  if (signal === "green") return "可进入生产候选";
  if (signal === "yellow") return "先小流量灰度";
  if (signal === "red") return "暂不建议采购";
  return "需要复测";
}

function buildCompareSummary(items: CompareItem[]) {
  const available = items.filter((item): item is { id: string; report: Report } => !!item.report);
  const lines = [
    `AIBench 对比：${available.length} 个渠道`,
    ...available.map((item) => `${item.report.meta.channelHandle} / ${item.report.meta.model}：${item.report.verdictTitle}`),
    "重点看：缓存命中、P95 延迟、模型纯度、来源稳定性。",
    "建议：优先签绿色/黄色中延迟稳定且缓存明确的渠道。",
  ];
  return lines.slice(0, 7).join("\n");
}
