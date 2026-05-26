"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

export type Period = "1h" | "24h" | "7d" | "30d" | "custom";

export type PeriodValue = {
  period: Period;
  from?: string;  // ISO date when period === "custom"
  to?: string;
};

type Props = {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
};

const PRESETS: { value: Period; label: string }[] = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range…" },
];

export default function PeriodChip({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PRESETS.find((p) => p.value === value.period) ?? PRESETS[2];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Default custom range: yesterday → today (so inputs aren't blank on first pick)
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const fromVal = value.from?.slice(0, 10) ?? "";
  const toVal = value.to?.slice(0, 10) ?? "";

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-surface-2 transition-colors"
      >
        <Calendar className="w-4 h-4 text-text-secondary" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 text-text-secondary" />
      </button>

      {value.period === "custom" && (
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <input
            type="date"
            value={fromVal}
            max={toVal || todayStr}
            onChange={(e) => {
              const from = e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined;
              onChange({ period: "custom", from, to: value.to });
            }}
            className="bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="From date"
          />
          <span className="text-text-muted">→</span>
          <input
            type="date"
            value={toVal}
            min={fromVal}
            max={todayStr}
            onChange={(e) => {
              const to = e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined;
              onChange({ period: "custom", from: value.from, to });
            }}
            className="bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="To date"
          />
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg overflow-hidden z-10">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                if (p.value === "custom") {
                  // Seed dates so the request fires immediately with a sensible default
                  const from = value.from ?? `${yesterdayStr}T00:00:00.000Z`;
                  const to = value.to ?? `${todayStr}T23:59:59.999Z`;
                  onChange({ period: "custom", from, to });
                } else {
                  onChange({ period: p.value });
                }
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                p.value === value.period
                  ? "bg-primary/10 text-primary"
                  : "text-text-primary hover:bg-surface-2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
