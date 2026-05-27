"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Segment } from "@/lib/segment";
import SegmentTabs from "@/components/SegmentTabs";
import StatCard from "@/components/StatCard";

// Hex equivalents of design tokens — recharts can't read CSS vars at SSR.
const CHART_COLORS = {
  primary:   "#6366f1",  // indigo-500 (matches --color-primary)
  success:   "#10b981",  // emerald-500 (matches --color-success)
  warning:   "#f59e0b",  // amber-500 (matches --color-warning)
  grid:      "#334155",  // slate-700-ish, used for grid lines
  axis:      "#94a3b8",  // slate-400-ish, used for axis labels
  tooltipBg: "#1e293b",  // slate-800-ish
  tooltipBd: "#334155",
} as const;

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
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBd}`,
  borderRadius: "6px",
  fontSize: "12px",
};
const axisStyle = { fontSize: 11, fill: CHART_COLORS.axis };

function fmtDay(s: string): string {
  const d = new Date(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ActivityPage() {
  const [segment, setSegment] = useState<Segment>("savameta");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setData([]);
    setError(null);
    try {
      const r = await fetch(
        `/api/savameta/activity/daily?days=${days}&segment=${segment}`,
        { signal: ctrl.signal },
      );
      if (!r.ok) throw new Error(`activity endpoint returned ${r.status}`);
      const res = await r.json();
      if (ctrl.signal.aborted) return;
      setData(res.data ?? []);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load activity data");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [days, segment]);

  useEffect(() => {
    fetchData();
    return () => { abortRef.current?.abort(); };
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
    [data],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Activity Trends</h1>
          <p className="text-sm text-text-secondary mt-1">
            Daily active users, turns, and new joiners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface border border-border-default rounded-lg overflow-hidden inline-flex">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                aria-pressed={days === r.value}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  days === r.value
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? "Refreshing activity data" : "Refresh activity data"}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>

      <SegmentTabs value={segment} onChange={setSegment} />

      {error && (
        <div className="bg-danger/10 border border-danger/40 text-danger text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Peak DAU" value={totals.peakDau} hint={`in last ${days}d`} tone="success" />
        <StatCard label="Avg DAU" value={totals.avgDau.toFixed(1)} hint="per day" />
        <StatCard label="Total Turns" value={totals.totalTurns.toLocaleString("en-US")} />
        <StatCard label="New Joiners" value={totals.totalJoiners} tone="success" />
      </div>

      <section className="bg-surface border border-border-default rounded-lg p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Daily Active Users</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            loading ? (
              <div role="status" aria-live="polite" className="h-full flex items-center justify-center text-text-secondary text-sm gap-2">
                <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                Loading…
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                No data for the selected range
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="dau"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="DAU"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-surface border border-border-default rounded-lg p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Daily Turns</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            loading ? (
              <div role="status" aria-live="polite" className="h-full flex items-center justify-center text-text-secondary text-sm gap-2">
                <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                Loading…
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                No data for the selected range
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="turns" fill={CHART_COLORS.primary} name="Turns" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="bg-surface border border-border-default rounded-lg p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">New Joiners per Day</h2>
        <div className="h-56">
          {chartData.length === 0 ? (
            loading ? (
              <div role="status" aria-live="polite" className="h-full flex items-center justify-center text-text-secondary text-sm gap-2">
                <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                Loading…
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                No data for the selected range
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="label" style={axisStyle} />
                <YAxis allowDecimals={false} style={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="new_joiners" fill={CHART_COLORS.warning} name="New Joiners" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
