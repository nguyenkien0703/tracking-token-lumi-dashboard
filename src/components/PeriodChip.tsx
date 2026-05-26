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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-surface-2 transition-colors"
      >
        <Calendar className="w-4 h-4 text-text-secondary" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 text-text-secondary" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg overflow-hidden z-10">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                onChange({ period: p.value, from: value.from, to: value.to });
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
