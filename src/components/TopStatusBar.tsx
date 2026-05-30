"use client";

import { useEffect, useState } from "react";
import {
  fetchUpstreamStatus,
  seedStatus,
  type ProviderSignal,
  type UpstreamStatus,
} from "@/lib/api";

const REFRESH_MS = 60_000;

const dotClass: Record<ProviderSignal, string> = {
  operational: "bg-ok",
  degraded: "bg-warn",
  outage: "bg-err",
  unknown: "bg-lo",
};

const signalText: Record<ProviderSignal, string> = {
  operational: "正常",
  degraded: "波动",
  outage: "故障",
  unknown: "未知",
};

function fmtAgo(ts: number): string {
  if (!ts) return "—";
  const sec = Math.max(0, Math.round(Date.now() / 1000 - ts));
  if (sec < 60) return `${sec}s 前`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}min 前`;
  const hr = Math.round(min / 60);
  return `${hr}h 前`;
}

export default function TopStatusBar() {
  const [data, setData] = useState<UpstreamStatus>(seedStatus);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await fetchUpstreamStatus();
      if (!cancelled) setData(next);
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="sticky top-0 z-[60] border-b border-slate-200 bg-white/90 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 px-4 py-2 text-xs text-mid sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="hidden font-medium text-mid sm:inline">上游状态</span>
          {data.providers.map((p) => (
            <span
              key={p.key}
              className="inline-flex shrink-0 items-center gap-1.5"
              title={p.summary}
            >
              <span
                className={`h-2 w-2 rounded-full ${dotClass[p.signal]} ${
                  p.signal === "operational" ? "animate-pulse-dot" : ""
                }`}
              />
              <span className="font-medium text-hi">{p.label}</span>
              <span className="text-lo">·</span>
              <span className="text-mid">{signalText[p.signal]}</span>
            </span>
          ))}
        </div>
        <span className="hidden shrink-0 text-lo sm:inline">
          更新于 {fmtAgo(data.updatedAt)}
          {data.stale && " · 缓存"}
        </span>
      </div>
    </div>
  );
}
