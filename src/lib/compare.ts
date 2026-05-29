"use client";

export const COMPARE_KEY = "aibench:compare:v1";
export const COMPARE_EVENT = "aibench:compare:changed";
const MAX_COMPARE_IDS = 4;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCompareIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, MAX_COMPARE_IDS);
  } catch {
    return [];
  }
}

export function saveCompareIds(ids: string[]) {
  if (!canUseStorage()) return;
  const clean = Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_COMPARE_IDS);
  window.localStorage.setItem(COMPARE_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT));
}

export function addCompareId(reportId: string) {
  const next = [reportId, ...loadCompareIds().filter((id) => id !== reportId)].slice(0, MAX_COMPARE_IDS);
  saveCompareIds(next);
  return next;
}

export function removeCompareId(reportId: string) {
  const next = loadCompareIds().filter((id) => id !== reportId);
  saveCompareIds(next);
  return next;
}
