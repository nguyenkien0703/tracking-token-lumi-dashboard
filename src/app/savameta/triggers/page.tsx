"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/savameta/StatCard";
import SegmentTabs from "@/components/SegmentTabs";
import type { Segment } from "@/lib/segment";

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
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TriggersPage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [activeTab, setActiveTab] = useState<Tab>("returning");
  const [windowDays, setWindowDays] = useState(1);
  const [returning, setReturning] = useState<ReturningUser[]>([]);
  const [firstValue, setFirstValue] = useState<FirstValueUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReturning = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/savameta/triggers/returning?window=${windowDays}&segment=${segment}`).then((r) => r.json());
      setReturning(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [windowDays, segment]);

  const fetchFirstValue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/savameta/triggers/first-value?segment=${segment}`).then((r) => r.json());
      setFirstValue(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [segment]);

  useEffect(() => {
    if (activeTab === "returning") fetchReturning();
    if (activeTab === "first-value") fetchFirstValue();
  }, [activeTab, fetchReturning, fetchFirstValue]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Triggers</h1>
        <p className="text-sm text-slate-400 mt-1">
          Detect events for BA follow-up. Export CSV để gửi outreach.
        </p>
      </div>

      <SegmentTabs value={segment} onChange={setSegment} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={() => setActiveTab("returning")} className="text-left">
          <StatCard
            label="Returning Users"
            value={activeTab === "returning" ? returning.length : "—"}
            hint={`idle ≥7d → active in ${windowDays === 1 ? "24h" : `${windowDays}d`}`}
            tone={activeTab === "returning" ? "success" : "default"}
          />
        </button>
        <button onClick={() => setActiveTab("first-value")} className="text-left">
          <StatCard
            label="First Value"
            value={activeTab === "first-value" ? firstValue.length : "—"}
            hint="reached ≥5 turns in a session"
            tone={activeTab === "first-value" ? "success" : "default"}
          />
        </button>
        <button onClick={() => setActiveTab("first-resolution")} className="text-left">
          <StatCard
            label="First Resolution"
            value="—"
            hint="BA chưa define"
            tone="warning"
          />
        </button>
      </div>

      <section className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="border-b border-slate-700 flex flex-wrap items-center">
          <button
            onClick={() => setActiveTab("returning")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "returning"
                ? "border-indigo-500 text-slate-100"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Returning
          </button>
          <button
            onClick={() => setActiveTab("first-value")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "first-value"
                ? "border-indigo-500 text-slate-100"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            First Value
          </button>
          <button
            onClick={() => setActiveTab("first-resolution")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "first-resolution"
                ? "border-indigo-500 text-slate-100"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            First Resolution
          </button>

          <div className="ml-auto flex items-center gap-2 mr-4">
            {activeTab === "returning" && (
              <div className="flex bg-slate-900 border border-slate-700 rounded text-xs">
                {RETURNING_WINDOWS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setWindowDays(w.value)}
                    className={`px-2 py-1 transition-colors ${
                      windowDays === w.value
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}
            {(activeTab === "returning" || activeTab === "first-value") && (
              <button
                onClick={() => {
                  const rows = activeTab === "returning" ? returning : firstValue;
                  const name = activeTab === "returning"
                    ? `returning-${segment}-${windowDays}d-${new Date().toISOString().slice(0, 10)}.csv`
                    : `first-value-${segment}-${new Date().toISOString().slice(0, 10)}.csv`;
                  downloadCsv(name, rows as unknown as Record<string, unknown>[]);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "returning" && (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Previous Active</th>
                  <th className="text-left px-4 py-2">Returned At</th>
                  <th className="text-right px-4 py-2">Idle Days</th>
                </tr>
              </thead>
              <tbody>
                {returning.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      {loading ? "Loading..." : "No returning users in this window"}
                    </td>
                  </tr>
                ) : (
                  returning.map((u) => (
                    <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-200">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">{u.display_name ?? u.full_name ?? "-"}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{fmtDateTime(u.previous_active_at)}</td>
                      <td className="px-4 py-2 text-emerald-400 text-xs font-medium">{fmtDateTime(u.returned_at)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-xs font-medium text-amber-400">{u.idle_days}d</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "first-value" && (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">First Value At</th>
                  <th className="text-left px-4 py-2">Session</th>
                  <th className="text-right px-4 py-2">Turns</th>
                </tr>
              </thead>
              <tbody>
                {firstValue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      {loading ? "Loading..." : "No users have reached first value yet"}
                    </td>
                  </tr>
                ) : (
                  firstValue.map((u) => (
                    <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-200">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">{u.display_name ?? u.full_name ?? "-"}</td>
                      <td className="px-4 py-2 text-emerald-400 text-xs font-medium">{fmtDateTime(u.first_value_at)}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs font-mono">{u.session_id.slice(0, 8)}…</td>
                      <td className="px-4 py-2 text-right text-slate-100 font-semibold">{u.turns_at_value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "first-resolution" && (
            <div className="px-4 py-12 text-center space-y-3">
              <div className="inline-block px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
                BA chưa define
              </div>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                BA cần xác định event nào = &ldquo;resolution&rdquo; (ví dụ: user feedback &ldquo;resolved&rdquo;,
                conversation ended với tag, hoặc detect bằng survey response). Khi có spec, mình implement.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
