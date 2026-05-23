"use client";

import { X, Check } from "lucide-react";
import { type DimKey, dimOrder, dimTitle } from "@/lib/report";

export type PrintDetail = "summary" | "full";

export default function PrintSelector({
  selection,
  detail,
  onChange,
  onDetailChange,
  onConfirm,
  onClose,
}: {
  selection: Record<DimKey, boolean>;
  detail: PrintDetail;
  onChange: (next: Record<DimKey, boolean>) => void;
  onDetailChange: (d: PrintDetail) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const toggle = (k: DimKey) => onChange({ ...selection, [k]: !selection[k] });
  const setAll = (v: boolean) =>
    onChange(
      dimOrder.reduce(
        (acc, k) => ({ ...acc, [k]: v }),
        {} as Record<DimKey, boolean>,
      ),
    );
  const selectedCount = dimOrder.filter((k) => selection[k]).length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-base/80 p-4 backdrop-blur print:hidden"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-hi">选择要打印的内容</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-lo transition-colors hover:bg-white/[0.06] hover:text-hi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {dimOrder.map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
            >
              <Checkbox checked={selection[k]} onChange={() => toggle(k)} />
              <span className="text-sm text-hi">{dimTitle[k]}</span>
            </label>
          ))}
        </div>

        {/* 详略开关 */}
        <div className="mt-4 flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(
            [
              { id: "full", label: "含原始数据" },
              { id: "summary", label: "仅打印结论" },
            ] as { id: PrintDetail; label: string }[]
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onDetailChange(o.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                detail === o.id
                  ? "bg-brand/[0.14] text-brand-bright"
                  : "text-mid hover:text-hi"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="text-mid transition-colors hover:text-hi"
            >
              全选
            </button>
            <span className="text-white/15">·</span>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="text-mid transition-colors hover:text-hi"
            >
              全不选
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost !px-4 !py-2 !text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={selectedCount === 0}
              className="btn-glow !px-4 !py-2 !text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              打印 ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
        checked ? "border-brand bg-brand text-white" : "border-white/20 bg-transparent"
      }`}
    >
      {checked && <Check className="h-3 w-3" />}
    </span>
  );
}
