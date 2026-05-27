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
import SectionLabel from "@/components/ui/SectionLabel";
import Card from "@/components/ui/Card";
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
  const [loadingDaily, setLoadingDaily] = useState(true);
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
    setLoadingDaily(true);
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
    } finally {
      setLoadingDaily(false);
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

  const initials = userInfo
    ? (userInfo.firstName?.[0] ?? userInfo.lastName?.[0] ?? userInfo.email?.[0] ?? "U").toUpperCase()
    : "U";

  return (
    <div>

      {/* User header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {userInfo?.avatarUrl ? (
            <img src={userInfo.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)", fontSize: 16 }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-text-primary font-bold truncate" style={{ fontSize: 20 }}>{userName}</div>
            {userInfo?.email && <div className="text-text-muted mt-0.5 truncate" style={{ fontSize: 12 }}>{userInfo.email}</div>}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-2.5 rounded-lg mb-4">
          {error}
        </div>
      )}

      <SectionLabel>Token Metrics</SectionLabel>

      {/* Row 1: Token metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Total Tokens"
          value={summary ? summary.totalTokens.toLocaleString() : "—"}
          loading={loadingSummary}
          valueColor="blue"
          delta={comparison ? { value: calcDelta(comparison.current.totalTokens, comparison.previous.totalTokens), label: "vs prev period", positiveIsGood: true } : undefined}
        />
        <StatCard
          label="Input Tokens"
          value={summary ? summary.totalPromptTokens.toLocaleString() : "—"}
          loading={loadingSummary}
          valueColor="slate"
          badge={{ text: "renamed", variant: "renamed" }}
        />
        <StatCard
          label="Output Tokens"
          value={summary ? summary.totalCompletionTokens.toLocaleString() : "—"}
          loading={loadingSummary}
          valueColor="slate"
          badge={{ text: "renamed", variant: "renamed" }}
        />
        <StatCard
          label="Total Cost"
          value={summary ? `$${summary.totalCostUsd.toFixed(4)}` : "—"}
          hint="USD"
          loading={loadingSummary}
          tone={alertThreshold !== null && summary && summary.totalCostUsd > alertThreshold ? "warning" : "default"}
          valueColor="green"
          delta={comparison ? { value: calcDelta(comparison.current.totalCostUsd, comparison.previous.totalCostUsd), label: "vs prev period", positiveIsGood: false } : undefined}
        />
      </div>

      <SectionLabel>Activity &amp; Cache</SectionLabel>

      {/* Row 2: Activity & cache */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Turns"
          value={summary ? summary.requestCount.toLocaleString() : "—"}
          loading={loadingSummary}
          valueColor="amber"
          badge={{ text: "renamed", variant: "renamed" }}
        />
        <StatCard
          label="Sessions"
          value={sessionsData ? sessionsData.total.toLocaleString() : "—"}
          loading={loadingSessions}
          valueColor="purple"
          badge={{ text: "new", variant: "new" }}
          hint={sessionsData && summary ? `Avg ${(summary.requestCount / sessionsData.total).toFixed(1)} turns/session` : undefined}
        />
        <StatCard
          label="Avg Cost / Turn"
          value={summary && summary.requestCount > 0 ? `$${(summary.totalCostUsd / summary.requestCount).toFixed(4)}` : "—"}
          loading={loadingSummary}
          valueColor="green"
          badge={{ text: "new", variant: "new" }}
          hint={summary && summary.requestCount > 0 ? `= $${summary.totalCostUsd.toFixed(4)} / ${summary.requestCount} turns` : undefined}
        />
        <StatCard
          label="Cache Saving"
          value={summary?.cacheSavingUsd != null ? `$${summary.cacheSavingUsd.toFixed(2)}` : "$0.00"}
          loading={loadingSummary}
          valueColor="cyan"
          badge={{ text: "BE pending", variant: "pending" }}
          hint="Waiting for BE data"
        />
      </div>

      {/* Chart */}
      <Card title="Token Usage Over Time" className="mb-5">
        {loadingDaily ? (
          <div className="h-[140px] flex items-center justify-center text-text-muted text-sm animate-pulse">
            Loading chart...
          </div>
        ) : (
          <TokenLineChart entries={dailyEntries} />
        )}
      </Card>

      {/* Session Table */}
      <div>
        <div className="flex items-center mb-2.5">
          <span className="text-sm font-semibold text-text-primary">Chat Sessions</span>
          {sessionsData && (
            <span className="text-xs text-text-muted ml-1.5">
              ({sessionsData.total.toLocaleString()} sessions)
            </span>
          )}
          {loadingSessions && (
            <span className="text-[11px] text-text-muted ml-auto animate-pulse">Loading...</span>
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
          <Card padded={false} className="h-24 flex items-center justify-center text-text-muted text-sm animate-pulse">
            Loading...
          </Card>
        )}
      </div>
    </div>
  );
}
