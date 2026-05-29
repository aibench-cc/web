"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { saveHistory } from "@/lib/history";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const protocols = [
  { id: "openai", label: "OpenAI 兼容", placeholder: "https://api.openai.com/v1" },
  { id: "anthropic", label: "Anthropic 原生", placeholder: "https://api.anthropic.com" },
  { id: "gemini", label: "Gemini 原生", placeholder: "https://generativelanguage.googleapis.com" },
] as const;

type ProtocolId = (typeof protocols)[number]["id"];

const DOMESTIC_PRESETS: { label: string; protocol: ProtocolId; baseUrl: string }[] = [
  { label: "DeepSeek", protocol: "openai", baseUrl: "https://api.deepseek.com" },
  { label: "Kimi", protocol: "openai", baseUrl: "https://api.moonshot.cn/v1" },
  { label: "智谱 GLM", protocol: "openai", baseUrl: "https://open.bigmodel.cn/api/paas/v4" },
  { label: "通义 Qwen", protocol: "openai", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { label: "豆包", protocol: "openai", baseUrl: "https://ark.cn-beijing.volces.com/api/v3" },
  { label: "混元", protocol: "openai", baseUrl: "https://api.hunyuan.cloud.tencent.com/v1" },
];

type ModelChip = { label: string; protocol: ProtocolId; modelId: string; isNew?: boolean };

const MODEL_CHIPS: ModelChip[] = [
  // OpenAI 兼容
  { label: "GPT 5.5", protocol: "openai", modelId: "gpt-5.5", isNew: true },
  { label: "GPT 5.4", protocol: "openai", modelId: "gpt-5.4" },
  { label: "GPT 4o", protocol: "openai", modelId: "gpt-4o" },
  { label: "o3-mini", protocol: "openai", modelId: "o3-mini" },
  // Anthropic
  { label: "Opus 4.7", protocol: "anthropic", modelId: "claude-opus-4-7", isNew: true },
  { label: "Sonnet 4.6", protocol: "anthropic", modelId: "claude-sonnet-4-6" },
  { label: "Haiku 4.5", protocol: "anthropic", modelId: "claude-haiku-4-5" },
  { label: "Opus 4.5", protocol: "anthropic", modelId: "claude-opus-4-5" },
  // Gemini
  { label: "Gemini 3.1 Pro", protocol: "gemini", modelId: "gemini-3.1-pro", isNew: true },
  { label: "Gemini 2.5 Pro", protocol: "gemini", modelId: "gemini-2.5-pro" },
  { label: "Gemini 2.5 Flash", protocol: "gemini", modelId: "gemini-2.5-flash" },
];

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

type FriendlyError = { title: string; hint?: string; action?: string; raw?: string };

function friendlyRunError(raw: string | null | undefined): FriendlyError {
  if (!raw) return { title: "检测未通过", action: "请检查渠道信息后重试。" };
  const m = raw;
  if (/HTTP 40[13]\b|invalid[_ ]api[_ ]key|unauthorized|authentication/i.test(m)) {
    return {
      title: "API key 无效或无权限",
      hint: "上游拒绝了这把 key。",
      action: "确认 key 拼写,或在原厂控制台检查 key 是否仍有效、是否对所选模型开放。",
      raw,
    };
  }
  if (/HTTP 429\b|rate.?limit|too.?many.?requests|quota/i.test(m)) {
    return {
      title: "触发上游限流或配额不足",
      hint: "测试触发了厂商的 RPM/TPM 限制,或账户额度耗尽。",
      action: "等 1–5 分钟再试,或在 Advanced 里把 concurrency 调小;额度不足请在原厂续费。",
      raw,
    };
  }
  if (/HTTP 50[234]\b|service.?unavailable|bad.?gateway|gateway.?timeout/i.test(m)) {
    return {
      title: "上游服务暂时不可用",
      hint: "不是你 key 的问题,上游(或中转网关)正在返回 5xx。",
      action: "过几分钟重试;若持续不可用,可能要换一个中转渠道。",
      raw,
    };
  }
  if (/HTTP 500\b|internal.?server.?error/i.test(m)) {
    return {
      title: "上游内部错误",
      hint: "上游返回了 500,通常是上游服务自己的 bug。",
      action: "稍后重试;若反复出现,反馈给上游/中转方。",
      raw,
    };
  }
  if (/HTTP 404\b|model.?not.?found|does.?not.?exist|no.?such.?model/i.test(m)) {
    return {
      title: "模型名不正确",
      hint: "上游没有这个模型 id。",
      action: "重新点 “拉取模型” 按钮从列表里选一个,或确认拼写。",
      raw,
    };
  }
  if (/timeout|timed.?out|connection.?(refused|reset|aborted)|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(m)) {
    return {
      title: "无法连接上游",
      hint: "base_url 可能写错,或网络/VPN 不通。",
      action: "确认 base_url(如 https://api.openai.com/v1),海外服务可能需要走代理。",
      raw,
    };
  }
  return {
    title: "检测未通过",
    hint: m.length > 160 ? m.slice(0, 160) + "…" : m,
    action: "请检查渠道信息后重试。",
    raw,
  };
}

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
  const [claudeCode, setClaudeCode] = useState(false);
  const [total, setTotal] = useState(20);
  const [concurrency, setConcurrency] = useState(8);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [targetRpm, setTargetRpm] = useState(60);
  const [targetTpm, setTargetTpm] = useState(20000);

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

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
          claude_code: claudeCode,
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
    if (turnstileRequired && !turnstileToken) {
      setRunError("请先完成人机验证。");
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
          claude_code: claudeCode,
          opts: { total, concurrency },
          turnstile_token: turnstileToken || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { job_id: jobId } = (await res.json()) as { job_id: string };
      const final = await pollUntilSettled(jobId);
      if (final.state === "done") {
        // 报告已落库,reportId == jobId;保持 submitting 直到页面跳转完成
        saveHistory({
          reportId: jobId,
          ts: Math.floor(Date.now() / 1000),
          protocol,
          model: model.trim(),
        });
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
        <span className="text-xs text-lo">国产厂商预设(一键填 base_url)</span>
        <div className="flex flex-wrap gap-1.5">
          {DOMESTIC_PRESETS.map((p) => {
            const active = baseUrl === p.baseUrl && protocol === p.protocol;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setProtocol(p.protocol);
                  setBaseUrl(p.baseUrl);
                  setModel("");
                  setModels([]);
                  setState("idle");
                  setHint(null);
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-brand/60 bg-brand/[0.12] text-brand-bright"
                    : "border-white/10 bg-white/[0.04] text-mid hover:border-brand/40 hover:bg-brand/[0.08] hover:text-brand-bright"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

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
          onChange={(e) => {
            const v = e.target.value;
            setApiKey(v);
            if (/^sk-ant-oat-/.test(v.trim())) {
              setProtocol("anthropic");
              setClaudeCode(true);
            }
          }}
          placeholder="sk-..."
          autoComplete="off"
          className={inputClass}
        />
        <p className="flex items-center gap-1.5 text-xs text-lo">
          <ShieldCheck className="h-3.5 w-3.5 text-ok" />
          仅本次转发，不落库、不记录日志。
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${
            claudeCode
              ? "border-brand/60 bg-brand/[0.08]"
              : "border-white/10 bg-white/[0.03] hover:border-white/20"
          } ${protocol !== "anthropic" ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex flex-col gap-0.5">
            <span className={`text-sm font-medium ${claudeCode ? "text-brand-bright" : "text-hi"}`}>
              Claude Code 限制专属
            </span>
            <span className="text-xs text-lo">
              key 只接受 Claude Code 客户端时打开;以 CLI 身份发起请求。
            </span>
          </div>
          <input
            type="checkbox"
            checked={claudeCode && protocol === "anthropic"}
            disabled={protocol !== "anthropic"}
            onChange={(e) => setClaudeCode(e.target.checked)}
            className="sr-only"
            aria-label="Claude Code 限制专属"
          />
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
              claudeCode && protocol === "anthropic" ? "bg-brand" : "bg-white/15"
            }`}
            aria-hidden
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                claudeCode && protocol === "anthropic" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </label>
        {protocol !== "anthropic" && (
          <p className="text-xs text-lo">仅 Anthropic 协议生效。切换协议后此项自动忽略。</p>
        )}
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

        {(() => {
          const chips = MODEL_CHIPS.filter((c) => c.protocol === protocol);
          if (chips.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => {
                const active = model === c.modelId;
                return (
                  <button
                    key={c.modelId}
                    type="button"
                    onClick={() => setModel(c.modelId)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-brand/60 bg-brand/[0.12] text-brand-bright"
                        : "border-white/10 bg-white/[0.04] text-mid hover:border-brand/40 hover:bg-brand/[0.08] hover:text-brand-bright"
                    }`}
                  >
                    {c.label}
                    {c.isNew && (
                      <span className="rounded bg-brand/30 px-1 text-[9px] font-semibold leading-tight text-brand-bright">
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {models.length > 0 && (
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-9 text-sm font-mono text-hi transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {models.map((m) => (
                <option key={m} value={m} className="bg-base text-hi">
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

      <TurnstileWidget onToken={setTurnstileToken} />

      <button
        type="submit"
        disabled={submitting || !isQuick || (turnstileRequired && !turnstileToken)}
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

      {runError && (() => {
        const e = friendlyRunError(runError);
        return (
          <div className="rounded-lg border border-warn/30 bg-warn/[0.08] px-3.5 py-3 text-xs leading-relaxed text-warn">
            <div className="text-sm font-semibold">{e.title}</div>
            {e.hint && <div className="mt-1.5 text-warn/90">{e.hint}</div>}
            {e.action && <div className="mt-1 text-warn/80">建议:{e.action}</div>}
            {e.raw && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] text-warn/60 hover:text-warn/80 select-none">
                  显示原始报错
                </summary>
                <pre className="mt-1.5 whitespace-pre-wrap break-all rounded bg-black/20 px-2 py-1.5 text-[11px] text-warn/70">
                  {e.raw}
                </pre>
              </details>
            )}
          </div>
        );
      })()}

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
