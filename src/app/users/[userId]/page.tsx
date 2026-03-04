"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getUserCost, getHistory } from "@/lib/api";
import { UserCostSummary, HistoryData, HistoryEntry, DateRange } from "@/types";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import TokenLineChart from "@/components/TokenLineChart";
import SessionTable from "@/components/SessionTable";

const LIMIT = 50;

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);

  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string; avatarUrl: string | null } | null>(null);
  const [summary, setSummary] = useState<UserCostSummary | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [chartEntries, setChartEntries] = useState<HistoryEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [offset, setOffset] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/proxy/user/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        const u = Array.isArray(json) ? json[0] : json?.data?.[0] ?? json?.data;
        if (u) setUserInfo({ firstName: u.firstName, lastName: u.lastName, email: u.email, avatarUrl: u.avatarUrl ?? null });
      })
      .catch(() => null);
  }, [userId]);

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
      // Fetch paginated data for table
      const data = await getHistory({
        userId,
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
        limit: LIMIT,
        offset,
      });
      setHistoryData(data);

      // Fetch all entries (up to 500) for chart — only when date/user changes (not pagination)
      if (offset === 0) {
        const allData = await getHistory({
          userId,
          from: dateRange.from || undefined,
          to: dateRange.to || undefined,
          limit: 500,
          offset: 0,
        });
        setChartEntries(allData.entries);
      }
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
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Link href="/" className="hover:text-slate-200 transition-colors">Overview</Link>
            <span>/</span>
            <span className="text-slate-200">User #{userId}</span>
          </div>
          <div className="flex items-center gap-3">
            {userInfo?.avatarUrl ? (
              <img src={userInfo.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold">
                {userInfo ? userInfo.firstName[0] : "#"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : `User #${userId}`}
              </h1>
              {userInfo && (
                <p className="text-slate-400 text-sm">{userInfo.email} · <span className="text-slate-500">#{userId}</span></p>
              )}
            </div>
          </div>
          {isLoading && <span className="text-slate-500 text-xs animate-pulse mt-1 block">Fetching data...</span>}
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Tokens"
          value={summary ? summary.totalTokens.toLocaleString() : "—"}
          accent="indigo"
        />
        <StatCard
          label="Prompt Tokens"
          value={summary ? summary.totalPromptTokens.toLocaleString() : "—"}
          accent="indigo"
        />
        <StatCard
          label="Completion Tokens"
          value={summary ? summary.totalCompletionTokens.toLocaleString() : "—"}
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
          value={summary ? Object.keys(summary.modelUsage ?? {}).length : "—"}
          accent="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Token Usage Over Time */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-4">Token Usage Over Time</h2>
          {chartEntries.length > 0 ? (
            <TokenLineChart entries={chartEntries} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm animate-pulse">
              Loading chart...
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
