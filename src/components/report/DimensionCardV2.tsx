"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, Circle, X } from "lucide-react";
import type { Signal } from "@/lib/report";
import RawTraceViewer from "./RawTraceViewer";

export type ProbeSignal = Exclude<Signal, "skipped"> | "na";

export type ProbeItem = {
  name: string;
  signal: ProbeSignal;
  weight: number;
  message: string;
  raw_trace?: unknown;
  rawTrace?: unknown;
};

export type ProbeGroup = {
  key: string;
  title: string;
  summary: string;
  score: number;
  maxScore: number;
  probes: ProbeItem[];
};

const signalCopy: Record<ProbeSignal, string> = {
  green: "通过",
  yellow: "注意",
  red: "异常",
  na: "不适用",
};

const signalTone: Record<ProbeSignal, string> = {
  green: "border-ok/35 bg-ok/[0.08] text-ok",
  yellow: "border-warn/40 bg-warn/[0.08] text-warn",
  red: "border-err/40 bg-err/[0.08] text-err",
  na: "border-white/10 bg-white/[0.03] text-lo",
};

function SignalIcon({ signal }: { signal: ProbeSignal }) {
  if (signal === "green") return <Check className="h-3.5 w-3.5" />;
  if (signal === "yellow") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (signal === "red") return <X className="h-3.5 w-3.5" />;
  return <Circle className="h-3.5 w-3.5" />;
}

export default function DimensionCardV2({ group }: { group: ProbeGroup }) {
  const [openProbe, setOpenProbe] = useState<string | null>(group.probes[0]?.name ?? null);
  const percent = group.maxScore > 0 ? Math.round((group.score / group.maxScore) * 100) : 0;

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-4 py-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-hi">{group.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-mid">{group.summary}</p>
          </div>
          <div className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right">
            <div className="font-mono text-lg font-semibold text-hi">
              {group.score}/{group.maxScore}
            </div>
            <div className="text-[11px] text-lo">{percent}%</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-brand-bright" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {group.probes.map((probe) => {
          const expanded = openProbe === probe.name;
          const rawTrace = probe.raw_trace ?? probe.rawTrace;
          return (
            <div key={probe.name} className="px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenProbe((current) => (current === probe.name ? null : probe.name))}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${signalTone[probe.signal]}`}>
                  <SignalIcon signal={probe.signal} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-hi">{probe.name}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-mid">{probe.message}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] ${signalTone[probe.signal]}`}>
                    {signalCopy[probe.signal]}
                  </span>
                  <span className="font-mono text-[11px] text-lo">w {probe.weight}</span>
                </span>
                <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-lo transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>

              {expanded && rawTrace !== undefined && (
                <div className="mt-3 pl-10">
                  <RawTraceViewer title={`${probe.name} raw_trace`} trace={rawTrace} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
