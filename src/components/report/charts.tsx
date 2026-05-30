"use client";

import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { CacheBar, TtftMarker } from "@/lib/report";

// Recharts 需要真实色值,不能用 Tailwind class —— 直接引用设计 token 的 hex。
const C = {
  ok: "#079455",
  warn: "#DC8A00",
  err: "#D92D20",
  brand: "#1457D9",
  brandBright: "#2563EB",
  mid: "#475467",
  lo: "#667085",
  card: "#FFFFFF",
  grid: "rgba(16,24,40,0.08)",
};

const axisProps = {
  tick: { fill: C.lo, fontSize: 11 },
  stroke: "rgba(16,24,40,0.16)",
} as const;

const tooltipStyle = {
  contentStyle: {
    background: C.card,
    border: "1px solid rgba(16,24,40,0.12)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: C.mid },
  itemStyle: { color: "#101828" },
} as const;

// 图表容器:屏幕自适应宽度,打印固定宽度防止 ResponsiveContainer 塌成 0
function ChartBox({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-44 w-full print:w-[640px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// ① 延迟散点 + P95 参考线
export function LatencyScatter({
  data,
  p95Ms,
}: {
  data: { i: number; ms: number }[];
  p95Ms?: number;
}) {
  return (
    <ChartBox>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <XAxis
          type="number"
          dataKey="i"
          name="请求"
          {...axisProps}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="ms"
          name="耗时"
          unit="ms"
          {...axisProps}
          tickLine={false}
          width={48}
        />
        <Tooltip {...tooltipStyle} cursor={{ stroke: C.lo, strokeDasharray: "3 3" }} />
        {p95Ms ? (
          <ReferenceLine
            y={p95Ms}
            stroke={C.warn}
            strokeDasharray="4 4"
            label={{ value: `P95 ${(p95Ms / 1000).toFixed(2)}s`, fill: C.warn, fontSize: 11, position: "insideTopRight" }}
          />
        ) : null}
        <Scatter data={data} fill={C.brandBright} fillOpacity={0.85} />
      </ScatterChart>
    </ChartBox>
  );
}

// ② 缓存:两次预热请求的 token 构成堆叠条
export function CacheTokenBars({ data }: { data: CacheBar[] }) {
  return (
    <ChartBox>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barCategoryGap={18}
      >
        <XAxis type="number" {...axisProps} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          {...axisProps}
          tickLine={false}
          width={84}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(16,24,40,0.04)" }} />
        <Bar dataKey="uncachedInput" name="未命中输入" stackId="a" fill={C.lo} radius={[0, 0, 0, 0]} />
        <Bar dataKey="cacheRead" name="命中缓存" stackId="a" fill={C.ok} />
        <Bar dataKey="cacheCreation" name="写入缓存" stackId="a" fill={C.brand} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ChartBox>
  );
}

// ⑤ 成本:本次实测 vs 全程不命中最坏情况
export function CostCompareBars({
  actualUsd,
  worstCaseUsd,
}: {
  actualUsd: number;
  worstCaseUsd: number;
}) {
  const data = [
    { label: "本次实测", usd: actualUsd, fill: C.ok },
    { label: "最坏情况", usd: worstCaseUsd, fill: C.err },
  ];
  return (
    <ChartBox>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
        barCategoryGap={18}
      >
        <XAxis type="number" {...axisProps} tickLine={false} unit="$" hide />
        <YAxis
          type="category"
          dataKey="label"
          {...axisProps}
          tickLine={false}
          width={72}
        />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toFixed(4)}`, "成本"]} cursor={{ fill: "rgba(16,24,40,0.04)" }} />
        <Bar dataKey="usd" radius={[0, 4, 4, 0]} label={{ position: "right", fill: C.mid, fontSize: 11, formatter: (v: number) => `$${v.toFixed(3)}` }}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ChartBox>
  );
}

// ⑥ TTFT 时间轴泳道(div 实现,比 Recharts 更直观;推理模型把思考段标异色)
export function TtftTimeline({ markers }: { markers: TtftMarker[] }) {
  if (markers.length < 2) return null;
  const total = markers[markers.length - 1].atMs || 1;
  return (
    <div className="w-full pt-2 pb-6">
      <div className="relative h-2 w-full rounded-full bg-slate-200 print:bg-black/10">
        {/* 已完成段 */}
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand/40 print:bg-[#1d4ed8]/35" style={{ width: "100%" }} />
        {markers.map((m, i) => {
          const pct = Math.min(100, (m.atMs / total) * 100);
          return (
            <div
              key={i}
              className="absolute -top-1 flex flex-col items-center"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              <span className="h-4 w-4 rounded-full border-2 border-base bg-brand-bright print:border-[#1d4ed8] print:bg-[#1d4ed8]" />
              <span className="mt-1.5 whitespace-nowrap text-[10px] text-lo">
                {m.label}
              </span>
              <span className="font-mono text-[10px] text-mid">
                {(m.atMs / 1000).toFixed(2)}s
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
