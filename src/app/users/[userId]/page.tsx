"use client";

import { useState, useEffect, useCallback } from "react";
import { subDays, format } from "date-fns";
import {
  getUserCost,
  getUserCostComparison,
  getUserSessions,
  getDailyBreakdown,
  computeAlertThreshold,
} from "@/lib/api";
import type { CostComparison } from "@/lib/api";
import { UserCostSummary, UserSessionsData, DailyEntry } from "@/types";
import StatCard from "@/components/StatCard";
import TokenLineChart from "@/components/TokenLineChart";
import SessionTable from "@/components/SessionTable";
import { useTopBar } from "@/lib/topbar-context";
import { usePageSetup } from "@/lib/use-page-setup";

const LIMIT = 50;

function calcDelta(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const userId = parseInt(params.userId);
  const { dateRange, activePeriod, setDateRange } = useTopBar();

  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string; avatarUrl: string | null } | null>(null);
  const [summary, setSummary] = useState<UserCostSummary | null>(null);
  const [sessionsData, setSessionsData] = useState<UserSessionsData | null>(null);
  const [offset, setOffset] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comparison, setComparison] = useState<CostComparison | null>(null);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [alertThreshold, setAlertThreshold] = useState<number | null>(null);

  const userName = userInfo
    ? [userInfo.firstName, userInfo.lastName].filter(Boolean).join(" ") || userInfo.email || `User #${userId}`
    : `User #${userId}`;

  usePageSetup(
    [{ label: "Overview", href: "/" }, { label: userName }],
    true
  );

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

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* User header */}
      <div className="flex items-center gap-3 mb-2">
        {userInfo?.avatarUrl ? (
          <img src={userInfo.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
        ) : (
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}>
            {userInfo ? (userInfo.firstName?.[0] ?? userInfo.lastName?.[0] ?? userInfo.email?.[0] ?? "U").toUpperCase() : "U"}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-text-primary leading-tight">{userName}</h1>
          {userInfo?.email && (
            <p className="text-text-muted text-xs mt-0.5">{userInfo.email}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Row 1: Token metrics */}
      <div className="border border-border-default rounded-lg overflow-hidden">
        <div className="px-3 py-1.5 border-b border-border-default bg-surface-2/60">
          <p className="text-[9px] uppercase tracking-widest font-bold text-primary">Token Metrics</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border-default">
          <StatCard grouped
            label="Total Tokens"
            value={summary ? summary.totalTokens.toLocaleString() : "—"}
            loading={loadingSummary}
            valueColor="blue"
            delta={
              comparison
                ? { value: calcDelta(comparison.current.totalTokens, comparison.previous.totalTokens), label: "vs prev period", positiveIsGood: false }
                : undefined
            }
          />
          <StatCard grouped
            label="Input Tokens"
            value={summary ? summary.totalPromptTokens.toLocaleString() : "—"}
            loading={loadingSummary}
            valueColor="slate"
          />
          <StatCard grouped
            label="Output Tokens"
            value={summary ? summary.totalCompletionTokens.toLocaleString() : "—"}
            loading={loadingSummary}
            valueColor="slate"
          />
          <StatCard grouped
            label="Total Cost"
            value={summary ? `$${summary.totalCostUsd.toFixed(4)}` : "—"}
            hint="USD"
            loading={loadingSummary}
            tone={alertThreshold !== null && summary && summary.totalCostUsd > alertThreshold ? "warning" : "default"}
            valueColor="green"
            delta={
              comparison
                ? { value: calcDelta(comparison.current.totalCostUsd, comparison.previous.totalCostUsd), label: "vs prev period", positiveIsGood: false }
                : undefined
            }
          />
        </div>
      </div>

      {/* Row 2: Activity & cache */}
      <div className="border border-border-default rounded-lg overflow-hidden">
        <div className="px-3 py-1.5 border-b border-border-default bg-surface-2/60">
          <p className="text-[9px] uppercase tracking-widest font-bold text-primary">Activity &amp; Cache</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border-default">
          <StatCard grouped
            label="Turns"
            value={summary ? summary.requestCount.toLocaleString() : "—"}
            loading={loadingSummary}
            valueColor="amber"
          />
          <StatCard grouped
            label="Sessions"
            value={sessionsData ? sessionsData.total.toLocaleString() : "—"}
            loading={loadingSessions}
            valueColor="purple"
          />
          <StatCard grouped
            label="Avg Cost / Turn"
            value={summary && summary.requestCount > 0 ? `$${(summary.totalCostUsd / summary.requestCount).toFixed(4)}` : "—"}
            loading={loadingSummary}
            valueColor="green"
          />
          <StatCard grouped
            label="Cache Saving"
            value={summary?.cacheSavingUsd != null ? `$${summary.cacheSavingUsd.toFixed(4)}` : "$0.0000"}
            hint="USD — BE pending"
            loading={loadingSummary}
            valueColor="cyan"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border-default rounded-lg p-4">
        <h2 className="text-text-primary font-medium text-[13px] mb-3">Token Usage Over Time</h2>
        {loadingSessions ? (
          <div className="h-56 flex items-center justify-center text-text-muted text-sm animate-pulse">
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
            onPageChange={handlePageChange}
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
