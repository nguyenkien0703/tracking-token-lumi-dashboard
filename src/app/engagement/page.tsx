"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hourglass, Loader2, RefreshCw } from "lucide-react";
import type { Segment } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import ResponsiveTable, { type Column } from "@/components/ResponsiveTable";
import { fmtInt } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

type Summary = {
  conversations: number;
  totalTurns: number;
  medianTurnsPerConvo: number;
  totalCostUsd: number;
  dailyActive7d: number;
  costPerDailyActiveUser7d: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCacheReadTokens: number;
  cacheHitRate: number;
};

type UserRow = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  conversations: number;
  turns: number;
  total_tokens: number;
  total_cost_usd: number;
  last_active_at: string | null;
};

function fmtUsd2(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

const userCols: Column<UserRow>[] = [
  {
    key: "user",
    header: "User",
    primary: true,
    render: (u) => (
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">
          {u.display_name ?? u.full_name ?? u.email}
        </p>
        <p className="text-text-secondary text-xs truncate">{u.email}</p>
      </div>
    ),
  },
  {
    key: "conversations",
    header: "Convos",
    align: "right",
    render: (u) => <span>{fmtInt(u.conversations)}</span>,
  },
  {
    key: "turns",
    header: "Turns",
    align: "right",
    mobileHidden: true,
    render: (u) => <span>{fmtInt(u.turns)}</span>,
  },
  {
    key: "total_tokens",
    header: "Tokens",
    align: "right",
    mobileHidden: true,
    render: (u) => <span>{fmtInt(u.total_tokens)}</span>,
  },
  {
    key: "total_cost_usd",
    header: "Cost (USD)",
    align: "right",
    render: (u) => (
      <span className="text-warning font-medium">{fmtUsd2(u.total_cost_usd)}</span>
    ),
  },
  {
    key: "last_active_at",
    header: "Last Active",
    align: "right",
    mobileHidden: true,
    render: (u) =>
      u.last_active_at ? (
        <span>{new Date(u.last_active_at).toLocaleDateString()}</span>
      ) : (
        <span>—</span>
      ),
  },
];

export default function EngagementPage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setUsers([]);
    setError(null);
    try {
      const summaryP = fetch(`/api/savameta/engagement/summary?segment=${segment}`, { signal: ctrl.signal })
        .then(async (r) => {
          if (!r.ok) throw new Error(`summary endpoint returned ${r.status}`);
          return r.json();
        });
      const usersP = fetch(`/api/savameta/engagement/by-user?segment=${segment}`, { signal: ctrl.signal })
        .then(async (r) => {
          if (!r.ok) throw new Error(`by-user endpoint returned ${r.status}`);
          return r.json();
        });
      const [s, u] = await Promise.all([summaryP, usersP]);
      if (ctrl.signal.aborted) return;
      setSummary(s.data);
      setUsers(u.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load engagement data");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    fetchAll();
    return () => { abortRef.current?.abort(); };
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Engagement</h1>
          <p className="text-sm text-text-secondary mt-1">
            Conversations, turns, token usage, cost per daily-active user.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? "Refreshing engagement data" : "Refresh engagement data"}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Segment tabs */}
      <SegmentTabs value={segment} onChange={setSegment} />

      {/* Error banner */}
      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Conversations"
          value={summary ? fmtInt(summary.conversations) : "—"}
          hint="distinct sessions"
        />
        <StatCard
          label="Total Turns"
          value={summary ? fmtInt(summary.totalTurns) : "—"}
          hint="all history entries"
        />
        <StatCard
          label="Median Turns/Convo"
          value={summary ? summary.medianTurnsPerConvo.toFixed(1) : "—"}
          tone="success"
        />
        <StatCard
          label="Total Cost"
          value={summary ? fmtUsd2(summary.totalCostUsd) : "—"}
          tone="warning"
        />
        <StatCard
          label="Cost / Daily Active User (7/7d)"
          value={summary ? fmtUsd2(summary.costPerDailyActiveUser7d) : "—"}
          hint={summary ? `${summary.dailyActive7d} daily active` : ""}
          tone="warning"
        />
      </div>

      {/* Token Usage */}
      <section className="bg-surface border border-border-default rounded-lg p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Token Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Prompt Tokens"
            value={summary ? fmtInt(summary.totalPromptTokens) : "—"}
          />
          <StatCard
            label="Completion Tokens"
            value={summary ? fmtInt(summary.totalCompletionTokens) : "—"}
          />
          <StatCard
            label="Cache Read Tokens"
            value={summary ? fmtInt(summary.totalCacheReadTokens) : "—"}
            hint="reused from cache"
            tone="success"
          />
          <StatCard
            label="Cache Hit Rate"
            value={summary ? fmtPct(summary.cacheHitRate) : "—"}
            hint="cache / prompt tokens"
            tone="success"
          />
        </div>
      </section>

      {/* Quality Metrics — replaced with EmptyState (BA chưa define) */}
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Quality Metrics</h2>
        <EmptyState
          icon={<Hourglass className="w-5 h-5" />}
          title="Quality metrics not yet defined"
          description="Awaiting BA spec"
        />
      </section>

      {/* Per-User Engagement */}
      <section className="bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Per-User Engagement ({users.length})
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Sorted by cost descending.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `engagement-${segment}-by-user-${new Date().toISOString().slice(0, 10)}.csv`,
                users as unknown as Record<string, unknown>[],
              )
            }
            className="text-xs text-primary hover:text-primary/80"
          >
            Export CSV
          </button>
        </div>

        {/* Loading banner */}
        {loading && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-text-secondary text-xs bg-surface border-b border-border-default px-3 py-2">
            <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        )}

        <ResponsiveTable
          columns={userCols}
          rows={users}
          rowKey={(u) => u.email}
          emptyState={
            <div className="px-4 py-10 text-center text-text-secondary text-sm">
              No engagement data yet
            </div>
          }
        />
      </section>
    </div>
  );
}
