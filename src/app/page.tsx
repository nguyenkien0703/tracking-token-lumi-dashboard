"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Users, Coins, DollarSign, Clock, UserPlus, RefreshCw, Loader2 } from "lucide-react";
import { Segment, SEGMENT_LABELS } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import PeriodChip, { PeriodValue } from "@/components/PeriodChip";
import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import UserSearch from "@/components/UserSearch";

// Defined inline to avoid importing server-only savameta-queries module
type AdoptionSummary = {
  totalEligible: number;
  joined: number;
  notJoined: number;
  adoptionRate: number;
  dailyActive7d: number;
};

interface TopUser {
  rank: number;
  userId: number;
  email: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  requestCount: number;
}

const REFRESH_INTERVAL = 60;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtInt(n: number): string {
  return n.toLocaleString();
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

function periodLabel(p: PeriodValue): string {
  if (p.period === "custom" && p.from && p.to) return `${p.from} → ${p.to}`;
  const map: Record<string, string> = {
    "1h": "Last hour",
    "24h": "Last 24h",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
  };
  return map[p.period] ?? p.period;
}

function derivePeriod(p: PeriodValue): { from?: string; to?: string } {
  if (p.period === "custom") return { from: p.from, to: p.to };
  const now = new Date();
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const day = 24 * 60 * 60 * 1000;
  switch (p.period) {
    case "1h":  return { from: ago(60 * 60 * 1000), to: now.toISOString() };
    case "24h": return { from: ago(day),            to: now.toISOString() };
    case "7d":  return { from: ago(7 * day),        to: now.toISOString() };
    case "30d": return { from: ago(30 * day),       to: now.toISOString() };
  }
  return {};
}

function AdoptionKpiRow({ data, loading }: { data: AdoptionSummary | null; loading: boolean }) {
  if (!loading && data && data.totalEligible === 0) {
    return (
      <EmptyState
        icon={<UserPlus className="w-5 h-5" />}
        title="Roster is empty"
        description="Import employees in Settings → Roster to enable adoption metrics."
        action={
          <Link href="/settings/roster" className="text-primary text-sm hover:underline">
            Open Roster →
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Eligible" value={fmtInt(data?.totalEligible ?? 0)} loading={loading} />
      <StatCard label="Joined"         value={fmtInt(data?.joined ?? 0)}        loading={loading} tone="success" />
      <StatCard label="Not Joined"     value={fmtInt(data?.notJoined ?? 0)}     loading={loading} tone="danger" />
      <StatCard
        label="Adoption Rate"
        value={data ? `${(data.adoptionRate * 100).toFixed(1)}%` : "—"}
        loading={loading}
        tone="success"
      />
    </div>
  );
}

const topUserCols: Column<TopUser>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    width: "50px",
    render: (u) => (
      <span className="text-text-secondary text-xs font-mono">{u.rank}</span>
    ),
  },
  {
    key: "user",
    header: "User",
    primary: true,
    render: (u) => {
      const displayName =
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.userName ||
        u.email ||
        `#${u.userId}`;
      const initials =
        u.firstName?.[0] ?? u.lastName?.[0] ?? u.userName?.[0] ?? "#";
      return (
        <Link href={`/users/${u.userId}`} className="flex items-center gap-2.5 group">
          {u.avatarUrl ? (
            <img
              src={u.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
              {initials.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors truncate">
              {displayName}
            </p>
            {u.email && u.email !== displayName && (
              <p className="text-text-secondary text-xs truncate">{u.email}</p>
            )}
          </div>
        </Link>
      );
    },
  },
  {
    key: "totalTokens",
    header: "Tokens",
    align: "right",
    render: (u) => <span className="font-mono text-xs">{fmtInt(u.totalTokens)}</span>,
  },
  {
    key: "requestCount",
    header: "Requests",
    align: "right",
    mobileHidden: true,
    render: (u) => <span className="font-mono text-xs">{fmtInt(u.requestCount)}</span>,
  },
  {
    key: "totalCostUsd",
    header: "Cost",
    align: "right",
    render: (u) => <span className="font-mono text-xs text-success">{fmtUsd(u.totalCostUsd)}</span>,
  },
];

export default function OverviewPage() {
  const [segment, setSegment] = useState<Segment>("all");
  const [period, setPeriod] = useState<PeriodValue>({ period: "7d" });
  const [users, setUsers] = useState<TopUser[]>([]);
  const [adoption, setAdoption] = useState<AdoptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const loadDataRef = useRef<() => Promise<void>>(async () => {});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({ segment, limit: "10" });
      const { from, to } = derivePeriod(period);
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);

      const topUsersP = fetch(`/api/admin/top-users?${sp}`).then((r) => r.json());
      const adoptionP =
        segment === "savameta"
          ? fetch(`/api/savameta/adoption/summary`).then((r) => r.json())
          : Promise.resolve(null);

      const [topJson, adoptionJson] = await Promise.all([topUsersP, adoptionP]);
      if (!topJson?.success) throw new Error(topJson?.error || "Failed to load top users");
      setUsers(topJson.data?.users ?? []);
      setAdoption(adoptionJson?.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [segment, period]);

  // Keep ref updated so timer always calls latest loadData
  useEffect(() => { loadDataRef.current = loadData; }, [loadData]);

  // Initial load + re-fetch on segment/period change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Countdown timer — auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          loadDataRef.current();
          return REFRESH_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeUsers = users.length;
  const totalTokens = users.reduce((s, u) => s + u.totalTokens, 0);
  const totalCostUsd = users.reduce((s, u) => s + u.totalCostUsd, 0);
  const avgCostPerUser = activeUsers > 0 ? totalCostUsd / activeUsers : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {SEGMENT_LABELS[segment].label} · {periodLabel(period)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodChip value={period} onChange={setPeriod} />
          <button
            onClick={() => { loadData(); setCountdown(REFRESH_INTERVAL); }}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Segment + Search row */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentTabs value={segment} onChange={setSegment} />
        <UserSearch />
        {!loading && (
          <span className="ml-auto text-text-secondary text-xs bg-surface border border-border-default px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            Next refresh in{" "}
            <span className={`font-mono font-semibold ${countdown <= 30 ? "text-warning" : "text-text-primary"}`}>
              {formatCountdown(countdown)}
            </span>
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Users"  value={fmtInt(activeUsers)}    loading={loading} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Total Tokens"  value={fmtInt(totalTokens)}    loading={loading} icon={<Coins className="w-4 h-4" />} />
        <StatCard label="Total Cost"    value={fmtUsd(totalCostUsd)}   loading={loading} tone="warning" icon={<DollarSign className="w-4 h-4" />} />
        <StatCard label="Avg / User"    value={fmtUsd(avgCostPerUser)} loading={loading} hint="per active user" />
      </div>

      {/* Adoption KPI row — only when segment === "savameta" */}
      {segment === "savameta" && (
        <AdoptionKpiRow data={adoption} loading={loading} />
      )}

      {/* Top users preview table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary font-semibold">Top Users</h2>
          <Link href="/users" className="text-primary text-sm hover:underline">View all →</Link>
        </div>
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <ResponsiveTable
            columns={topUserCols}
            rows={users}
            rowKey={(u) => u.userId}
            emptyState={
              !loading ? (
                <div className="px-4 py-10 text-center text-text-secondary text-sm">
                  No usage data found
                </div>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
