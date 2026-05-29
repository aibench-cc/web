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
import { addCompareId } from "@/lib/compare";
import ReportHeader from "./ReportHeader";
import ReportHeaderV2 from "./ReportHeaderV2";
import DimensionCard from "./DimensionCard";
import DimensionGroupV2, { type ProbeGroup } from "./DimensionGroupV2";
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

const v2ProbeGroups: ProbeGroup[] = [
  {
    key: "protocol",
    title: "A. 协议根基",
    summary: "Anthropic Messages 结构完整,usage 和 stop_reason 符合预期。",
    score: 38,
    maxScore: 38,
    probes: [
      {
        name: "A1 响应 Schema 合规",
        signal: "green",
        weight: 12,
        message: "messages 响应字段严格匹配,没有 OpenAI 兼容层泄漏。",
        raw_trace: { type: "message", role: "assistant", content: ["text"], usage: { input_tokens: 129, output_tokens: 64 } },
      },
      {
        name: "A2 Usage 字段完整性",
        signal: "green",
        weight: 8,
        message: "input/output/cache 三段 usage 可读取。",
        raw_trace: { input_tokens: 129, output_tokens: 64, cache_read_input_tokens: 0 },
      },
      { name: "A3 Stop Reason 合法", signal: "green", weight: 6, message: "stop_reason 返回 end_turn。", raw_trace: { stop_reason: "end_turn" } },
      { name: "A4 Max Tokens 遵守度", signal: "green", weight: 12, message: "短限额请求按预期截断。", raw_trace: { requested: 24, observed_output_tokens: 24 } },
    ],
  },
  {
    key: "identity",
    title: "B. 模型身份",
    summary: "主体字段一致,但自报版本和缓存轮询仍有弱信号。",
    score: 28,
    maxScore: 35,
    probes: [
      { name: "B1 响应 model 字段", signal: "green", weight: 5, message: "响应 model 与请求模型一致。", raw_trace: { requested: "claude-opus-4-7", actual: "claude-opus-4-7" } },
      { name: "B2 自我声明", signal: "yellow", weight: 6, message: "模型自称 Claude,但未给出精确版本。", raw_trace: { answer: "I am Claude, an AI assistant." } },
      { name: "B3 prompt_tokens 落点", signal: "green", weight: 6, message: "token 落点在基线容忍区间。", raw_trace: { baseline: 118, observed: 124, tolerance: "±30%" } },
      { name: "B5 Claude thinking/signature", signal: "yellow", weight: 18, message: "Day 4 接真实 signature_delta,当前为 mock 占位。", raw_trace: { signature_delta: "pending", thinking_blocks: 0 } },
    ],
  },
  {
    key: "runtime",
    title: "C. 运行表现",
    summary: "延迟和流式体验可用,伪流式判定等待真实探针接入。",
    score: 17,
    maxScore: 18,
    probes: [
      { name: "C1 延迟分布", signal: "green", weight: 6, message: "P95 低于 1 秒。", raw_trace: { p50_ms: 540, p95_ms: 820, p99_ms: 1180 } },
      { name: "C2 TTFT", signal: "green", weight: 4, message: "首字 0.6s,体感顺滑。", raw_trace: { ttft_ms: 600, first_event_ms: 580 } },
      { name: "C3 流式真实性", signal: "yellow", weight: 4, message: "chunk 间隔稳定性待真实 SSE 数据确认。", raw_trace: { chunk_count: 18, median_gap_ms: 42 } },
      { name: "C4 并发承载", signal: "green", weight: 4, message: "20 次采样未触发 429。", raw_trace: { total: 20, success: 20, rate_limited: 0 } },
    ],
  },
  {
    key: "cost-cache",
    title: "D. 成本缓存",
    summary: "缓存读取信号偏弱,采购前需要重点复测账单。",
    score: 3,
    maxScore: 7,
    probes: [
      { name: "D1 缓存写入", signal: "green", weight: 2, message: "cache_creation 字段可见。", raw_trace: { cache_creation_input_tokens: 1420 } },
      { name: "D2 缓存读取", signal: "red", weight: 3, message: "第二次请求未读到 cache_read。", raw_trace: { cache_read_input_tokens: 0, expected: "> 0" } },
      { name: "D3 成本估算", signal: "yellow", weight: 2, message: "因缓存不命中,实际费用接近 worst case。", raw_trace: { actual_usd: 0.012, worst_case_usd: 0.012 } },
    ],
  },
  {
    key: "source",
    title: "E. 渠道来源",
    summary: "URL 与 body 像原生 Anthropic,但轮询信号提示可能存在共享池。",
    score: 7,
    maxScore: 10,
    probes: [
      { name: "E1 URL 归因", signal: "yellow", weight: 2, message: "非官方 host,判为中转。", raw_trace: { host: "modelboxs.com", kind: "relay" } },
      { name: "E2 响应 headers", signal: "green", weight: 2, message: "存在 Anthropic 风格 headers。", raw_trace: { headers: ["anthropic-ratelimit-requests-limit"] } },
      { name: "E3 body id pattern", signal: "green", weight: 2, message: "id 格式符合原生 msg_*。", raw_trace: { id: "msg_01H..." } },
      { name: "E4 多账号轮询", signal: "yellow", weight: 4, message: "缓存模式提示可能轮询多个上游 key。", raw_trace: { cache_pattern: "unstable", confidence: 78 } },
    ],
  },
];

export default function ReportView({
  report,
  useV2Header = true,
}: {
  report: Report;
  useV2Header?: boolean;
}) {
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

  const handleAddCompare = () => {
    const ids = addCompareId(report.reportId);
    router.push(`/compare?ids=${ids.join(",")}`);
  };

  // 打印态: summary 模式下整卡折叠态(只出结论), 不强制展开
  const forceExpand = printing && detail === "full";

  return (
    <main className="mx-auto max-w-6xl overflow-x-hidden px-4 pt-10 pb-8 sm:px-6 print:max-w-none print:px-0 print:pt-0">
      {/* 打印专属页眉(仅打印可见) */}
      <PrintHeader checkedAt={report.meta.checkedAt} />

      {/* 屏幕态: lg+ 两栏(左 sticky 顶结论 + 右滚动各维度),lg- 单列堆叠
          打印态: 强制单列(print:block + print:gap-0) */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-6 print:!block">
        {/* 左栏: 顶结论(桌面端 sticky;打印态正常流) */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 print:max-h-none print:overflow-visible print:pr-0">
          {useV2Header ? (
            <ReportHeaderV2
              report={report}
              onAction={(action) => {
                if (action === "打印") setShowSelector(true);
                if (action === "分享") handleShare();
                if (action === "加入对比") handleAddCompare();
                if (action === "重测") router.push("/#check");
              }}
            />
          ) : (
            <ReportHeader
              overall={report.overall}
              verdictTitle={report.verdictTitle}
              verdictDetail={report.verdictDetail}
              meta={report.meta}
              dimensions={report.dimensions}
              onPrint={() => setShowSelector(true)}
              onShare={handleShare}
              onAddCompare={handleAddCompare}
              onRecheck={() => router.push("/#check")}
              shareToast={shareToast}
            />
          )}
        </div>

        {/* 右栏: 各维度明细 */}
        <div className="min-w-0 flex flex-col gap-4 print:mt-4">
          <p className="px-1 text-xs text-lo print:hidden">
            下面是各维度的结论,点任意一张卡片可展开「这对你意味着什么」+ 专业判据与图表。
          </p>

          {useV2Header ? (
            <DimensionGroupV2 groups={v2ProbeGroups} />
          ) : (
            dimOrder.map((k) => (
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
            ))
          )}

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
