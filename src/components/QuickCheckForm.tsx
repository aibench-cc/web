"use client";

export default function QuickCheckForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-2xl border border-ink-300/20 bg-white shadow-sm p-6 lg:p-8 flex flex-col gap-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-ink-900">快检</h2>
        <p className="text-sm text-ink-500 mt-1">
          填入渠道信息，30 秒内得到一份可分享的健康报告。
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink-900 mb-1">协议</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            { id: "openai", label: "OpenAI 兼容" },
            { id: "anthropic", label: "Anthropic 原生" },
            { id: "gemini", label: "Gemini 原生" },
          ].map((p, i) => (
            <label
              key={p.id}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="protocol"
                value={p.id}
                defaultChecked={i === 0}
                className="accent-brand"
              />
              <span className="text-ink-900">{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="base_url" className="text-sm font-medium text-ink-900">
          base_url
        </label>
        <input
          id="base_url"
          name="base_url"
          type="url"
          placeholder="https://api.openai.com/v1"
          className="rounded-lg border border-ink-300/40 bg-white px-3 py-2 text-sm font-mono placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="api_key" className="text-sm font-medium text-ink-900">
          api_key
        </label>
        <input
          id="api_key"
          name="api_key"
          type="password"
          placeholder="sk-..."
          autoComplete="off"
          className="rounded-lg border border-ink-300/40 bg-white px-3 py-2 text-sm font-mono placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="model" className="text-sm font-medium text-ink-900">
          model
        </label>
        <div className="flex gap-2">
          <select
            id="model_preset"
            name="model_preset"
            defaultValue=""
            className="rounded-lg border border-ink-300/40 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">常用模型…</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="claude-sonnet-4-5">claude-sonnet-4-5</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="deepseek-chat">deepseek-chat</option>
            <option value="moonshot-v1-32k">moonshot-v1-32k</option>
            <option value="glm-4.6">glm-4.6</option>
          </select>
          <input
            id="model"
            name="model"
            type="text"
            placeholder="或手动输入 model id"
            className="flex-1 rounded-lg border border-ink-300/40 bg-white px-3 py-2 text-sm font-mono placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-brand text-white font-semibold py-3 text-base hover:opacity-90 active:opacity-80 transition"
      >
        开始快检
      </button>
      <p className="text-xs text-ink-300 text-center">
        预计耗时 ~30s · API key 永不存储 · 算法核心开源在 GitHub
      </p>
    </form>
  );
}
