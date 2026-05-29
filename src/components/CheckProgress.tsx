"use client";

import {
  AlertTriangle,
  Check,
  Circle,
  Loader2,
  Octagon,
  ShieldCheck,
} from "lucide-react";

type ProbeStatus = "done" | "running" | "pending" | "warn" | "fail";

type Probe = {
  name: string;
  status: ProbeStatus;
  weight: number;
  message: string;
};

type ProbeGroup = {
  title: string;
  phase: string;
  probes: Probe[];
};

const probeGroups: ProbeGroup[] = [
  {
    title: "协议根基",
    phase: "schema / headers",
    probes: [
      { name: "response schema 严格校验", status: "done", weight: 15, message: "结构字段完整" },
      { name: "不存在模型探针", status: "done", weight: 10, message: "错误码符合预期" },
      { name: "stop_reason / max_tokens", status: "done", weight: 8, message: "截断语义正常" },
      { name: "错误响应格式", status: "done", weight: 6, message: "返回 JSON 错误体" },
    ],
  },
  {
    title: "模型身份",
    phase: "identity / purity",
    probes: [
      { name: "响应 model 字段一致性", status: "done", weight: 12, message: "字段与请求匹配" },
      { name: "自报身份指纹", status: "warn", weight: 8, message: "版本描述偏模糊" },
      { name: "token 落点指纹", status: "running", weight: 10, message: "正在比对基线" },
      { name: "来源置信度合成", status: "pending", weight: 10, message: "等待 headers/body 信号" },
    ],
  },
  {
    title: "流式表现",
    phase: "stream / ttft",
    probes: [
      { name: "TTFT 首字延迟", status: "running", weight: 8, message: "采样第 12/20 次" },
      { name: "chunk count 稳定性", status: "pending", weight: 6, message: "排队中" },
      { name: "median gap 抖动", status: "pending", weight: 6, message: "排队中" },
      { name: "thinking/signature_delta", status: "pending", weight: 12, message: "Anthropic 专项" },
    ],
  },
  {
    title: "缓存与成本",
    phase: "cache / cost",
    probes: [
      { name: "缓存写入信号", status: "done", weight: 8, message: "已记录 cache_creation" },
      { name: "缓存读取命中", status: "warn", weight: 12, message: "命中率偏低" },
      { name: "实际成本估算", status: "pending", weight: 8, message: "等待 usage 汇总" },
    ],
  },
  {
    title: "稳定性",
    phase: "load / safety",
    probes: [
      { name: "并发成功率", status: "running", weight: 10, message: "16/20 成功" },
      { name: "限流头解析", status: "pending", weight: 6, message: "等待最终响应" },
      { name: "动态 PDF 探针", status: "pending", weight: 8, message: "后续接入真实探针" },
    ],
  },
];

const statusCopy: Record<ProbeStatus, string> = {
  done: "完成",
  running: "检测中",
  pending: "等待",
  warn: "注意",
  fail: "失败",
};

const statusTone: Record<ProbeStatus, string> = {
  done: "border-ok/30 bg-ok/[0.08] text-ok",
  running: "border-brand/40 bg-brand/[0.08] text-brand-bright",
  pending: "border-white/10 bg-white/[0.03] text-lo",
  warn: "border-warn/40 bg-warn/[0.08] text-warn",
  fail: "border-err/40 bg-err/[0.08] text-err",
};

function StatusIcon({ status }: { status: ProbeStatus }) {
  if (status === "done") return <Check className="h-3.5 w-3.5" />;
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  if (status === "warn") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (status === "fail") return <Octagon className="h-3.5 w-3.5" />;
  return <Circle className="h-3.5 w-3.5" />;
}

export default function CheckProgress({
  progress = 62,
  currentStage = "模型身份与流式表现检测中",
  onAbort,
}: {
  progress?: number;
  currentStage?: string;
  onAbort?: () => void;
}) {
  const doneCount = probeGroups
    .flatMap((group) => group.probes)
    .filter((probe) => probe.status === "done" || probe.status === "warn").length;
  const totalCount = probeGroups.reduce((sum, group) => sum + group.probes.length, 0);
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/[0.08] px-2.5 py-1 text-xs font-medium text-brand-bright">
            <ShieldCheck className="h-3.5 w-3.5" />
            探针进度预览
          </div>
          <h2 className="mt-3 text-xl font-semibold text-hi">{currentStage}</h2>
          <p className="mt-1 text-sm text-mid">
            已完成 {doneCount}/{totalCount} 项，展示真实检测时的探针分组与状态样式。
          </p>
        </div>

        <button
          type="button"
          onClick={onAbort}
          className="btn-ghost h-10 !rounded-lg !px-3 !py-2 text-sm"
        >
          <Octagon className="mr-1.5 h-4 w-4" />
          中止
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-lo">
          <span>总进度</span>
          <span className="font-mono text-mid">{clampedProgress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-brand-bright transition-all duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {probeGroups.map((group) => (
          <div key={group.title} className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="min-h-12">
              <h3 className="text-sm font-semibold text-hi">{group.title}</h3>
              <p className="mt-0.5 font-mono text-[11px] text-lo">{group.phase}</p>
            </div>
            <div className="mt-3 space-y-2">
              {group.probes.map((probe) => (
                <div
                  key={probe.name}
                  className={`rounded-lg border px-2.5 py-2 ${statusTone[probe.status]}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      <StatusIcon status={probe.status} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-hi">{probe.name}</span>
                        <span className="shrink-0 font-mono text-[10px] opacity-80">
                          {probe.weight}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] opacity-85">
                        <span>{probe.message}</span>
                        <span className="shrink-0">{statusCopy[probe.status]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
