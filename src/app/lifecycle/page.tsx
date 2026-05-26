"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Segment } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import StatCard from "@/components/StatCard";
import ResponsiveTable, { type Column } from "@/components/ResponsiveTable";
import { fmtInt } from "@/lib/format";

// Hex equivalents of design tokens — recharts can't read CSS vars.
const CHART_COLORS = {
  primary:   "#6366f1",
  success:   "#10b981",
  warning:   "#f59e0b",
  danger:    "#ef4444",
  muted:     "#64748b",
  grid:      "#334155",
  axis:      "#94a3b8",
  tooltipBg: "#1e293b",
  tooltipBd: "#334155",
} as const;

type Bucket = "active" | "at_risk" | "dormant" | "never_joined";

type Counts = Record<Bucket, number>;

type LifecycleUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  last_active_at: string | null;
  days_since_last_activity: number | null;
  bucket: Bucket;
};

const BUCKET_META: Record<Bucket, { label: string; hint: string }> = {
  active:       { label: "Active",       hint: "≤ 3 days" },
  at_risk:      { label: "At Risk",      hint: "4–30 days" },
  dormant:      { label: "Dormant",      hint: "> 30 days" },
  never_joined: { label: "Never Joined", hint: "no activity" },
};

const BUCKET_ORDER: Bucket[] = ["active", "at_risk", "dormant", "never_joined"];

const bucketColor: Record<Bucket, string> = {
  active:       CHART_COLORS.success,
  at_risk:      CHART_COLORS.warning,
  dormant:      CHART_COLORS.danger,
  never_joined: CHART_COLORS.muted,
};

const tooltipStyle = {
  background:   CHART_COLORS.tooltipBg,
  border:       `1px solid ${CHART_COLORS.tooltipBd}`,
  borderRadius: "6px",
  fontSize:     "12px",
};

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Columns defined outside component — stable reference, no re-creation on render.
const lifecycleCols: Column<LifecycleUser>[] = [
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
    key: "last_active",
    header: "Last Active",
    mobileHidden: true,
    render: (u) =>
      u.last_active_at ? (
        <span>{new Date(u.last_active_at).toLocaleDateString()}</span>
      ) : (
        <span className="text-text-muted">—</span>
      ),
  },
  {
    key: "days_idle",
    header: "Days Idle",
    align: "right",
    render: (u) => {
      if (u.days_since_last_activity === null) {
        return <span className="text-text-muted text-xs">—</span>;
      }
      const d = u.days_since_last_activity;
      const colorClass =
        d <= 3  ? "text-success" :
        d <= 30 ? "text-warning" :
                  "text-danger";
      return (
        <span className={`text-xs font-medium ${colorClass}`}>{d}d</span>
      );
    },
  },
];

export default function LifecyclePage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [counts, setCounts] = useState<Counts | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<Bucket>("active");
  const [users, setUsers] = useState<LifecycleUser[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countsAbortRef = useRef<AbortController | null>(null);
  const usersAbortRef = useRef<AbortController | null>(null);

  const fetchCounts = useCallback(async () => {
    countsAbortRef.current?.abort();
    const ctrl = new AbortController();
    countsAbortRef.current = ctrl;
    setLoadingCounts(true);
    setCounts(null);
    setError(null);
    try {
      const r = await fetch(
        `/api/savameta/lifecycle/buckets?segment=${segment}`,
        { signal: ctrl.signal },
      );
      if (!r.ok) throw new Error(`lifecycle/buckets endpoint returned ${r.status}`);
      const res = await r.json();
      if (ctrl.signal.aborted) return;
      setCounts(res.data);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load lifecycle counts");
    } finally {
      if (!ctrl.signal.aborted) setLoadingCounts(false);
    }
  }, [segment]);

  const fetchBucket = useCallback(async (bucket: Bucket) => {
    usersAbortRef.current?.abort();
    const ctrl = new AbortController();
    usersAbortRef.current = ctrl;
    setLoadingUsers(true);
    setUsers([]);
    try {
      const r = await fetch(
        `/api/savameta/lifecycle/buckets?segment=${segment}&bucket=${bucket}`,
        { signal: ctrl.signal },
      );
      if (!r.ok) throw new Error(`lifecycle/buckets endpoint returned ${r.status}`);
      const res = await r.json();
      if (ctrl.signal.aborted) return;
      setUsers(res.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load bucket users");
    } finally {
      if (!ctrl.signal.aborted) setLoadingUsers(false);
    }
  }, [segment]);

  useEffect(() => {
    fetchCounts();
    return () => {
      countsAbortRef.current?.abort();
    };
  }, [fetchCounts]);

  useEffect(() => {
    fetchBucket(selectedBucket);
    return () => {
      usersAbortRef.current?.abort();
    };
  }, [selectedBucket, fetchBucket]);

  const total = counts
    ? counts.active + counts.at_risk + counts.dormant + counts.never_joined
    : 0;

  const chartData = useMemo(() => {
    if (!counts) return [];
    return BUCKET_ORDER
      .map((bucket) => ({
        bucket,
        name: BUCKET_META[bucket].label,
        value: counts[bucket],
        color: bucketColor[bucket],
      }))
      .filter((d) => d.value > 0);
  }, [counts]);

  const isLoading = loadingCounts || loadingUsers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Lifecycle</h1>
          <p className="text-sm text-text-secondary mt-1">
            Active (≤3d) / At-risk (4–30d) / Dormant (&gt;30d) / Never joined.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchCounts();
            fetchBucket(selectedBucket);
          }}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? "Refreshing lifecycle data" : "Refresh lifecycle data"}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
        >
          {isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
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

      {/* Bucket selector stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BUCKET_ORDER.map((bucket) => {
          const tone =
            bucket === "active"       ? "success" :
            bucket === "at_risk"      ? "warning" :
            bucket === "dormant"      ? "danger"  : "default";
          const isSelected = selectedBucket === bucket;
          return (
            <button
              key={bucket}
              type="button"
              onClick={() => setSelectedBucket(bucket)}
              aria-pressed={isSelected}
              className={`text-left transition-all ${
                isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-surface rounded-lg" : ""
              }`}
            >
              <StatCard
                label={BUCKET_META[bucket].label}
                value={counts ? fmtInt(counts[bucket]) : "—"}
                hint={BUCKET_META[bucket].hint}
                tone={tone}
                loading={loadingCounts && counts === null}
              />
            </button>
          );
        })}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <section className="bg-surface border border-border-default rounded-lg p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Distribution</h2>
          <p className="text-xs text-text-muted mb-4">Click a slice or card above to drill in.</p>
          <div className="relative h-64">
            {loadingCounts && chartData.length === 0 ? (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 flex items-center justify-center text-text-secondary text-sm gap-2"
              >
                <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                Loading…
              </div>
            ) : chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
                No data
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      onClick={(d: { bucket?: Bucket }) => {
                        if (d?.bucket) setSelectedBucket(d.bucket);
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.bucket}
                          fill={entry.color}
                          stroke={selectedBucket === entry.bucket ? "#fff" : "transparent"}
                          strokeWidth={selectedBucket === entry.bucket ? 2 : 0}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [
                        `${value} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                        "Users",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center total overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-semibold text-text-primary">{total}</span>
                  <span className="text-xs text-text-secondary">total</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Users table */}
        <section className="lg:col-span-2 bg-surface border border-border-default rounded-lg">
          <div className="p-4 border-b border-border-default flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {BUCKET_META[selectedBucket].label} ({users.length})
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {BUCKET_META[selectedBucket].hint}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `lifecycle-${segment}-${selectedBucket}-${new Date().toISOString().slice(0, 10)}.csv`,
                  users as unknown as Record<string, unknown>[],
                )
              }
              className="text-xs text-primary hover:text-primary/80"
            >
              Export CSV
            </button>
          </div>

          {/* Loading banner above table */}
          {loadingUsers && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 text-text-secondary text-xs bg-surface border-b border-border-default px-3 py-2"
            >
              <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          )}

          <ResponsiveTable
            columns={lifecycleCols}
            rows={users}
            rowKey={(u) => u.email}
            emptyState={
              <div className="px-4 py-10 text-center text-text-secondary text-sm">
                No users in this bucket
              </div>
            }
          />
        </section>
      </div>
    </div>
  );
}
