"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2, ExternalLink } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";
import { loadHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/history";

const PROTOCOL_LABEL: Record<string, string> = {
  openai: "OpenAI 兼容",
  anthropic: "Anthropic 原生",
  gemini: "Gemini 原生",
};

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  function handleRemove(reportId: string) {
    removeHistory(reportId);
    setEntries((prev) => (prev ?? []).filter((e) => e.reportId !== reportId));
  }

  function handleClear() {
    if (!confirm("确定清空全部本机记录?报告本身在服务器仍可通过链接访问。")) return;
    clearHistory();
    setEntries([]);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pt-14 pb-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/[0.08] px-3 py-1 text-xs font-medium text-brand-bright">
              <History className="h-3.5 w-3.5" />
              本机记录
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-hi lg:text-4xl">
              我的检测历史
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-mid">
              本页只保存在你这台浏览器的 localStorage 里,不上传服务器。
              换设备或清空浏览数据会消失,但报告本身只要 reportId 还在就能继续访问。
            </p>
          </div>
          {entries && entries.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-mid transition-colors hover:border-err/40 hover:text-err"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空
            </button>
          )}
        </div>

        {entries === null ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center text-sm text-lo">
            正在读取本机记录...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-mid">还没有检测记录。</p>
            <Link href="/#check" className="btn-glow mt-5 inline-flex">
              去发起第一次检测
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.reportId}
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <Link
                  href={`/r/${e.reportId}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate font-mono text-sm text-hi">
                      <span className="truncate">{e.model || "—"}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-lo">
                      <span>{PROTOCOL_LABEL[e.protocol] || e.protocol}</span>
                      <span>·</span>
                      <span>{formatTime(e.ts)}</span>
                      <span>·</span>
                      <span className="truncate font-mono">{e.reportId.slice(0, 8)}…</span>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(e.reportId)}
                  aria-label="从本机记录中移除"
                  className="shrink-0 rounded-lg p-2 text-lo opacity-0 transition-all hover:bg-err/10 hover:text-err group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SponsorFooter />
    </>
  );
}
