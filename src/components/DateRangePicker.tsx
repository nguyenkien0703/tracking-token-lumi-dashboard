"use client";

import { useState } from "react";
import { DateRange } from "@/types";
import { format, subDays, startOfMonth } from "date-fns";

type Period = "today" | "7d" | "30d" | "month" | "custom";

const PILLS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d",    label: "Last 7d" },
  { id: "30d",   label: "Last 30d" },
  { id: "month", label: "This month" },
];

function periodToRange(period: Period): DateRange {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  switch (period) {
    case "today":  return { from: fmt(today), to: fmt(today) };
    case "7d":     return { from: fmt(subDays(today, 7)), to: fmt(today) };
    case "30d":    return { from: fmt(subDays(today, 30)), to: fmt(today) };
    case "month":  return { from: fmt(startOfMonth(today)), to: fmt(today) };
    default:       return { from: "", to: "" };
  }
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange, period?: Period) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [activePeriod, setActivePeriod] = useState<Period>("7d");

  const handlePill = (period: Period) => {
    setActivePeriod(period);
    onChange(periodToRange(period), period);
  };

  const handleDateInput = (field: "from" | "to", val: string) => {
    setActivePeriod("custom");
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Period pills */}
      <div className="flex items-center gap-1">
        {PILLS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePill(p.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activePeriod === p.id
                ? "bg-primary text-white"
                : "bg-surface-2 text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.from}
          onChange={(e) => handleDateInput("from", e.target.value)}
          className="bg-surface border border-border-default rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
        />
        <span className="text-text-muted text-xs">→</span>
        <input
          type="date"
          value={value.to}
          onChange={(e) => handleDateInput("to", e.target.value)}
          className="bg-surface border border-border-default rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}
