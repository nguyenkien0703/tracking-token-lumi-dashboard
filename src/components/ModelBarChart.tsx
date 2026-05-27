"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ModelUsage } from "@/types";

interface Props {
  modelUsage: Record<string, ModelUsage>;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ModelBarChart({ modelUsage }: Props) {
  const data = Object.entries(modelUsage).map(([model, usage]) => ({
    model: model.length > 20 ? model.slice(0, 18) + "…" : model,
    fullModel: model,
    tokens: usage.tokens,
    costUsd: usage.costUsd,
  }));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No model usage data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
        <XAxis
          dataKey="model"
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          angle={-20}
          textAnchor="end"
          interval={0}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-default)", borderRadius: 8 }}
          labelStyle={{ color: "var(--text-secondary)" }}
          formatter={(value: number, name: string) =>
            name === "costUsd" ? [`$${value.toFixed(4)}`, "Cost USD"] : [value.toLocaleString(), "Tokens"]
          }
          labelFormatter={(_: unknown, payload: Array<{ payload?: { fullModel?: string } }>) => payload?.[0]?.payload?.fullModel ?? ""}
        />
        <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
