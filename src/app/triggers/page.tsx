"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Hourglass, Loader2, RefreshCw } from "lucide-react";
import type { Segment } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import StatCard from "@/components/StatCard";
import ResponsiveTable, { type Column } from "@/components/ResponsiveTable";
import EmptyState from "@/components/EmptyState";

type Tab = "returning" | "first-value" | "first-resolution";

type ReturningUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  returned_at: string;
  previous_active_at: string;
  idle_days: number;
};

type FirstValueUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  first_value_at: string;
  session_id: string;
  turns_at_value: number;
};

const RETURNING_WINDOWS = [
  { label: "24h", value: 1 },
  { label: "3d", value: 3 },
  { label: "7d", value: 7 },
];

function fmtDateTime(s: string | null): string {
  if (!s) return "-";
  const d = new Date(s);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

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

// Column arrays defined outside component — stable reference, no re-creation on render.
const returningCols: Column<ReturningUser>[] = [
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
    key: "previous_active_at",
    header: "Previous Active",
    mobileHidden: true,
    render: (u) => (
      <span className="text-text-secondary text-xs">{fmtDateTime(u.previous_active_at)}</span>
    ),
  },
  {
    key: "returned_at",
    header: "Returned At",
    render: (u) => (
      <span className="text-success text-xs font-medium">{fmtDateTime(u.returned_at)}</span>
    ),
  },
  {
    key: "idle_days",
    header: "Idle Days",
    align: "right",
    render: (u) => (
      <span className="text-warning text-xs font-medium">{u.idle_days}d</span>
    ),
  },
];

const firstValueCols: Column<FirstValueUser>[] = [
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
    key: "first_value_at",
    header: "First Value At",
    render: (u) => (
      <span className="text-success text-xs font-medium">{fmtDateTime(u.first_value_at)}</span>
    ),
  },
  {
    key: "session_id",
    header: "Session",
    mobileHidden: true,
    render: (u) => (
      <span className="text-text-muted text-xs font-mono">{u.session_id.slice(0, 8)}&hellip;</span>
    ),
  },
  {
    key: "turns_at_value",
    header: "Turns",
    align: "right",
    render: (u) => (
      <span className="text-text-primary font-semibold">{u.turns_at_value}</span>
    ),
  },
];

export default function TriggersPage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [activeTab, setActiveTab] = useState<Tab>("returning");
  const [windowDays, setWindowDays] = useState(1);
  const [returning, setReturning] = useState<ReturningUser[]>([]);
  const [firstValue, setFirstValue] = useState<FirstValueUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returningAbortRef = useRef<AbortController | null>(null);
  const firstValueAbortRef = useRef<AbortController | null>(null);

  const fetchReturning = useCallback(async () => {
    returningAbortRef.current?.abort();
    const ctrl = new AbortController();
    returningAbortRef.current = ctrl;
    setReturning([]);
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/savameta/triggers/returning?window=${windowDays}&segment=${segment}`,
        { signal: ctrl.signal },
      );
      if (!r.ok) throw new Error(`triggers/returning endpoint returned ${r.status}`);
      const res = await r.json();
      if (ctrl.signal.aborted) return;
      setReturning(res.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load returning users");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [windowDays, segment]);

  const fetchFirstValue = useCallback(async () => {
    firstValueAbortRef.current?.abort();
    const ctrl = new AbortController();
    firstValueAbortRef.current = ctrl;
    setFirstValue([]);
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/savameta/triggers/first-value?segment=${segment}`,
        { signal: ctrl.signal },
      );
      if (!r.ok) throw new Error(`triggers/first-value endpoint returned ${r.status}`);
      const res = await r.json();
      if (ctrl.signal.aborted) return;
      setFirstValue(res.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load first-value users");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    if (activeTab === "returning") fetchReturning();
    if (activeTab === "first-value") fetchFirstValue();
    return () => {
      returningAbortRef.current?.abort();
      firstValueAbortRef.current?.abort();
    };
  }, [activeTab, fetchReturning, fetchFirstValue]);

  const handleRefresh = useCallback(() => {
    if (activeTab === "returning") fetchReturning();
    if (activeTab === "first-value") fetchFirstValue();
  }, [activeTab, fetchReturning, fetchFirstValue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Triggers</h1>
          <p className="text-sm text-text-secondary mt-1">
            Detect events for BA follow-up. Export CSV để gửi outreach.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || activeTab === "first-resolution"}
          aria-busy={loading}
          aria-label={loading ? "Refreshing triggers data" : "Refresh triggers data"}
          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
        >
          {loading
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

      {/* 3 selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("returning")}
          aria-current={activeTab === "returning" ? "true" : undefined}
          className={`text-left transition-all ${
            activeTab === "returning"
              ? "ring-2 ring-primary ring-offset-2 ring-offset-surface rounded-xl"
              : ""
          }`}
        >
          <StatCard
            label="Returning Users"
            value={activeTab === "returning" ? returning.length : "—"}
            hint={`idle ≥7d → active in ${windowDays === 1 ? "24h" : `${windowDays}d`}`}
            tone={activeTab === "returning" ? "success" : "default"}
          />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("first-value")}
          aria-current={activeTab === "first-value" ? "true" : undefined}
          className={`text-left transition-all ${
            activeTab === "first-value"
              ? "ring-2 ring-primary ring-offset-2 ring-offset-surface rounded-xl"
              : ""
          }`}
        >
          <StatCard
            label="First Value"
            value={activeTab === "first-value" ? firstValue.length : "—"}
            hint="reached ≥5 turns in a session"
            tone={activeTab === "first-value" ? "success" : "default"}
          />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("first-resolution")}
          aria-current={activeTab === "first-resolution" ? "true" : undefined}
          className={`text-left transition-all ${
            activeTab === "first-resolution"
              ? "ring-2 ring-primary ring-offset-2 ring-offset-surface rounded-xl"
              : ""
          }`}
        >
          <StatCard
            label="First Resolution"
            value="—"
            hint="BA chưa define"
            tone="warning"
          />
        </button>
      </div>

      {/* Tab section */}
      <section className="bg-surface border border-border-default rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-border-default flex flex-wrap items-center">
          <div role="tablist" className="flex">
            <button
              type="button"
              role="tab"
              id="triggers-tab-returning"
              aria-selected={activeTab === "returning"}
              aria-controls="triggers-panel-returning"
              onClick={() => setActiveTab("returning")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "returning"
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              Returning
            </button>
            <button
              type="button"
              role="tab"
              id="triggers-tab-first-value"
              aria-selected={activeTab === "first-value"}
              aria-controls="triggers-panel-first-value"
              onClick={() => setActiveTab("first-value")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "first-value"
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              First Value
            </button>
            <button
              type="button"
              role="tab"
              id="triggers-tab-first-resolution"
              aria-selected={activeTab === "first-resolution"}
              aria-controls="triggers-panel-first-resolution"
              onClick={() => setActiveTab("first-resolution")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "first-resolution"
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              First Resolution
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 mr-4">
            {activeTab === "returning" && (
              <div className="flex bg-surface-2 border border-border-default rounded text-xs">
                {RETURNING_WINDOWS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    aria-pressed={windowDays === w.value}
                    onClick={() => setWindowDays(w.value)}
                    className={`px-2 py-1 transition-colors ${
                      windowDays === w.value
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}
            {(activeTab === "returning" || activeTab === "first-value") && (
              <button
                type="button"
                onClick={() => {
                  const rows = activeTab === "returning" ? returning : firstValue;
                  const name =
                    activeTab === "returning"
                      ? `returning-${segment}-${windowDays}d-${new Date().toISOString().slice(0, 10)}.csv`
                      : `first-value-${segment}-${new Date().toISOString().slice(0, 10)}.csv`;
                  downloadCsv(name, rows as unknown as Record<string, unknown>[]);
                }}
                className="text-xs text-primary hover:text-primary/80"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Loading banner */}
        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-text-secondary text-xs bg-surface border-b border-border-default px-3 py-2"
          >
            <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
            Loading&hellip;
          </div>
        )}

        {/* Tab content */}
        {activeTab === "returning" && (
          <div role="tabpanel" id="triggers-panel-returning" aria-labelledby="triggers-tab-returning">
            <ResponsiveTable
              columns={returningCols}
              rows={returning}
              rowKey={(u) => u.email}
              emptyState={
                <div className="px-4 py-10 text-center text-text-secondary text-sm">
                  No returning users in this window
                </div>
              }
            />
          </div>
        )}

        {activeTab === "first-value" && (
          <div role="tabpanel" id="triggers-panel-first-value" aria-labelledby="triggers-tab-first-value">
            <ResponsiveTable
              columns={firstValueCols}
              rows={firstValue}
              rowKey={(u) => u.email}
              emptyState={
                <div className="px-4 py-10 text-center text-text-secondary text-sm">
                  No users have reached first value yet
                </div>
              }
            />
          </div>
        )}

        {activeTab === "first-resolution" && (
          <div role="tabpanel" id="triggers-panel-first-resolution" aria-labelledby="triggers-tab-first-resolution">
            <div className="p-6">
              <EmptyState
                icon={<Hourglass className="w-5 h-5" />}
                title="First Resolution not yet defined"
                description="BA cần xác định event nào = resolution (ví dụ: user feedback resolved, conversation ended với tag, hoặc detect bằng survey response). Khi có spec, mình implement."
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
