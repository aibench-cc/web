"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, ChevronDown, Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const protocols = [
  { id: "openai", label: "OpenAI 兼容", placeholder: "https://api.openai.com/v1" },
  { id: "anthropic", label: "Anthropic 原生", placeholder: "https://api.anthropic.com" },
  { id: "gemini", label: "Gemini 原生", placeholder: "https://generativelanguage.googleapis.com" },
] as const;

type ProtocolId = (typeof protocols)[number]["id"];
type FetchState = "idle" | "loading" | "loaded" | "error";

type RunState = "queued" | "running" | "done" | "error";
type Progress = {
  state: RunState;
  done: number;
  total: number;
  phase: string;
  message?: string | null;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-mono text-hi placeholder:text-lo transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20";

type Mode = "latency" | "concurrency" | "rpm" | "tpm";

const modeMeta: Record<Mode, { label: string; desc: string }> = {
  latency: {
    label: "延迟 + 缓存",
    desc: "固定总请求数 + 并发,测端到端延迟与缓存命中(快检默认)。",
  },
  concurrency: {
    label: "并发压测",
    desc: "N 个 worker 持续压满设定秒数,测真实在飞并发上限。",
  },
  rpm: {
    label: "RPM 限流",
    desc: "按目标 RPM 节拍持续发包,探测限流策略与实际可达 RPM。",
  },
  tpm: {
    label: "TPM 吞吐",
    desc: "按目标 input TPM 持续发包(由 warmup 反推节拍),测 token 吞吐上限。",
  },
};

export default function QuickCheckForm() {
  const [protocol, setProtocol] = useState<ProtocolId>("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [hint, setHint] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("latency");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [total, setTotal] = useState(20);
  const [concurrency, setConcurrency] = useState(5);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [targetRpm, setTargetRpm] = useState(60);
  const [targetTpm, setTargetTpm] = useState(20000);

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const isQuick = mode === "latency";
  const estSeconds = isQuick ? 30 : durationSeconds;

  const activePlaceholder =
    protocols.find((p) => p.id === protocol)?.placeholder ?? "";

  async function fetchModels() {
    if (!apiKey.trim()) {
      setState("error");
      setHint("请先填写 api_key,再拉取该渠道下可用的模型。");
      return;
    }
    setState("loading");
    setHint(null);
    try {
      const res = await fetch(`${API_BASE}/api/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol,
          base_url: baseUrl.trim() || null,
          api_key: apiKey,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { models?: string[]; note?: string | null } = await res.json();
      const list = data.models ?? [];
      setModels(list);
      setState("loaded");
      if (list.length > 0 && !model) setModel(list[0]);
      setHint(
        data.note ??
          (list.length === 0
            ? "该渠道未返回任何模型,可手动输入 model id。"
            : null),
      );
    } catch {
      setState("error");
      setHint(
        "暂未连接到检测后端,可先手动输入 model id。后端接通后,这里会自动拉取该渠道的真实模型列表。",
      );
    }
  }

  async function startRun() {
    if (!apiKey.trim()) {
      setRunError("请先填写 api_key。");
      return;
    }
    if (!model.trim()) {
      setRunError("请先选择或手动输入 model id。");
      return;
    }
    setRunError(null);
    setSubmitting(true);
    setProgress({ state: "queued", done: 0, total, phase: "初始化", message: null });
    try {
      const res = await fetch(`${API_BASE}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol,
          base_url: baseUrl.trim() || null,
          api_key: apiKey,
          model: model.trim(),
          mode: "latency",
          opts: { total, concurrency },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { job_id: jobId } = (await res.json()) as { job_id: string };
      const final = await pollUntilSettled(jobId);
      if (final.state === "done") {
        // 报告已落库,reportId == jobId;保持 submitting 直到页面跳转完成
        router.push(`/r/${jobId}`);
        return;
      }
      setSubmitting(false);
      setRunError(final.message || "检测未通过,请检查渠道信息后重试。");
    } catch {
      setSubmitting(false);
      setRunError("无法连接检测后端,请确认后端已启动后重试。");
    }
  }

  async function pollUntilSettled(jobId: string): Promise<Progress> {
    const deadline = Date.now() + 4 * 60 * 1000; // 最长等 4 分钟
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 900));
      try {
        const r = await fetch(`${API_BASE}/api/run/${jobId}/progress`, {
          cache: "no-store",
        });
        if (!r.ok) continue;
        const p = (await r.json()) as Progress;
        setProgress(p);
        if (p.state === "done" || p.state === "error") return p;
      } catch {
        // 网络抖动,继续轮询
      }
    }
    return { state: "error", done: 0, total, phase: "", message: "检测超时,请稍后重试。" };
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isQuick && !submitting) startRun();
      }}
      className="glass-card relative p-6 lg:p-8 flex flex-col gap-5"
    >
      <div
        className="pointer-events-none absolute -top-px left-10 right-10 h-px hairline"
        aria-hidden
      />
      <div>
        <h2 className="text-lg font-semibold text-hi">快检</h2>
        <p className="text-sm text-mid mt-1">
          填入渠道信息,30 秒内得到一份可分享的健康报告。
        </p>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="text-sm font-medium text-hi mb-1">协议</legend>
        <div className="grid grid-cols-3 gap-2">
          {protocols.map((p) => (
            <label
              key={p.id}
              className="relative flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-xs font-medium text-mid transition-all has-[:checked]:border-brand/60 has-[:checked]:bg-brand/[0.1] has-[:checked]:text-brand-bright hover:border-white/20"
            >
              <input
                type="radio"
                name="protocol"
                value={p.id}
                checked={protocol === p.id}
                onChange={() => setProtocol(p.id)}
                className="sr-only"
              />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="base_url" className="text-sm font-medium text-hi">
          base_url <span className="text-lo font-normal">(留空走官方)</span>
        </label>
        <input
          id="base_url"
          name="base_url"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={activePlaceholder}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="api_key" className="text-sm font-medium text-hi">
          api_key
        </label>
        <input
          id="api_key"
          name="api_key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
          className={inputClass}
        />
        <p className="flex items-center gap-1.5 text-xs text-lo">
          <ShieldCheck className="h-3.5 w-3.5 text-ok" />
          仅本次转发，不落库、不记录日志。
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="model" className="text-sm font-medium text-hi">
            model
          </label>
          <button
            type="button"
            onClick={fetchModels}
            disabled={state === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/[0.08] px-2.5 py-1 text-xs font-medium text-brand-bright transition-all hover:border-brand/60 hover:bg-brand/[0.14] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`}
            />
            {state === "loading" ? "拉取中…" : "拉取模型"}
          </button>
        </div>

        {models.length > 0 && (
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-9 text-sm font-mono text-hi transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lo" />
          </div>
        )}

        <input
          id="model"
          name="model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="拉取后从上方选择,或手动输入 model id"
          className={inputClass}
        />

        {hint && (
          <p
            className={`text-xs leading-relaxed ${state === "error" ? "text-warn" : "text-lo"}`}
          >
            {hint}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-mid transition-colors hover:text-hi"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
          高级模式
          {!isQuick && (
            <span className="text-brand-bright">· {modeMeta[mode].label}</span>
          )}
        </button>

        {advancedOpen && (
          <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(modeMeta) as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
                    mode === m
                      ? "border-brand/60 bg-brand/[0.1] text-brand-bright"
                      : "border-white/10 bg-white/[0.03] text-mid hover:border-white/20"
                  }`}
                >
                  {modeMeta[m].label}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-lo">
              {modeMeta[mode].desc}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {mode === "latency" && (
                <>
                  <NumField label="总请求数" value={total} onChange={setTotal} min={1} />
                  <NumField label="并发数" value={concurrency} onChange={setConcurrency} min={1} />
                </>
              )}
              {mode === "concurrency" && (
                <>
                  <NumField label="并发数" value={concurrency} onChange={setConcurrency} min={1} />
                  <NumField label="持续秒数" value={durationSeconds} onChange={setDurationSeconds} min={5} />
                </>
              )}
              {mode === "rpm" && (
                <>
                  <NumField label="目标 RPM" value={targetRpm} onChange={setTargetRpm} min={1} />
                  <NumField label="持续秒数" value={durationSeconds} onChange={setDurationSeconds} min={5} />
                </>
              )}
              {mode === "tpm" && (
                <>
                  <NumField label="目标 TPM" value={targetTpm} onChange={setTargetTpm} min={100} step={1000} />
                  <NumField label="持续秒数" value={durationSeconds} onChange={setDurationSeconds} min={5} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || !isQuick}
        className="btn-glow w-full !py-3.5 !text-base disabled:opacity-60 disabled:pointer-events-none"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress?.phase || "检测中"}
            {progress?.state === "running" &&
            progress.total > 0 &&
            progress.done > 0
              ? ` · ${progress.done}/${progress.total}`
              : "…"}
          </span>
        ) : isQuick ? (
          "开始快检"
        ) : (
          `${modeMeta[mode].label} · 即将上线`
        )}
      </button>

      {submitting && progress && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{
              width: `${
                progress.total > 0
                  ? Math.max(6, Math.round((progress.done / progress.total) * 100))
                  : 6
              }%`,
            }}
          />
        </div>
      )}

      {runError && (
        <p className="rounded-lg border border-warn/30 bg-warn/[0.08] px-3 py-2 text-xs leading-relaxed text-warn">
          {runError}
        </p>
      )}

      {!isQuick && !submitting && (
        <p className="text-center text-xs text-lo">
          并发 / RPM / TPM 压测即将上线,当前可先运行快检(延迟 + 缓存)。
        </p>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-lo">
        <ShieldCheck className="h-3.5 w-3.5 text-ok" />
        预计 ~{estSeconds}s · key 仅本次转发不留存 · 算法核心开源
      </p>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-mid">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-mono text-hi focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
