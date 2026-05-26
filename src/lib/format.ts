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
