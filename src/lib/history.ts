"use client";

export type HistoryEntry = {
  reportId: string;
  ts: number;
  protocol: string;
  model: string;
};

const KEY = "aibench:history:v1";
const MAX_ENTRIES = 30;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is HistoryEntry =>
        !!x &&
        typeof x === "object" &&
        typeof (x as HistoryEntry).reportId === "string" &&
        typeof (x as HistoryEntry).ts === "number" &&
        typeof (x as HistoryEntry).protocol === "string" &&
        typeof (x as HistoryEntry).model === "string",
    );
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry): void {
  if (!isBrowser()) return;
  try {
    const list = loadHistory().filter((e) => e.reportId !== entry.reportId);
    list.unshift(entry);
    const trimmed = list.slice(0, MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // 存储满或被禁用时静默失败,不影响主流程
  }
}

export function removeHistory(reportId: string): void {
  if (!isBrowser()) return;
  try {
    const list = loadHistory().filter((e) => e.reportId !== reportId);
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 静默失败
  }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 静默失败
  }
}
