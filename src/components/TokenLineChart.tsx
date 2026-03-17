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
import { UserSessionEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: UserSessionEntry[];
}

export default function TokenLineChart({ entries }: Props) {
  const byDay: Record<string, { key: string; date: string; tokens: number; cost: number; requests: number }> = {};

  for (const e of entries) {
    if (!e.sessionCreatedAt) continue;
    const key = format(parseISO(e.sessionCreatedAt), "yyyy-MM-dd");
    const label = format(parseISO(e.sessionCreatedAt), "MM/dd");
    if (!byDay[key]) byDay[key] = { key, date: label, tokens: 0, cost: 0, requests: 0 };
    byDay[key].tokens += e.totalTokens;
    byDay[key].cost = parseFloat((byDay[key].cost + e.totalCostUsd).toFixed(4));
    byDay[key].requests += e.requestCount;
  }

  const data = Object.values(byDay).sort((a, b) => a.key.localeCompare(b.key));

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
