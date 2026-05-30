"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Code2, Copy } from "lucide-react";

export default function RawTraceViewer({
  title = "raw_trace",
  trace,
  defaultOpen = false,
}: {
  title?: string;
  trace: unknown;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const source = useMemo(() => formatTrace(trace), [trace]);
  const tokens = useMemo(() => tokenizeJson(source), [source]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-white/10"
      >
        <Code2 className="h-3.5 w-3.5 text-blue-300" />
        <span className="min-w-0 flex-1 truncate font-mono">{title}</span>
        <span className="text-slate-400">{open ? "收起" : "展开技术证据"}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-white/10">
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-slate-400">
            <span>JSON 证据快照</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(source).catch(() => {})}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-slate-300 transition-colors hover:text-white"
            >
              <Copy className="h-3 w-3" />
              复制
            </button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words px-3 pb-3 font-mono text-[11px] leading-relaxed sm:whitespace-pre sm:text-xs">
            {tokens.map((token, index) => (
              <span key={`${token.text}-${index}`} className={token.className}>
                {token.text}
              </span>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

function formatTrace(trace: unknown) {
  if (typeof trace === "string") return trace;
  return JSON.stringify(trace, null, 2);
}

function tokenizeJson(source: string) {
  const matcher = /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|true|false|null)/g;
  const tokens: Array<{ text: string; className: string }> = [];
  let cursor = 0;
  for (const match of source.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push({ text: source.slice(cursor, index), className: "text-slate-400" });
    const text = match[0];
    tokens.push({ text, className: tokenClass(text) });
    cursor = index + text.length;
  }
  if (cursor < source.length) tokens.push({ text: source.slice(cursor), className: "text-slate-400" });
  return tokens;
}

function tokenClass(token: string) {
  if (token.startsWith('"') && token.endsWith('"') && token.match(/"(?=\s*:)/)) {
    return "text-blue-300";
  }
  if (token.startsWith('"')) return "text-emerald-300";
  if (token === "true" || token === "false") return "text-amber-300";
  if (token === "null") return "text-slate-500";
  return "text-slate-100";
}
