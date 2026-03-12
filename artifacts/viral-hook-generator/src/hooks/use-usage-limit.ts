import { useState, useCallback } from "react";

const STORAGE_KEY = "vhg_usage";
const DAILY_LIMIT = 3;

interface UsageData {
  count: number;
  date: string;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: getTodayKey() };
    const parsed = JSON.parse(raw) as UsageData;
    if (parsed.date !== getTodayKey()) return { count: 0, date: getTodayKey() };
    return parsed;
  } catch {
    return { count: 0, date: getTodayKey() };
  }
}

function writeUsage(data: UsageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useUsageLimit() {
  const [usage, setUsage] = useState<UsageData>(readUsage);

  const canGenerate = usage.count < DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - usage.count);

  const recordUsage = useCallback(() => {
    const current = readUsage();
    const updated = { count: current.count + 1, date: getTodayKey() };
    writeUsage(updated);
    setUsage(updated);
  }, []);

  return { canGenerate, remaining, used: usage.count, limit: DAILY_LIMIT, recordUsage };
}
