"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HistoryEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: HistoryEntry[];
}

export default function TokenLineChart({ entries }: Props) {
  const byDay: Record<string, { date: string; tokens: number; cost: number; requests: number }> =
    {};

  for (const e of entries) {
    const day = format(parseISO(e.createdAt), "MM/dd");
    if (!byDay[day]) byDay[day] = { date: day, tokens: 0, cost: 0, requests: 0 };
    byDay[day].tokens += e.totalTokens;
    byDay[day].cost = parseFloat((byDay[day].cost + e.totalCostUsd).toFixed(4));
    byDay[day].requests += 1;
  }

  const data = Object.values(byDay);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No data in selected range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis yAxisId="tokens" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis yAxisId="cost" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8 }}
          labelStyle={{ color: "#cbd5e1" }}
          itemStyle={{ color: "#94a3b8" }}
          formatter={(value: number, name: string) =>
            name === "cost" ? [`$${value}`, "Cost USD"] : [value.toLocaleString(), name === "tokens" ? "Total Tokens" : "Requests"]
          }
        />
        <Legend
          formatter={(value) =>
            value === "tokens" ? "Total Tokens" : value === "cost" ? "Cost USD" : "Requests"
          }
          wrapperStyle={{ color: "#94a3b8", fontSize: 12 }}
        />
        <Line yAxisId="tokens" type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line yAxisId="cost" type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
