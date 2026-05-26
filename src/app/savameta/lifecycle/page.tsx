"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "@/components/savameta/StatCard";
import SegmentTabs from "@/components/SegmentTabs";
import type { Segment } from "@/lib/segment";

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

const BUCKET_META: Record<Bucket, { label: string; color: string; hint: string }> = {
  active: { label: "Active", color: "#10b981", hint: "≤ 3 days" },
  at_risk: { label: "At Risk", color: "#f59e0b", hint: "4–30 days" },
  dormant: { label: "Dormant", color: "#ef4444", hint: "> 30 days" },
  never_joined: { label: "Never Joined", color: "#64748b", hint: "no activity" },
};

const BUCKET_ORDER: Bucket[] = ["active", "at_risk", "dormant", "never_joined"];

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

export default function LifecyclePage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [counts, setCounts] = useState<Counts | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<Bucket>("active");
  const [users, setUsers] = useState<LifecycleUser[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const res = await fetch(`/api/savameta/lifecycle/buckets?segment=${segment}`).then((r) => r.json());
      setCounts(res.data);
    } finally {
      setLoadingCounts(false);
    }
  }, [segment]);

  const fetchBucket = useCallback(async (bucket: Bucket) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/savameta/lifecycle/buckets?segment=${segment}&bucket=${bucket}`).then((r) => r.json());
      setUsers(res.data ?? []);
    } finally {
      setLoadingUsers(false);
    }
  }, [segment]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchBucket(selectedBucket);
  }, [selectedBucket, fetchBucket]);

  const total = counts ? counts.active + counts.at_risk + counts.dormant + counts.never_joined : 0;

  const chartData = useMemo(() => {
    if (!counts) return [];
    return BUCKET_ORDER
      .map((bucket) => ({
        bucket,
        name: BUCKET_META[bucket].label,
        value: counts[bucket],
        color: BUCKET_META[bucket].color,
      }))
      .filter((d) => d.value > 0);
  }, [counts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Lifecycle</h1>
          <p className="text-sm text-slate-400 mt-1">
            Active (≤3d) / At-risk (4–30d) / Dormant (&gt;30d) / Never joined.
          </p>
        </div>
        <button
          onClick={() => {
            fetchCounts();
            fetchBucket(selectedBucket);
          }}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded"
        >
          {loadingCounts ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <SegmentTabs value={segment} onChange={setSegment} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BUCKET_ORDER.map((bucket) => {
          const tone =
            bucket === "active" ? "success" :
            bucket === "at_risk" ? "warning" :
            bucket === "dormant" ? "danger" : "default";
          return (
            <button
              key={bucket}
              onClick={() => setSelectedBucket(bucket)}
              className={`text-left transition-all ${selectedBucket === bucket ? "ring-2 ring-indigo-500 rounded-lg" : ""}`}
            >
              <StatCard
                label={BUCKET_META[bucket].label}
                value={counts ? counts[bucket] : "—"}
                hint={BUCKET_META[bucket].hint}
                tone={tone}
              />
            </button>
          );
        })}
      </div>

      {/* Chart + Bucket list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Click a slice or card above to drill in.</p>
          <div className="relative h-64">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                {loadingCounts ? "Loading..." : "No data"}
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
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                        "Users",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-semibold text-slate-100">{total}</span>
                  <span className="text-xs text-slate-400">total</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                {BUCKET_META[selectedBucket].label} ({users.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{BUCKET_META[selectedBucket].hint}</p>
            </div>
            <button
              onClick={() =>
                downloadCsv(
                  `lifecycle-${segment}-${selectedBucket}-${new Date().toISOString().slice(0, 10)}.csv`,
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
                  <th className="text-left px-4 py-2">Last Active</th>
                  <th className="text-right px-4 py-2">Days Idle</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      {loadingUsers ? "Loading..." : "No users in this bucket"}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.email} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-200">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">{u.display_name ?? u.full_name ?? "-"}</td>
                      <td className="px-4 py-2 text-slate-400 text-xs">
                        {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {u.days_since_last_activity === null ? (
                          <span className="text-slate-500 text-xs">—</span>
                        ) : (
                          <span
                            className={`text-xs font-medium ${
                              u.days_since_last_activity <= 7
                                ? "text-emerald-400"
                                : u.days_since_last_activity <= 30
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {u.days_since_last_activity}d
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
