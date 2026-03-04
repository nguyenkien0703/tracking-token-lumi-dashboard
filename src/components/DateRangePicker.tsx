"use client";

import { DateRange } from "@/types";
import { format, subDays, startOfMonth } from "date-fns";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toISO(date: Date, endOfDay = false): string {
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

const presets = [
  {
    label: "Today",
    range: () => ({ from: toISO(new Date()), to: toISO(new Date(), true) }),
  },
  {
    label: "Last 7d",
    range: () => ({ from: toISO(subDays(new Date(), 7)), to: toISO(new Date(), true) }),
  },
  {
    label: "Last 30d",
    range: () => ({ from: toISO(subDays(new Date(), 30)), to: toISO(new Date(), true) }),
  },
  {
    label: "This month",
    range: () => ({ from: toISO(startOfMonth(new Date())), to: toISO(new Date(), true) }),
  },
];

export default function DateRangePicker({ value, onChange }: Props) {
  const toInputVal = (iso: string) => (iso ? format(new Date(iso), "yyyy-MM-dd") : "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <input
          type="date"
          value={toInputVal(value.from)}
          onChange={(e) =>
            onChange({ ...value, from: e.target.value ? toISO(new Date(e.target.value)) : "" })
          }
          className="bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        />
        <span className="text-slate-500">—</span>
        <input
          type="date"
          value={toInputVal(value.to)}
          onChange={(e) =>
            onChange({
              ...value,
              to: e.target.value ? toISO(new Date(e.target.value), true) : "",
            })
          }
          className="bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.range())}
            className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            {p.label}
          </button>
        ))}
        {(value.from || value.to) && (
          <button
            onClick={() => onChange({ from: "", to: "" })}
            className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-red-900 text-slate-400 hover:text-red-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
