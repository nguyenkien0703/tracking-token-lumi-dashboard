"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/savameta/StatCard";
import SegmentTabs, { type Segment } from "@/components/savameta/SegmentTabs";

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

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}
function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

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

export default function EngagementPage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        fetch(`/api/savameta/engagement/summary?segment=${segment}`).then((r) => r.json()),
        fetch(`/api/savameta/engagement/by-user?segment=${segment}`).then((r) => r.json()),
      ]);
      setSummary(s.data);
      setUsers(u.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Engagement</h1>
          <p className="text-sm text-slate-400 mt-1">
            Conversations, turns, token usage, cost per daily-active user.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <SegmentTabs value={segment} onChange={setSegment} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Conversations"
          value={summary ? fmtNum(summary.conversations) : "—"}
          hint="distinct sessions"
        />
        <StatCard
          label="Total Turns"
          value={summary ? fmtNum(summary.totalTurns) : "—"}
          hint="all history entries"
        />
        <StatCard
          label="Median Turns/Convo"
          value={summary ? summary.medianTurnsPerConvo.toFixed(1) : "—"}
          tone="success"
        />
        <StatCard
          label="Total Cost"
          value={summary ? fmtUsd(summary.totalCostUsd) : "—"}
          tone="warning"
        />
        <StatCard
          label="Cost / Daily Active User (7/7d)"
          value={summary ? fmtUsd(summary.costPerDailyActiveUser7d) : "—"}
          hint={summary ? `${summary.dailyActive7d} daily active` : ""}
          tone="warning"
        />
      </div>

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Token Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Prompt Tokens"
            value={summary ? fmtNum(summary.totalPromptTokens) : "—"}
          />
          <StatCard
            label="Completion Tokens"
            value={summary ? fmtNum(summary.totalCompletionTokens) : "—"}
          />
          <StatCard
            label="Cache Read Tokens"
            value={summary ? fmtNum(summary.totalCacheReadTokens) : "—"}
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

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-200">Quality Metrics</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            BA chưa define
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard label="Median TTV" value="—" hint="Time to first value" />
          <StatCard label="Median TTR" value="—" hint="Time to resolution" />
          <StatCard label="Resolution Rate" value="—" hint="% resolved" />
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Per-User Engagement ({users.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sorted by cost descending.</p>
          </div>
          <button
            onClick={() =>
              downloadCsv(
                `engagement-${segment}-by-user-${new Date().toISOString().slice(0, 10)}.csv`,
                users as unknown as Record<string, unknown>[],
              )
            }
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-right px-4 py-2">Convos</th>
                <th className="text-right px-4 py-2">Turns</th>
                <th className="text-right px-4 py-2">Tokens</th>
                <th className="text-right px-4 py-2">Cost (USD)</th>
                <th className="text-left px-4 py-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    {loading ? "Loading..." : "No engagement data yet"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-2 text-slate-200">{u.email}</td>
                    <td className="px-4 py-2 text-slate-300">{u.display_name ?? u.full_name ?? "-"}</td>
                    <td className="px-4 py-2 text-right text-slate-100 font-medium">{fmtNum(u.conversations)}</td>
                    <td className="px-4 py-2 text-right text-slate-100">{fmtNum(u.turns)}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{fmtNum(u.total_tokens)}</td>
                    <td className="px-4 py-2 text-right text-amber-400 font-medium">{fmtUsd(u.total_cost_usd)}</td>
                    <td className="px-4 py-2 text-slate-400 text-xs">
                      {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
