"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gauge,
  Database,
  ShieldCheck,
  Activity,
  Coins,
  Zap,
  Crosshair,
} from "lucide-react";
import {
  type Report,
  type DimKey,
  dimOrder,
  dimTitle,
} from "@/lib/report";
import ReportHeader from "./ReportHeader";
import DimensionCard from "./DimensionCard";
import PrintSelector, { type PrintDetail } from "./PrintSelector";

const dimIcon: Record<DimKey, React.ComponentType<{ className?: string }>> = {
  latency: Gauge,
  cache: Database,
  ratelimit: ShieldCheck,
  purity: Activity,
  cost: Coins,
  ttft: Zap,
  provenance: Crosshair,
};

const allSelected = () =>
  dimOrder.reduce(
    (acc, k) => ({ ...acc, [k]: true }),
    {} as Record<DimKey, boolean>,
  );

export default function ReportView({ report }: { report: Report }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<DimKey | null>(null);
  const [printing, setPrinting] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selection, setSelection] = useState<Record<DimKey, boolean>>(allSelected);
  const [detail, setDetail] = useState<PrintDetail>("full");
  const [shareToast, setShareToast] = useState(false);

  // 打印流程: 勾选确认 -> 进入打印态(强制展开)-> 等渲染完触发原生打印 -> 打印结束复位
  useEffect(() => {
    if (!printing) return;
    const after = () => setPrinting(false);
    window.addEventListener("afterprint", after);
    const t = setTimeout(() => window.print(), 80);
    return () => {
      window.removeEventListener("afterprint", after);
      clearTimeout(t);
    };
  }, [printing]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2200);
  };

  // 打印态: summary 模式下整卡折叠态(只出结论), 不强制展开
  const forceExpand = printing && detail === "full";

  return (
    <main className="mx-auto max-w-3xl px-6 pt-10 pb-8 print:max-w-none print:px-0 print:pt-0">
      {/* 打印专属页眉(仅打印可见) */}
      <PrintHeader checkedAt={report.meta.checkedAt} />

      <div className="flex flex-col gap-4">
        <ReportHeader
          overall={report.overall}
          verdictTitle={report.verdictTitle}
          verdictDetail={report.verdictDetail}
          meta={report.meta}
          onPrint={() => setShowSelector(true)}
          onShare={handleShare}
          onRecheck={() => router.push("/#check")}
          shareToast={shareToast}
        />

        <p className="px-1 pt-1 text-xs text-lo print:hidden">
          下面是各维度的结论,点任意一张卡片可展开「这对你意味着什么」+ 专业判据与图表。
        </p>

        {dimOrder.map((k) => (
          <DimensionCard
            key={k}
            dimKey={k}
            icon={dimIcon[k]}
            title={dimTitle[k]}
            data={report.dimensions[k]}
            open={expanded === k}
            printing={forceExpand}
            printIncluded={selection[k]}
            onToggle={() =>
              setExpanded((cur) => (cur === k ? null : k))
            }
          />
        ))}

        <p className="mt-2 text-center text-xs text-lo">
          判据全部公开,你可以自己复核 ·{" "}
          <a
            href="/about#methodology"
            className="text-brand-bright transition-colors hover:text-hi print:hidden"
          >
            如何复核 →
          </a>
        </p>
      </div>

      {/* 打印专属页脚(仅打印可见,含模盒 12px 赞助署名) */}
      <PrintFooter reportId={report.reportId} model={report.meta.model} />

      {showSelector && (
        <PrintSelector
          selection={selection}
          detail={detail}
          onChange={setSelection}
          onDetailChange={setDetail}
          onConfirm={() => {
            setShowSelector(false);
            setPrinting(true);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </main>
  );
}

function PrintHeader({ checkedAt }: { checkedAt: string }) {
  return (
    <div className="mb-4 hidden items-center justify-between border-b border-black/10 pb-2 print:flex">
      <span className="text-sm font-semibold text-black">AIBench.cc 检测报告</span>
      <span className="text-xs text-black/60">检测时间 {checkedAt}</span>
    </div>
  );
}

function PrintFooter({ reportId, model }: { reportId: string; model: string }) {
  return (
    <div className="mt-6 hidden flex-col gap-1 border-t border-black/10 pt-2 text-center print:flex">
      <p className="text-[12px] text-black/70">
        判据公开,可自行复核 · 本报告为单次检测快照,非长期结论
      </p>
      <p className="text-[12px] text-black/60">
        报告 r/{reportId} · 模型 {model}(匿名,不含 key 与域名)
      </p>
      <p className="text-[12px] text-black/60">
        本检测站运营由「模盒 modelboxs.com」赞助;检测逻辑与评分中立、公开、可审计
      </p>
    </div>
  );
}
