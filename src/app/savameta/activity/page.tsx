"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import StatCard from "@/components/savameta/StatCard";

type Day = {
  day: string;
  dau: number;
  turns: number;
  new_joiners: number;
};

const RANGES = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

const chartMargin = { top: 5, right: 10, bottom: 5, left: -10 };
const tooltipStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "6px",
  fontSize: "12px",
};
const axisStyle = { fontSize: 11, fill: "#94a3b8" };

function fmtDay(s: string): string {
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ActivityPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/savameta/activity/daily?days=${days}`).then((r) => r.json());
      setData(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totals = useMemo(() => {
    const peakDau = data.reduce((m, d) => Math.max(m, d.dau), 0);
    const totalTurns = data.reduce((s, d) => s + d.turns, 0);
    const totalJoiners = data.reduce((s, d) => s + d.new_joiners, 0);
    const avgDau = data.length > 0 ? data.reduce((s, d) => s + d.dau, 0) / data.length : 0;
    return { peakDau, totalTurns, totalJoiners, avgDau };
  }, [data]);

  const chartData = useMemo(
    () => data.map((d) => ({ ...d, label: fmtDay(d.day) })),
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Activity Trends</h1>
          <p className="text-sm text-slate-400 mt-1">
            Daily active users, turns, and new joiners (Savameta only).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 border border-slate-700 rounded">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  days === r.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded"
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Peak DAU" value={totals.peakDau} hint={`in last ${days}d`} tone="success" />
        <StatCard label="Avg DAU" value={totals.avgDau.toFixed(1)} hint="per day" />
        <StatCard label="Total Turns" value={totals.totalTurns.toLocaleString("en-US")} />
        <StatCard label="New Joiners" value={totals.totalJoiners} tone="success" />
      </div>

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Daily Active Users</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              {loading ? "Loading..." : "No data"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="dau"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="DAU"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Daily Turns</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              {loading ? "Loading..." : "No data"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="turns" fill="#6366f1" name="Turns" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">New Joiners per Day</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              {loading ? "Loading..." : "No data"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="new_joiners" fill="#f59e0b" name="New Joiners" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
