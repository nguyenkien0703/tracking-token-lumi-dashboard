"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import StatCard from "@/components/savameta/StatCard";
import { downloadCsv } from "@/lib/csv";

function deptSlug(key: string): string {
  return key.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "") || "unnamed";
}

function groupByDept<T extends { department: string | null }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.department ?? "__unassigned__";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries())
    .map(([key, entries]) => ({ key, label: key === "__unassigned__" ? "Unassigned" : key, entries }))
    .sort((a, b) => {
      if (a.key === "__unassigned__") return 1;
      if (b.key === "__unassigned__") return -1;
      return a.label.localeCompare(b.label);
    });
}

type Summary = {
  totalEligible: number;
  joined: number;
  notJoined: number;
  adoptionRate: number;
  dailyActive7d: number;
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

type ReleaseJoiners = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  new_joiners: number;
  days_active: number;
  velocity: number;
};

export default function AdoptionPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [joined, setJoined] = useState<JoinedUser[]>([]);
  const [neverJoined, setNeverJoined] = useState<NeverJoinedUser[]>([]);
  const [byRelease, setByRelease] = useState<ReleaseJoiners[]>([]);
  const [activeTab, setActiveTab] = useState<"joined" | "never">("joined");
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const groupedNever = useMemo(() => groupByDept(neverJoined), [neverJoined]);
  const groupedJoined = useMemo(() => groupByDept(joined), [joined]);

  const toggleDept = (key: string) =>
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const expandAll  = (groups: { key: string }[]) => setExpandedDepts(new Set(groups.map((g) => g.key)));
  const collapseAll = () => setExpandedDepts(new Set());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, j, n, r] = await Promise.all([
        fetch("/api/savameta/adoption/summary").then((r) => r.json()),
        fetch("/api/savameta/adoption/joined").then((r) => r.json()),
        fetch("/api/savameta/adoption/never-joined").then((r) => r.json()),
        fetch("/api/savameta/adoption/by-release").then((r) => r.json()),
      ]);
      setSummary(s.data);
      setJoined(j.data ?? []);
      setNeverJoined(n.data ?? []);
      setByRelease(r.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Adoption</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track who joined / not / when. Source: roster + history_entries.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Eligible" value={summary?.totalEligible ?? "—"} hint="from roster" />
        <StatCard label="Joined" value={summary?.joined ?? "—"} tone="success" />
        <StatCard
          label="Adoption Rate"
          value={summary ? `${(summary.adoptionRate * 100).toFixed(0)}%` : "—"}
          tone="success"
        />
        <StatCard
          label="Daily Active (7/7d)"
          value={summary?.dailyActive7d ?? "—"}
          hint="active every day in last 7"
          tone="success"
        />
        <StatCard label="Never Joined" value={summary?.notJoined ?? "—"} tone="warning" />
      </div>

      {/* By Release */}
      <section className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">New Joiners by Release</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            User được count vào release đầu tiên match `first_seen_at` trong window.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-2">Release</th>
                <th className="text-left px-4 py-2">Window</th>
                <th className="text-right px-4 py-2">New Joiners</th>
                <th className="text-right px-4 py-2">Days Active</th>
                <th className="text-right px-4 py-2">Velocity (joiners/day)</th>
              </tr>
            </thead>
            <tbody>
              {byRelease.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">{loading ? "Loading..." : "No releases defined yet — add in Settings → Releases"}</td></tr>
              ) : (
                byRelease.map((r) => (
                  <tr key={r.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-2 text-slate-200 font-medium">{r.name}</td>
                    <td className="px-4 py-2 text-slate-300">
                      {r.start_date} → {r.end_date ?? <span className="text-emerald-400">ongoing</span>}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-100 font-semibold">{r.new_joiners}</td>
                    <td className="px-4 py-2 text-right text-slate-400">{r.days_active}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{r.velocity.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="border-b border-slate-700 flex items-center justify-between">
          <div className="flex">
            <button
              onClick={() => setActiveTab("joined")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "joined"
                  ? "border-indigo-500 text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Joined ({joined.length})
            </button>
            <button
              onClick={() => setActiveTab("never")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "never"
                  ? "border-indigo-500 text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Never Joined ({neverJoined.length})
            </button>
          </div>
          <button
            onClick={() => {
              if (activeTab === "joined") {
                downloadCsv(`joined-users-${new Date().toISOString().slice(0, 10)}.csv`, joined as unknown as Record<string, unknown>[]);
              } else {
                downloadCsv(`never-joined-users-${new Date().toISOString().slice(0, 10)}.csv`, neverJoined as unknown as Record<string, unknown>[]);
              }
            }}
            className="mr-4 text-xs text-indigo-400 hover:text-indigo-300"
          >
            Export CSV
          </button>
        </div>

        {activeTab === "joined" ? (
          <DeptAccordion
            groups={groupedJoined}
            loading={loading}
            expandedDepts={expandedDepts}
            toggleDept={toggleDept}
            expandAll={() => expandAll(groupedJoined)}
            collapseAll={collapseAll}
            emptyMessage="No joined users yet"
            renderRows={(entries) => entries.map((u) => (
              <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-2 text-slate-200 text-sm">{u.email}</td>
                <td className="px-4 py-2 text-slate-300 text-sm">{u.display_name ?? u.full_name ?? "-"}</td>
                <td className="px-4 py-2 text-slate-400 text-xs">{u.first_seen_at ? new Date(u.first_seen_at).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2 text-slate-400 text-xs">{u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2 text-right">
                  {u.days_since_last_activity === null ? (
                    <span className="text-slate-500 text-xs">—</span>
                  ) : (
                    <span className={`text-xs font-medium ${
                      u.days_since_last_activity <= 7 ? "text-emerald-400"
                      : u.days_since_last_activity <= 30 ? "text-amber-400"
                      : "text-red-400"
                    }`}>{u.days_since_last_activity}d</span>
                  )}
                </td>
              </tr>
            ))}
            headers={["Email", "Name", "First Seen", "Last Active", "Days Idle"]}
            headerAligns={["left", "left", "left", "left", "right"]}
          />
        ) : (
          <DeptAccordion
            groups={groupedNever}
            loading={loading}
            expandedDepts={expandedDepts}
            toggleDept={toggleDept}
            expandAll={() => expandAll(groupedNever)}
            collapseAll={collapseAll}
            emptyMessage="Everyone in roster has joined"
            renderRows={(entries) => entries.map((u) => (
              <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-2 text-slate-200 text-sm">{u.email}</td>
                <td className="px-4 py-2 text-slate-300 text-sm">{u.full_name ?? "-"}</td>
                <td className="px-4 py-2 text-slate-400 text-xs">{new Date(u.added_at).toLocaleDateString()}</td>
              </tr>
            ))}
            headers={["Email", "Name", "Added At"]}
            headerAligns={["left", "left", "left"]}
          />
        )}
      </section>
    </div>
  );
}

type DeptAccordionProps<T extends { department: string | null }> = {
  groups: { key: string; label: string; entries: T[] }[];
  loading: boolean;
  expandedDepts: Set<string>;
  toggleDept: (key: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  emptyMessage: string;
  renderRows: (entries: T[]) => React.ReactNode;
  headers: string[];
  headerAligns: ("left" | "right")[];
};

function DeptAccordion<T extends { department: string | null }>({
  groups, loading, expandedDepts, toggleDept, expandAll, collapseAll,
  emptyMessage, renderRows, headers, headerAligns,
}: DeptAccordionProps<T>) {
  if (loading && groups.length === 0) {
    return <div className="px-4 py-8 text-center text-slate-500 text-sm">Loading...</div>;
  }
  if (groups.length === 0) {
    return <div className="px-4 py-8 text-center text-slate-500 text-sm">{emptyMessage}</div>;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xs text-slate-400">
          {groups.reduce((s, g) => s + g.entries.length, 0)} members · {groups.length} departments
        </span>
        <button type="button" onClick={expandAll} className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto">
          Expand all
        </button>
        <button type="button" onClick={collapseAll} className="text-xs text-indigo-400 hover:text-indigo-300">
          Collapse all
        </button>
      </div>

      <div className="divide-y divide-slate-700">
        {groups.map((group) => {
          const isExpanded = expandedDepts.has(group.key);
          const slug = deptSlug(group.key);
          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => toggleDept(group.key)}
                aria-expanded={isExpanded}
                aria-controls={`adopt-dept-${slug}`}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-700/40 transition-colors text-left"
              >
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                <span className="text-slate-200 text-sm font-medium">{group.label}</span>
                <span className="bg-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded">
                  {group.entries.length}
                </span>
              </button>
              {isExpanded && (
                <div id={`adopt-dept-${slug}`} className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-slate-400 uppercase border-b border-slate-700 bg-slate-800/60">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={h} className={`px-4 py-2 text-${headerAligns[i]}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>{renderRows(group.entries)}</tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
