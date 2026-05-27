"use client";

import Link from "next/link";
import { format, subDays, startOfMonth } from "date-fns";
import { useTopBar } from "@/lib/topbar-context";
import { DateRange } from "@/types";

type Period = "today" | "7d" | "30d" | "month";

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
    case "today": return { from: fmt(today), to: fmt(today) };
    case "7d":    return { from: fmt(subDays(today, 7)), to: fmt(today) };
    case "30d":   return { from: fmt(subDays(today, 30)), to: fmt(today) };
    case "month": return { from: fmt(startOfMonth(today)), to: fmt(today) };
  }
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

export default function TopBar() {
  const { breadcrumbs, showDatePicker, dateRange, activePeriod, setDateRange } = useTopBar();

  return (
    <div className="sticky top-0 z-20 bg-surface border-b border-border-default px-6 py-2.5 flex items-center justify-between gap-4 min-h-[44px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-[#334155] shrink-0">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-text-primary transition-colors truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-text-primary font-medium truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Date range pills — only shown when page opts in */}
      {showDatePicker && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            {PILLS.map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRange(periodToRange(p.id), p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activePeriod === p.id
                    ? "bg-primary text-white"
                    : "text-text-muted hover:text-text-primary border border-border-default"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-base border border-border-default rounded-md text-xs text-text-secondary">
            <span>{formatDateDisplay(dateRange.from)}</span>
            <span className="text-[#334155]">→</span>
            <span>{formatDateDisplay(dateRange.to)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
