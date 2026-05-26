import type { PeriodValue } from "@/components/PeriodChip";

export function formatNumber(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return n.toLocaleString("en-US");
}

export function formatCurrency(n: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? (n >= 100 ? 2 : 4);
  return `$${n.toFixed(decimals)}`;
}

export function formatDelta(value: number): { sign: "up" | "down" | "flat"; pct: string } {
  if (Math.abs(value) < 0.5) return { sign: "flat", pct: "0%" };
  return {
    sign: value > 0 ? "up" : "down",
    pct: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
  };
}

export function fmtInt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString();
}

export function fmtUsd(n: number | null | undefined): string {
  return `$${(n ?? 0).toFixed(4)}`;
}

export function derivePeriod(p: PeriodValue): { from?: string; to?: string } {
  if (p.period === "custom") return { from: p.from, to: p.to };
  const now = new Date();
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const day = 24 * 60 * 60 * 1000;
  switch (p.period) {
    case "1h":  return { from: ago(60 * 60 * 1000), to: now.toISOString() };
    case "24h": return { from: ago(day),            to: now.toISOString() };
    case "7d":  return { from: ago(7 * day),        to: now.toISOString() };
    case "30d": return { from: ago(30 * day),       to: now.toISOString() };
    default: { const _e: never = p.period; void _e; return {}; }
  }
}

export function periodLabel(p: PeriodValue): string {
  if (p.period === "custom" && p.from && p.to) return `${p.from} → ${p.to}`;
  const map: Record<string, string> = {
    "1h": "Last hour",
    "24h": "Last 24h",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
  };
  return map[p.period] ?? p.period;
}
