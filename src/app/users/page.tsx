"use client";
import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Segment, SEGMENT_LABELS } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import PeriodChip, { type PeriodValue } from "@/components/PeriodChip";
import ResponsiveTable, { type Column } from "@/components/ResponsiveTable";
import UserSearch from "@/components/UserSearch";

type SubTab = "top" | "joined" | "never";

type TopUser = {
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
};

type JoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  user_id: number;
  display_name: string | null;
  first_seen_at: string | null;
  last_active_at: string | null;
  days_since_last_activity: number | null;
};

type NeverJoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  added_at: string;
};

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
    default: { const _e: never = p.period; void _e; return {}; }
  }
}

function fmtInt(n: number): string { return n.toLocaleString(); }
function fmtUsd(n: number): string { return `$${n.toFixed(4)}`; }

function displayNameOf(u: { firstName?: string | null; lastName?: string | null; userName?: string | null; email?: string | null; userId?: number }) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName || u.email || (u.userId ? `#${u.userId}` : "—");
}

function subTabLabel(t: SubTab, seg: Segment): string {
  if (seg !== "savameta") return "Top usage";
  return t === "top" ? "Top usage" : t === "joined" ? "Joined" : "Never joined";
}

const topCols: Column<TopUser>[] = [
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
      const name = displayNameOf(u);
      const initials = u.firstName?.[0] ?? u.lastName?.[0] ?? u.userName?.[0] ?? "#";
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
              {name}
            </p>
            {u.email && u.email !== name && (
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

const joinedCols: Column<JoinedUser>[] = [
  {
    key: "email",
    header: "Email",
    primary: true,
    render: (u) => <span className="text-sm">{u.email}</span>,
  },
  {
    key: "full_name",
    header: "Name",
    align: "left",
    render: (u) => <span>{u.full_name ?? "—"}</span>,
  },
  {
    key: "department",
    header: "Department",
    align: "left",
    mobileHidden: true,
    render: (u) => <span>{u.department ?? "—"}</span>,
  },
  {
    key: "last_active_at",
    header: "Last Active",
    align: "right",
    render: (u) =>
      u.last_active_at
        ? <span>{new Date(u.last_active_at).toLocaleDateString()}</span>
        : <span>Never</span>,
  },
  {
    key: "days_since_last_activity",
    header: "Idle",
    align: "right",
    mobileHidden: true,
    render: (u) => (
      <span>{u.days_since_last_activity != null ? `${u.days_since_last_activity}d ago` : "—"}</span>
    ),
  },
];

const neverCols: Column<NeverJoinedUser>[] = [
  {
    key: "email",
    header: "Email",
    primary: true,
    render: (u) => <span className="text-sm">{u.email}</span>,
  },
  {
    key: "full_name",
    header: "Name",
    align: "left",
    render: (u) => <span>{u.full_name ?? "—"}</span>,
  },
  {
    key: "department",
    header: "Department",
    align: "left",
    mobileHidden: true,
    render: (u) => <span>{u.department ?? "—"}</span>,
  },
  {
    key: "added_at",
    header: "Added",
    align: "right",
    render: (u) => <span>{new Date(u.added_at).toLocaleDateString()}</span>,
  },
];

export default function UsersPage() {
  const [segment, setSegment] = useState<Segment>("all");
  const [period, setPeriod] = useState<PeriodValue>({ period: "30d" });
  const [subTab, setSubTab] = useState<SubTab>("top");
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [joinedUsers, setJoinedUsers] = useState<JoinedUser[]>([]);
  const [neverJoined, setNeverJoined] = useState<NeverJoinedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (segment !== "savameta" && subTab !== "top") setSubTab("top");
  }, [segment, subTab]);

  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      if (subTab === "top") {
        const sp = new URLSearchParams({ segment, limit: "100" });
        const { from, to } = derivePeriod(period);
        if (from) sp.set("from", from);
        if (to) sp.set("to", to);
        const r = await fetch(`/api/admin/top-users?${sp}`, { signal: ctrl.signal });
        const j = await r.json();
        if (ctrl.signal.aborted) return;
        if (!j?.success) throw new Error(j?.error || "Failed to load top users");
        setTopUsers(j.data?.users ?? []);
      } else if (subTab === "joined") {
        const r = await fetch(`/api/savameta/adoption/joined`, { signal: ctrl.signal });
        const j = await r.json();
        if (ctrl.signal.aborted) return;
        setJoinedUsers(Array.isArray(j?.data) ? j.data : []);
      } else if (subTab === "never") {
        const r = await fetch(`/api/savameta/adoption/never-joined`, { signal: ctrl.signal });
        const j = await r.json();
        if (ctrl.signal.aborted) return;
        setNeverJoined(Array.isArray(j?.data) ? j.data : []);
      }
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [segment, period, subTab]);

  useEffect(() => {
    loadData();
    return () => { abortRef.current?.abort(); };
  }, [loadData]);

  const loadingState: ReactNode = loading ? (
    <div className="px-4 py-10 text-center text-text-secondary text-sm">Loading…</div>
  ) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {SEGMENT_LABELS[segment].label} · {subTabLabel(subTab, segment)}
          </p>
        </div>
        <PeriodChip value={period} onChange={setPeriod} />
      </div>

      {/* Segment + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentTabs value={segment} onChange={setSegment} />
        <UserSearch />
      </div>

      {/* Sub-tabs — only when savameta */}
      {segment === "savameta" && (
        <div className="inline-flex bg-surface border border-border-default rounded-lg overflow-hidden">
          {(["top", "joined", "never"] as SubTab[]).map((t) => {
            const active = t === subTab;
            const label = t === "top" ? "Top usage" : t === "joined" ? "Joined" : "Never joined";
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSubTab(t)}
                aria-pressed={active}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table area */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        {subTab === "top" && (
          <ResponsiveTable
            columns={topCols}
            rows={topUsers}
            rowKey={(u) => u.userId}
            emptyState={loadingState}
          />
        )}
        {subTab === "joined" && (
          <ResponsiveTable
            columns={joinedCols}
            rows={joinedUsers}
            rowKey={(u) => u.user_id}
            emptyState={loadingState}
          />
        )}
        {subTab === "never" && (
          <ResponsiveTable
            columns={neverCols}
            rows={neverJoined}
            rowKey={(u) => u.email}
            emptyState={loadingState}
          />
        )}
      </div>
    </div>
  );
}
