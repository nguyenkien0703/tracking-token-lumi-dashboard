"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar, Check } from "lucide-react";

export type Period = "1h" | "24h" | "7d" | "30d" | "custom";

export type PeriodValue = {
  period: Period;
  from?: string;
  to?: string;
};

type Props = {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
};

const PRESETS: { value: Period; label: string }[] = [
  { value: "1h",     label: "Last hour" },
  { value: "24h",    label: "Last 24 hours" },
  { value: "7d",     label: "Last 7 days" },
  { value: "30d",    label: "Last 30 days" },
  { value: "custom", label: "Custom range…" },
];

export default function PeriodChip({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PRESETS.find((p) => p.value === value.period) ?? PRESETS[2];

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const todayStr     = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const fromVal = value.from?.slice(0, 10) ?? "";
  const toVal   = value.to?.slice(0, 10) ?? "";

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          border transition-all duration-150 cursor-pointer whitespace-nowrap
          ${open
            ? "bg-primary/10 border-primary text-primary"
            : "bg-surface border-border-default text-text-primary hover:bg-surface-2 hover:border-border-strong"
          }
        `}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span>{current.label}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 opacity-60 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Custom date inputs */}
      {value.period === "custom" && (
        <div className="flex items-center gap-1.5">
          <DateInput
            value={fromVal}
            max={toVal || todayStr}
            onChange={(v) => onChange({ period: "custom", from: v ? `${v}T00:00:00.000Z` : undefined, to: value.to })}
            aria-label="From date"
          />
          <span className="text-text-muted text-xs select-none">→</span>
          <DateInput
            value={toVal}
            min={fromVal}
            max={todayStr}
            onChange={(v) => onChange({ period: "custom", from: value.from, to: v ? `${v}T23:59:59.999Z` : undefined })}
            aria-label="To date"
          />
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 top-full mt-1.5 z-50
            min-w-[168px] rounded-xl overflow-hidden
            bg-surface border border-border-default
            shadow-[0_8px_24px_rgba(0,0,0,0.4)]
          "
        >
          <div className="py-1">
            {PRESETS.map((p, i) => {
              const isActive = p.value === value.period;
              const isCustom = p.value === "custom";
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    if (isCustom) {
                      const from = value.from ?? `${yesterdayStr}T00:00:00.000Z`;
                      const to   = value.to   ?? `${todayStr}T23:59:59.999Z`;
                      onChange({ period: "custom", from, to });
                    } else {
                      onChange({ period: p.value });
                    }
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    px-3 py-2 text-sm transition-colors duration-100 cursor-pointer
                    ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-primary hover:bg-surface-2"
                    }
                    ${isCustom && i > 0 ? "border-t border-border-default mt-1 pt-2.5" : ""}
                  `}
                >
                  <span>{p.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateInput({
  value,
  min,
  max,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
  "aria-label"?: string;
}) {
  return (
    <div className="relative group">
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="
          bg-surface border border-border-default rounded-lg
          pl-2.5 pr-2 py-1.5 text-xs text-text-primary
          cursor-pointer transition-colors duration-150
          hover:border-border-strong
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
          [color-scheme:dark]
        "
      />
    </div>
  );
}
