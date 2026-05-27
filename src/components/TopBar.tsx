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

const dateInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#94A3B8",
  fontSize: 12,
  fontFamily: "'SF Mono', ui-monospace, monospace",
  cursor: "pointer",
  padding: 0,
  colorScheme: "dark",
  width: 110,
};

export default function TopBar() {
  const { breadcrumbs, showDatePicker, dateRange, activePeriod, setDateRange } = useTopBar();

  const onFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!next) return;
    const to = next > dateRange.to ? next : dateRange.to;
    setDateRange({ from: next, to }, "custom");
  };

  const onToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!next) return;
    const from = next < dateRange.from ? next : dateRange.from;
    setDateRange({ from, to: next }, "custom");
  };

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "#141A2E", borderBottom: "1px solid #252D4A",
      padding: "10px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      minHeight: 44,
    }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: "#334155" }}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} style={{ color: "#94A3B8", textDecoration: "none" }}
                className="hover:!text-[#F1F5F9] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: "#F1F5F9", fontWeight: 500 }}>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Date range pills */}
      {showDatePicker && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {PILLS.map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRange(periodToRange(p.id), p.id)}
                style={{
                  padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  border: activePeriod === p.id ? "1px solid #3B82F6" : "1px solid #252D4A",
                  color: activePeriod === p.id ? "white" : "#64748B",
                  background: activePeriod === p.id ? "#3B82F6" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 12px", background: "#141A2E",
            border: `1px solid ${activePeriod === "custom" ? "#3B82F6" : "#252D4A"}`,
            borderRadius: 7,
          }}>
            <input
              type="date"
              value={dateRange.from}
              max={dateRange.to || undefined}
              onChange={onFromChange}
              style={dateInputStyle}
              aria-label="From date"
            />
            <span style={{ color: "#334155", fontSize: 12 }}>→</span>
            <input
              type="date"
              value={dateRange.to}
              min={dateRange.from || undefined}
              onChange={onToChange}
              style={dateInputStyle}
              aria-label="To date"
            />
          </div>
        </div>
      )}
    </div>
  );
}
