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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {userInfo?.avatarUrl ? (
            <img src={userInfo.avatarUrl} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "white" }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>{userName}</div>
            {userInfo?.email && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{userInfo.email}</div>}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Section label */}
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3B82F6", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        Token Metrics
        <span style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
      </div>

      {/* Row 1: Token metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
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

      {/* Section label */}
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3B82F6", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        Activity &amp; Cache
        <span style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
      </div>

      {/* Row 2: Activity & cache */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
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
      <div style={{ background: "#141A2E", border: "1px solid #252D4A", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>
          Token Usage Over Time
        </div>
        {loadingDaily ? (
          <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }} className="animate-pulse">
            Loading chart...
          </div>
        ) : (
          <TokenLineChart entries={dailyEntries} />
        )}
      </div>

      {/* Session Table */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>Chat Sessions</span>
          {sessionsData && (
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 400, marginLeft: 6 }}>
              ({sessionsData.total.toLocaleString()} sessions)
            </span>
          )}
          {loadingSessions && (
            <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }} className="animate-pulse">Loading...</span>
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
          <div style={{ background: "#141A2E", border: "1px solid #252D4A", borderRadius: 10, height: 96, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }} className="animate-pulse">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
