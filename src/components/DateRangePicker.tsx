"use client";

import { useState, useEffect } from "react";
import { DateRange } from "@/types";
import { format, subDays, startOfMonth, startOfDay, endOfDay } from "date-fns";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

type Preset = "today" | "7d" | "30d" | "month" | null;

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7d" },
  { key: "30d", label: "Last 30d" },
  { key: "month", label: "This month" },
];

function toISO(d: Date) {
  return d.toISOString();
}

function toInputValue(iso: string) {
  return iso ? format(new Date(iso), "yyyy-MM-dd") : "";
}

function presetRange(preset: Preset): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: toISO(startOfDay(now)), to: toISO(endOfDay(now)) };
    case "7d":
      return { from: toISO(startOfDay(subDays(now, 6))), to: toISO(endOfDay(now)) };
    case "30d":
      return { from: toISO(startOfDay(subDays(now, 29))), to: toISO(endOfDay(now)) };
    case "month":
      return { from: toISO(startOfMonth(now)), to: toISO(endOfDay(now)) };
    default:
      return { from: "", to: "" };
  }
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [activePreset, setActivePreset] = useState<Preset>(null);

  // Detect if value matches a preset (e.g. on initial render)
  useEffect(() => {
    if (!value.from && !value.to) {
      setActivePreset(null);
    }
  }, [value]);

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    onChange(presetRange(preset));
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    const d = e.target.value ? toISO(startOfDay(new Date(e.target.value))) : "";
    onChange({ ...value, from: d });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePreset(null);
    const d = e.target.value ? toISO(endOfDay(new Date(e.target.value))) : "";
    onChange({ ...value, to: d });
  };

  const handleClear = () => {
    setActivePreset(null);
    onChange({ from: "", to: "" });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Preset buttons */}
      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activePreset === p.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100"
            }`}
          >
            {p.label}
          </button>
        ))}
        {(value.from || value.to) && (
          <button
            onClick={handleClear}
            className="text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
            title="Clear filter"
          >
            ✕
          </button>
        )}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={toInputValue(value.from)}
          onChange={handleFromChange}
          className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        />
        <span className="text-slate-500 text-xs">→</span>
        <input
          type="date"
          value={toInputValue(value.to)}
          onChange={handleToChange}
          className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
