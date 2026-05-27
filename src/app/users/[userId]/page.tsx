"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { subDays, format } from "date-fns";
import {
  getUserCost,
  getUserCostComparison,
  getUserSessions,
  getDailyBreakdown,
  computeAlertThreshold,
} from "@/lib/api";
import type { CostComparison } from "@/lib/api";
import { UserCostSummary, UserSessionsData, DateRange, DailyEntry } from "@/types";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import TokenLineChart from "@/components/TokenLineChart";
import SessionTable from "@/components/SessionTable";

const LIMIT = 50;

function calcDelta(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);

  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string; avatarUrl: string | null } | null>(null);
  const [summary, setSummary] = useState<UserCostSummary | null>(null);
  const [sessionsData, setSessionsData] = useState<UserSessionsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [offset, setOffset] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comparison, setComparison] = useState<CostComparison | null>(null);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number | null>(null);
  const [activePeriod, setActivePeriod] = useState<string>("7d");

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

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await getUserSessions(userId, offset, LIMIT);
      setSessionsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, [userId, offset]);

  const fetchDailyAndComparison = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;
    try {
      const [daily, comp] = await Promise.all([
        getDailyBreakdown(userId, dateRange.from, dateRange.to),
        activePeriod === "7d" || activePeriod === "30d"
          ? getUserCostComparison(userId, dateRange.from, dateRange.to)
          : Promise.resolve(null),
      ]);
      setDailyEntries(daily);
      setComparison(comp);
    } catch {
      // non-critical
    }
  }, [userId, dateRange, activePeriod]);

  const fetchAlertThreshold = useCallback(async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const from30d = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const daily30d = await getDailyBreakdown(userId, from30d, today);
      setAlertThreshold(computeAlertThreshold(daily30d));
    } catch {
      // non-critical
    }
  }, [userId]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { fetchDailyAndComparison(); }, [fetchDailyAndComparison]);
  useEffect(() => { fetchAlertThreshold(); }, [fetchAlertThreshold]);

  const handleDateChange = (range: DateRange, period?: string) => {
    setOffset(0);
    setDateRange(range);
    if (period) setActivePeriod(period);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link href="/" className="hover:text-text-primary transition-colors">Overview</Link>
            <span>/</span>
            <span className="text-text-primary">
              {userInfo ? [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") || userInfo.email || "User Detail" : "User Detail"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userInfo?.avatarUrl ? (
              <img src={userInfo.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {userInfo ? (userInfo.firstName?.[0] ?? userInfo.lastName?.[0] ?? userInfo.email?.[0] ?? "U") : "U"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {userInfo ? [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") || userInfo.email || "User Detail" : "User Detail"}
              </h1>
              {userInfo?.email && (
                <p className="text-text-muted text-sm">{userInfo.email}</p>
              )}
            </div>
          </div>
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Row 1: Token metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Tokens"
          value={summary ? summary.totalTokens.toLocaleString() : "—"}
          loading={loadingSummary}
          delta={
            comparison
              ? { value: calcDelta(comparison.current.totalTokens, comparison.previous.totalTokens), label: "vs prev period", positiveIsGood: false }
              : undefined
          }
        />
        <StatCard
          label="Input Tokens"
          value={summary ? summary.totalPromptTokens.toLocaleString() : "—"}
          loading={loadingSummary}
        />
        <StatCard
          label="Output Tokens"
          value={summary ? summary.totalCompletionTokens.toLocaleString() : "—"}
          loading={loadingSummary}
        />
        <StatCard
          label="Total Cost"
          value={summary ? `$${summary.totalCostUsd.toFixed(4)}` : "—"}
          hint="USD"
          loading={loadingSummary}
          tone={alertThreshold && summary && summary.totalCostUsd > alertThreshold ? "warning" : "default"}
          delta={
            comparison
              ? { value: calcDelta(comparison.current.totalCostUsd, comparison.previous.totalCostUsd), label: "vs prev period", positiveIsGood: false }
              : undefined
          }
        />
      </div>

      {/* Row 2: Activity & cache */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Turns"
          value={summary ? summary.requestCount.toLocaleString() : "—"}
          loading={loadingSummary}
        />
        <StatCard
          label="Sessions"
          value={sessionsData ? sessionsData.total.toLocaleString() : "—"}
          loading={loadingSessions}
        />
        <StatCard
          label="Avg Cost / Turn"
          value={summary && summary.requestCount > 0 ? `$${(summary.totalCostUsd / summary.requestCount).toFixed(4)}` : "—"}
          loading={loadingSummary}
        />
        <StatCard
          label="Cache Saving"
          value={summary?.cacheSavingUsd != null ? `$${summary.cacheSavingUsd.toFixed(4)}` : "$0.0000"}
          hint="USD — BE pending"
          loading={loadingSummary}
        />
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border-default rounded-xl p-5">
        <h2 className="text-text-primary font-semibold text-sm mb-4">Token Usage Over Time</h2>
        {loadingSessions ? (
          <div className="h-40 flex items-center justify-center text-text-muted text-sm animate-pulse">
            Loading chart...
          </div>
        ) : (
          <TokenLineChart entries={dailyEntries} />
        )}
      </div>

      {/* Session Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary font-semibold">
            Chat Sessions
            {sessionsData && (
              <span className="ml-2 text-text-muted font-normal text-sm">
                ({sessionsData.total.toLocaleString()} sessions)
              </span>
            )}
          </h2>
          {loadingSessions && (
            <span className="text-text-muted text-xs animate-pulse">Loading...</span>
          )}
        </div>
        {sessionsData ? (
          <SessionTable
            entries={sessionsData.entries}
            total={sessionsData.total}
            limit={LIMIT}
            offset={offset}
            userId={userId}
            onPageChange={setOffset}
          />
        ) : (
          <div className="bg-surface border border-border-default rounded-xl h-24 flex items-center justify-center text-text-muted text-sm animate-pulse">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
