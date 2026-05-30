"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastTone = "success" | "info" | "warn" | "error";

export type ToastState = {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
};

const toneClass: Record<ToastTone, string> = {
  success: "border-ok/25 bg-ok/10 text-ok",
  info: "border-brand/25 bg-brand/10 text-brand",
  warn: "border-warn/30 bg-warn/10 text-warn",
  error: "border-err/30 bg-err/10 text-err",
};

const icons = {
  success: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
};

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;
  const Icon = icons[toast.tone];

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[calc(100vw-2rem)] max-w-sm print:hidden">
      <div className={`rounded-lg border bg-white p-3 shadow-lg ${toneClass[toast.tone]}`}>
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{toast.title}</div>
            {toast.message && (
              <div className="mt-1 text-xs leading-relaxed text-slate-600">
                {toast.message}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-700"
            aria-label="关闭提示"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
