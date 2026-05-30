"use client";

import { useState } from "react";
import { ChevronDown, RadioTower, Route, ShieldCheck } from "lucide-react";

export type SourceKind = "official" | "relay" | "unknown";

export type SourceSignal = {
  label: string;
  value: string;
  signal: "green" | "yellow" | "red";
};

const sourceCopy: Record<SourceKind, { label: string; hint: string; icon: typeof ShieldCheck }> = {
  official: { label: "官方直连", hint: "origin verified", icon: ShieldCheck },
  relay: { label: "推断中转", hint: "relay inferred", icon: Route },
  unknown: { label: "来源未知", hint: "needs review", icon: RadioTower },
};

const tone: Record<SourceKind, string> = {
  official: "border-ok/40 bg-ok/[0.08] text-ok",
  relay: "border-warn/40 bg-warn/[0.08] text-warn",
  unknown: "border-slate-200 bg-slate-50 text-lo",
};

const dotTone: Record<SourceSignal["signal"], string> = {
  green: "bg-ok",
  yellow: "bg-warn",
  red: "bg-err",
};

export default function SourceBadge({
  kind,
  confidence,
  host,
  signals,
}: {
  kind: SourceKind;
  confidence: number;
  host: string;
  signals: SourceSignal[];
}) {
  const [open, setOpen] = useState(false);
  const source = sourceCopy[kind];
  const Icon = source.icon;

  return (
    <div className={`overflow-hidden rounded-lg border ${tone[kind]}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-left sm:gap-3"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">{source.label}</span>
            <span className="min-w-0 break-all font-mono text-[11px] opacity-75">{host}</span>
          </div>
          <div className="mt-0.5 text-[11px] opacity-75">{source.hint}</div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="font-mono text-xl font-semibold leading-none">{confidence}%</div>
          <div className="mt-0.5 text-[10px] opacity-75">confidence</div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid max-h-52 gap-2 overflow-y-auto border-t border-current/10 bg-white/55 px-3 py-3 sm:grid-cols-2">
          {signals.map((signal) => (
            <div key={signal.label} className="min-w-0 overflow-hidden rounded-md border border-current/10 bg-white px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotTone[signal.signal]}`} />
                <span className="truncate text-[11px] text-lo">{signal.label}</span>
              </div>
              <div className="mt-1 max-h-12 overflow-y-auto break-all font-mono text-xs text-hi">
                {signal.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
