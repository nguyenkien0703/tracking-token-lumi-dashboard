"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/savameta/StatCard";

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

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdoptionPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [joined, setJoined] = useState<JoinedUser[]>([]);
  const [neverJoined, setNeverJoined] = useState<NeverJoinedUser[]>([]);
  const [byRelease, setByRelease] = useState<ReleaseJoiners[]>([]);
  const [activeTab, setActiveTab] = useState<"joined" | "never">("joined");
  const [loading, setLoading] = useState(true);

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

        <div className="overflow-x-auto">
          {activeTab === "joined" ? (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Department</th>
                  <th className="text-left px-4 py-2">First Seen</th>
                  <th className="text-left px-4 py-2">Last Active</th>
                  <th className="text-right px-4 py-2">Days Idle</th>
                </tr>
              </thead>
              <tbody>
                {joined.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">{loading ? "Loading..." : "No joined users yet"}</td></tr>
                ) : (
                  joined.map((u) => (
                    <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-200">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">{u.display_name ?? u.full_name ?? "-"}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{u.department ?? "-"}</td>
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
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Department</th>
                  <th className="text-left px-4 py-2">Added at</th>
                </tr>
              </thead>
              <tbody>
                {neverJoined.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">{loading ? "Loading..." : "Everyone in roster has joined 🎉"}</td></tr>
                ) : (
                  neverJoined.map((u) => (
                    <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-200">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">{u.full_name ?? "-"}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{u.department ?? "-"}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{new Date(u.added_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
