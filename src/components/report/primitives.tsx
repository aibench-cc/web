import {
  type Signal,
  signalDot,
  signalLabel,
} from "@/lib/report";

// 信号色点 + 无障碍/黑白打印兜底文字。pulse 仅红档开启,避免满屏闪。
export function SignalDot({
  signal,
  pulse = false,
  showLabel = false,
}: {
  signal: Signal;
  pulse?: boolean;
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${signalDot[signal]} ${
          pulse && signal === "red" ? "animate-pulse-dot" : ""
        }`}
      />
      {/* 打印恒显档位文字;屏幕按需显示 */}
      <span
        className={`text-[11px] font-medium text-lo ${
          showLabel ? "" : "hidden"
        } print:inline`}
      >
        {signalLabel[signal]}
      </span>
    </span>
  );
}

// 一格"专业判据":标签 + 等宽值。值为 — 时弱化为 lo 色。
export function Evidence({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const isEmpty = value === "—";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-lo">{label}</span>
      <span className={`font-mono text-sm ${isEmpty ? "text-lo" : "text-hi"}`}>
        {value}
      </span>
    </div>
  );
}
