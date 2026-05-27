"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DailyEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: DailyEntry[];
}

function formatTokens(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return String(val);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border-default rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "totalTokens"
            ? `${formatTokens(p.value)} tokens`
            : `$${p.value.toFixed(4)}`}
        </p>
      ))}
    </div>
  );
}

export default function TokenLineChart({ entries }: Props) {
  const data = entries.map((e) => ({
    ...e,
    label: format(parseISO(e.date), "MM/dd"),
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="tokens"
          orientation="left"
          tickFormatter={formatTokens}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <YAxis
          yAxisId="cost"
          orientation="right"
          tickFormatter={(v) => `$${v.toFixed(2)}`}
          tick={{ fontSize: 10, fill: "#10B981" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)", paddingBottom: 4 }}
          formatter={(val) => val === "totalTokens" ? "Total Tokens" : "Cost USD"}
        />
        <Line
          yAxisId="tokens"
          type="monotone"
          dataKey="totalTokens"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3, fill: "#3B82F6" }}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="cost"
          type="monotone"
          dataKey="totalCostUsd"
          stroke="#10B981"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={{ r: 2.5, fill: "#10B981" }}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
