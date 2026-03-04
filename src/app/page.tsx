"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getHistory } from "@/lib/api";
import { HistoryEntry, DateRange } from "@/types";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import SessionTable from "@/components/SessionTable";

const LIMIT = 50;

export default function OverviewPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [offset, setOffset] = useState(0);
  const [userIdInput, setUserIdInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory({
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
        limit: LIMIT,
        offset,
      });
      setEntries(data.entries);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [dateRange, offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filter changes
  const handleDateChange = (range: DateRange) => {
    setOffset(0);
    setDateRange(range);
  };

  const handleUserLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userIdInput.trim());
    if (!isNaN(id) && id > 0) {
      router.push(`/users/${id}`);
    }
  };

  // Aggregate stats from current page
  const totalTokens = entries.reduce((s, e) => s + e.totalTokens, 0);
  const totalCost = entries.reduce((s, e) => s + e.totalCostUsd, 0);
  const uniqueUsers = new Set(entries.map((e) => e.userId)).size;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Recent activity across all users — {total.toLocaleString()} total records
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {/* User Lookup */}
      <form
        onSubmit={handleUserLookup}
        className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-4"
      >
        <svg
          className="w-4 h-4 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="text-slate-400 text-sm">Jump to user:</span>
        <input
          type="number"
          min={1}
          placeholder="Enter User ID..."
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          className="flex-1 bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 max-w-xs"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-1.5 rounded transition-colors"
        >
          View Detail →
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={total.toLocaleString()}
          sub="all time (filtered)"
          accent="indigo"
        />
        <StatCard
          label="Tokens (this page)"
          value={totalTokens.toLocaleString()}
          sub={`${LIMIT} records shown`}
          accent="indigo"
        />
        <StatCard
          label="Cost (this page)"
          value={`$${totalCost.toFixed(4)}`}
          sub="USD"
          accent="emerald"
        />
        <StatCard
          label="Unique Users"
          value={uniqueUsers}
          sub="on this page"
          accent="amber"
        />
      </div>

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-200 font-semibold">Recent Activity</h2>
          {loading && (
            <span className="text-slate-400 text-xs animate-pulse">Loading...</span>
          )}
        </div>
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg mb-3">
            {error}
          </div>
        )}
        <SessionTable
          entries={entries}
          total={total}
          limit={LIMIT}
          offset={offset}
          onPageChange={setOffset}
          showUserId
        />
      </div>
    </div>
  );
}
