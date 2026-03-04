"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getUserCost, getHistory } from "@/lib/api";
import { UserCostSummary, HistoryData, DateRange } from "@/types";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import TokenLineChart from "@/components/TokenLineChart";
import ModelBarChart from "@/components/ModelBarChart";
import SessionTable from "@/components/SessionTable";

const LIMIT = 50;

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);

  const [summary, setSummary] = useState<UserCostSummary | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [offset, setOffset] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await getUserCost(userId, dateRange.from || undefined, dateRange.to || undefined);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setLoadingSummary(false);
    }
  }, [userId, dateRange]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getHistory({
        userId,
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
        limit: LIMIT,
        offset,
      });
      setHistoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, [userId, dateRange, offset]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDateChange = (range: DateRange) => {
    setOffset(0);
    setDateRange(range);
  };

  const isLoading = loadingSummary || loadingHistory;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/" className="hover:text-slate-200 transition-colors">Overview</Link>
            <span>/</span>
            <span className="text-slate-200">User #{userId}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">User #{userId}</h1>
          {isLoading && (
            <span className="text-slate-500 text-xs animate-pulse">Fetching data...</span>
          )}
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Tokens"
          value={summary ? summary.totalTokens.toLocaleString() : "—"}
          accent="indigo"
        />
        <StatCard
          label="Total Cost"
          value={summary ? `$${summary.totalCostUsd.toFixed(4)}` : "—"}
          sub="USD"
          accent="emerald"
        />
        <StatCard
          label="Requests"
          value={summary ? summary.requestCount.toLocaleString() : "—"}
          accent="amber"
        />
        <StatCard
          label="Models Used"
          value={summary ? Object.keys(summary.modelUsage).length : "—"}
          accent="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Token Usage Over Time */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-4">Token Usage Over Time</h2>
          {historyData ? (
            <TokenLineChart entries={historyData.entries} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm animate-pulse">
              Loading chart...
            </div>
          )}
        </div>

        {/* Model Breakdown */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-4">Model Breakdown</h2>
          {summary ? (
            <ModelBarChart modelUsage={summary.modelUsage} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm animate-pulse">
              Loading chart...
            </div>
          )}

          {/* Model detail list */}
          {summary && (
            <div className="mt-3 space-y-1.5">
              {Object.entries(summary.modelUsage).map(([model, usage]) => (
                <div key={model} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono truncate max-w-[140px]" title={model}>
                    {model}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-indigo-300">{usage.tokens.toLocaleString()} tok</span>
                    <span className="text-emerald-400">${usage.costUsd.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session History Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-200 font-semibold">
            Session History
            {historyData && (
              <span className="ml-2 text-slate-500 font-normal text-sm">
                ({historyData.total.toLocaleString()} records)
              </span>
            )}
          </h2>
          {loadingHistory && (
            <span className="text-slate-400 text-xs animate-pulse">Loading...</span>
          )}
        </div>
        {historyData ? (
          <SessionTable
            entries={historyData.entries}
            total={historyData.total}
            limit={LIMIT}
            offset={offset}
            onPageChange={setOffset}
          />
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl h-24 flex items-center justify-center text-slate-500 text-sm animate-pulse">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
