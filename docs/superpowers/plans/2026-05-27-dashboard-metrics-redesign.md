# Dashboard Metrics Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp LumiPulse dashboard với đầy đủ LLM metrics (Turns, Cache, Burn Rate, Sessions), dual Y-axis chart, period comparison, personal alert, và design consistency.

**Architecture:** FE-only changes — không cần BE mới. Data cho chart được tính bằng cách group `HistoryEntry[]` by date từ API có sẵn. Period comparison gọi 2 `getUserCost()` song song. Alert so median 30 ngày của chính user. Cache columns hiển thị 0 chờ BE.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (design tokens), Recharts (ComposedChart), date-fns

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types/index.ts` | Modify | Thêm nullable cache fields vào `UserSessionEntry`, `UserCostSummary` |
| `src/lib/api.ts` | Modify | Thêm `getUserCostComparison()`, `getDailyBreakdown()` |
| `src/components/DateRangePicker.tsx` | Modify | Tích hợp period pills, sync với date inputs |
| `src/components/TokenLineChart.tsx` | Rewrite | Dual Y-axis, daily data, tooltip |
| `src/components/SessionTable.tsx` | Modify | 5 cột mới, rename 3 cột, burn rate |
| `src/components/StatCard.tsx` | Modify | Thêm `warning` tone |
| `src/components/StatCardLegacy.tsx` | Delete | Thay bằng StatCard |
| `src/app/users/[userId]/page.tsx` | Modify | 2 cards mới, comparison delta, alert, daily chart |
| `src/app/sessions/[sessionId]/page.tsx` | Modify | Migrate StatCardLegacy → StatCard, rename, cache hit |

---

## Task 1: Cập nhật Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Thêm cache fields vào `UserSessionEntry`**

Mở `src/types/index.ts`, tìm interface `UserSessionEntry` (line 44) và thêm 3 fields nullable:

```typescript
export interface UserSessionEntry {
  sessionId: string;
  chatSessionDbId: number;
  title: string | null;
  status: string;
  sessionCreatedAt: string;
  sessionUpdatedAt: string;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
  firstTrackedAt: string;
  lastTrackedAt: string;
  // BE pending — hiển thị 0 khi null
  cacheWriteTokens?: number | null;
  cacheHitTokens?: number | null;
  cacheSavingUsd?: number | null;
}
```

- [ ] **Step 2: Thêm cache fields vào `UserCostSummary`**

Tìm interface `UserCostSummary` (line 6) và thêm:

```typescript
export interface UserCostSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
  modelUsage?: Record<string, ModelUsage>;
  // BE pending — hiển thị 0 khi null
  cacheWriteTokens?: number | null;
  cacheHitTokens?: number | null;
  cacheSavingUsd?: number | null;
}
```

- [ ] **Step 3: Thêm type `DailyEntry` cho chart data**

Thêm vào cuối file:

```typescript
export interface DailyEntry {
  date: string;        // "2026-05-01"
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
}
```

- [ ] **Step 4: Verify TypeScript compile**

```bash
cd /Users/macboook/Documents/Defikit/tracking-token-lumi-dashboard
npx tsc --noEmit 2>&1 | head -20
```

Expected: không có error mới.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add nullable cache fields and DailyEntry type"
```

---

## Task 2: API helpers — comparison + daily breakdown

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Thêm `CostComparison` type và `getUserCostComparison()`**

Mở `src/lib/api.ts`, thêm sau import block:

```typescript
export interface CostComparison {
  current: UserCostSummary;
  previous: UserCostSummary;
}
```

Thêm function sau `getUserCost()`:

```typescript
export async function getUserCostComparison(
  userId: number,
  from: string,
  to: string
): Promise<CostComparison> {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const periodMs = toDate.getTime() - fromDate.getTime();
  const prevFrom = new Date(fromDate.getTime() - periodMs).toISOString().slice(0, 10);
  const prevTo = from;

  const [current, previous] = await Promise.all([
    getUserCost(userId, from, to),
    getUserCost(userId, prevFrom, prevTo),
  ]);
  return { current, previous };
}
```

- [ ] **Step 2: Thêm `getDailyBreakdown()`**

Thêm sau `getUserCostComparison()`:

```typescript
export async function getDailyBreakdown(
  userId: number,
  from: string,
  to: string
): Promise<DailyEntry[]> {
  // Lấy tất cả history entries rồi group by date ở FE
  // limit=500 đủ cho 30 ngày với user active
  const data = await getHistory({ userId, from, to, limit: 500, offset: 0 });

  const byDate = new Map<string, DailyEntry>();
  for (const entry of data.entries) {
    const date = entry.createdAt.slice(0, 10);
    const existing = byDate.get(date);
    if (existing) {
      existing.totalTokens += entry.totalTokens;
      existing.totalCostUsd += entry.totalCostUsd;
      existing.requestCount += 1;
    } else {
      byDate.set(date, {
        date,
        totalTokens: entry.totalTokens,
        totalCostUsd: entry.totalCostUsd,
        requestCount: 1,
      });
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
```

- [ ] **Step 3: Thêm import `DailyEntry` ở đầu file**

Thay dòng import hiện tại:

```typescript
import { UserCostSummary, HistoryData, SessionMessagesResponse, MessageCostDetail, SessionMessageEntry, UserSessionsData } from "@/types";
```

Thành:

```typescript
import { UserCostSummary, HistoryData, SessionMessagesResponse, MessageCostDetail, SessionMessageEntry, UserSessionsData, DailyEntry } from "@/types";
```

- [ ] **Step 4: Thêm `computeAlertThreshold()` utility**

Thêm vào cuối `src/lib/api.ts`:

```typescript
// Tính median cost/ngày từ 30 ngày lịch sử, trả về threshold (2x median)
// Trả về null nếu không đủ data (< 7 ngày)
export function computeAlertThreshold(dailyEntries: DailyEntry[]): number | null {
  if (dailyEntries.length < 7) return null;
  const costs = dailyEntries.map((e) => e.totalCostUsd).sort((a, b) => a - b);
  const mid = Math.floor(costs.length / 2);
  const median = costs.length % 2 === 0
    ? (costs[mid - 1] + costs[mid]) / 2
    : costs[mid];
  return median * 2;
}
```

- [ ] **Step 5: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: không có error.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api.ts src/types/index.ts
git commit -m "feat(api): add getUserCostComparison, getDailyBreakdown, computeAlertThreshold"
```

---

## Task 3: DateRangePicker — thêm period pills

**Files:**
- Modify: `src/components/DateRangePicker.tsx`

- [ ] **Step 1: Đọc file hiện tại**

```bash
cat src/components/DateRangePicker.tsx
```

- [ ] **Step 2: Thêm period pills logic**

Rewrite `src/components/DateRangePicker.tsx`:

```typescript
"use client";

import { useState } from "react";
import { DateRange } from "@/types";
import { format, subDays, startOfMonth } from "date-fns";

type Period = "today" | "7d" | "30d" | "month" | "custom";

const PILLS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d",    label: "Last 7d" },
  { id: "30d",   label: "Last 30d" },
  { id: "month", label: "This month" },
];

function periodToRange(period: Period): DateRange {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  switch (period) {
    case "today":  return { from: fmt(today), to: fmt(today) };
    case "7d":     return { from: fmt(subDays(today, 7)), to: fmt(today) };
    case "30d":    return { from: fmt(subDays(today, 30)), to: fmt(today) };
    case "month":  return { from: fmt(startOfMonth(today)), to: fmt(today) };
    default:       return { from: "", to: "" };
  }
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange, period?: Period) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [activePeriod, setActivePeriod] = useState<Period>("7d");

  const handlePill = (period: Period) => {
    setActivePeriod(period);
    onChange(periodToRange(period), period);
  };

  const handleDateInput = (field: "from" | "to", val: string) => {
    setActivePeriod("custom");
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Period pills */}
      <div className="flex items-center gap-1">
        {PILLS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePill(p.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activePeriod === p.id
                ? "bg-primary text-white"
                : "bg-surface-2 text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.from}
          onChange={(e) => handleDateInput("from", e.target.value)}
          className="bg-surface border border-border-default rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
        />
        <span className="text-text-muted text-xs">→</span>
        <input
          type="date"
          value={value.to}
          onChange={(e) => handleDateInput("to", e.target.value)}
          className="bg-surface border border-border-default rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: không có error. Nếu có lỗi về `onChange` signature thay đổi — fix caller ở Task 6.

- [ ] **Step 4: Commit**

```bash
git add src/components/DateRangePicker.tsx
git commit -m "feat(DateRangePicker): add period pills Today/7d/30d/Month"
```

---

## Task 4: StatCard — thêm `warning` tone

**Files:**
- Modify: `src/components/StatCard.tsx`

- [ ] **Step 1: Thêm `warning` vào `StatCardTone` và map**

Mở `src/components/StatCard.tsx`. Tìm type `StatCardTone` (line 5) và update:

```typescript
export type StatCardTone = "default" | "success" | "warning" | "danger";
```

Tìm `chipBgMap` (line 23) và thêm entry `warning`:

```typescript
const chipBgMap: Record<StatCardTone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
};
```

- [ ] **Step 2: Thêm alert border khi tone = warning hoặc danger**

Tìm div wrapper `bg-surface border border-border-default` trong return statement và update:

```typescript
<div className={`bg-surface border rounded-xl p-4 ${
  tone === "warning" ? "border-warning/40" :
  tone === "danger"  ? "border-danger/40"  :
  "border-border-default"
}`}>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatCard.tsx
git commit -m "feat(StatCard): add warning tone with alert border"
```

---

## Task 5: TokenLineChart — dual Y-axis + daily data

**Files:**
- Modify: `src/components/TokenLineChart.tsx`

- [ ] **Step 1: Đọc file hiện tại**

```bash
cat src/components/TokenLineChart.tsx
```

- [ ] **Step 2: Rewrite với dual Y-axis**

```typescript
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
      <div className="h-40 flex items-center justify-center text-text-muted text-sm">
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }}
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
```

- [ ] **Step 3: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TokenLineChart.tsx
git commit -m "feat(TokenLineChart): dual Y-axis, daily data, custom tooltip"
```

---

## Task 6: SessionTable — 5 cột mới + rename + burn rate

**Files:**
- Modify: `src/components/SessionTable.tsx`

- [ ] **Step 1: Thêm burn rate helper**

Thêm function trước component:

```typescript
function calcBurnRate(
  totalTokens: number,
  firstTrackedAt: string,
  lastTrackedAt: string
): string {
  if (!firstTrackedAt || !lastTrackedAt || firstTrackedAt === lastTrackedAt) {
    return "—";
  }
  const hours =
    (new Date(lastTrackedAt).getTime() - new Date(firstTrackedAt).getTime()) /
    3_600_000;
  if (hours < 0.01) return "—";
  const rate = totalTokens / hours;
  if (rate >= 1_000_000) return `${(rate / 1_000_000).toFixed(1)}M/hr`;
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(1)}k/hr`;
  return `${Math.round(rate)}/hr`;
}
```

- [ ] **Step 2: Update thead — rename + thêm cột**

Thay toàn bộ `<thead>` block:

```typescript
<thead className="bg-surface-2 text-text-muted text-xs uppercase tracking-wider">
  <tr>
    <th className="px-3 py-3 w-10 text-center">#</th>
    <th className="px-3 py-3">Title</th>
    <th className="px-3 py-3 text-right">Turns</th>
    <th className="px-3 py-3 text-right">Input Tokens</th>
    <th className="px-3 py-3 text-right">Output Tokens</th>
    <th className="px-3 py-3 text-right">Cache Write</th>
    <th className="px-3 py-3 text-right">Cache Hit</th>
    <th className="px-3 py-3 text-right">Saving ($)</th>
    <th className="px-3 py-3 text-right">Burn Rate</th>
    <th className="px-3 py-3 text-right">Cost</th>
    <th className="px-3 py-3">Created At</th>
  </tr>
</thead>
```

- [ ] **Step 3: Update tbody — thêm cells mới**

Thay toàn bộ `<tr>` bên trong map:

```typescript
{entries.map((e, i) => (
  <tr key={e.sessionId} className="hover:bg-surface-2/50 transition-colors">
    <td className="px-3 py-2.5 text-center text-text-muted text-xs tabular-nums">
      {offset + i + 1}
    </td>
    <td className="px-3 py-2.5 max-w-[200px]">
      <Link
        href={`/sessions/${e.sessionId}?userId=${userId}`}
        className="text-primary hover:underline text-sm font-medium truncate block"
        title={e.title ?? e.sessionId}
      >
        {e.title || <span className="text-text-muted italic">Untitled</span>}
      </Link>
      <span className="text-text-muted font-mono text-xs">{e.sessionId.slice(0, 12)}…</span>
    </td>
    <td className="px-3 py-2.5 text-right text-warning text-xs tabular-nums">
      {e.requestCount}
    </td>
    <td className="px-3 py-2.5 text-right text-text-secondary text-xs tabular-nums">
      {e.totalPromptTokens.toLocaleString()}
    </td>
    <td className="px-3 py-2.5 text-right text-text-secondary text-xs tabular-nums">
      {e.totalCompletionTokens.toLocaleString()}
    </td>
    <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
      {(e.cacheWriteTokens ?? 0).toLocaleString()}
    </td>
    <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
      {(e.cacheHitTokens ?? 0).toLocaleString()}
    </td>
    <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
      ${(e.cacheSavingUsd ?? 0).toFixed(4)}
    </td>
    <td className="px-3 py-2.5 text-right text-primary/70 text-xs tabular-nums font-mono">
      {calcBurnRate(e.totalTokens, e.firstTrackedAt, e.lastTrackedAt)}
    </td>
    <td className="px-3 py-2.5 text-right font-semibold text-success text-xs tabular-nums">
      ${e.totalCostUsd.toFixed(4)}
    </td>
    <td className="px-3 py-2.5 text-text-muted text-xs whitespace-nowrap">
      {e.sessionCreatedAt ? format(parseISO(e.sessionCreatedAt), "MM/dd HH:mm") : "—"}
    </td>
  </tr>
))}
```

- [ ] **Step 4: Update colSpan và pagination styling**

Tìm `colSpan={8}` → đổi thành `colSpan={11}`.

Tìm các class hard-coded `bg-slate-700`, `bg-slate-800` trong pagination buttons → đổi thành:
```
bg-surface-2 hover:bg-surface text-text-secondary
```

- [ ] **Step 5: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/components/SessionTable.tsx
git commit -m "feat(SessionTable): add Turns/Cache/BurnRate columns, rename headers, migrate design tokens"
```

---

## Task 7: /users/[userId]/page.tsx — cards, comparison, alert, chart

**Files:**
- Modify: `src/app/users/[userId]/page.tsx`

- [ ] **Step 1: Update imports**

Thay import block đầu file:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { subDays, format } from "date-fns";
import {
  getUserCost,
  getUserCostComparison,
  getUserSessions,
  getDailyBreakdown,
  computeAlertThreshold,
  CostComparison,
} from "@/lib/api";
import { UserCostSummary, UserSessionsData, DateRange, DailyEntry } from "@/types";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import TokenLineChart from "@/components/TokenLineChart";
import SessionTable from "@/components/SessionTable";
```

- [ ] **Step 2: Thêm state cho comparison, daily data, alert**

Thêm sau các useState hiện tại:

```typescript
const [comparison, setComparison] = useState<CostComparison | null>(null);
const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
const [alertThreshold, setAlertThreshold] = useState<number | null>(null);
const [activePeriod, setActivePeriod] = useState<string>("7d");
```

- [ ] **Step 3: Thêm fetch cho daily data + comparison**

Thêm useEffect sau `fetchSessions`:

```typescript
const fetchDailyAndComparison = useCallback(async () => {
  if (!dateRange.from || !dateRange.to) return;
  try {
    const [daily, comp] = await Promise.all([
      getDailyBreakdown(userId, dateRange.from, dateRange.to),
      activePeriod === "7d" || activePeriod === "30d"
        ? getUserCostComparison(userId, dateRange.from, dateRange.to)
        : Promise.resolve(null),
    ]);
    setDailyEntries(daily);
    setComparison(comp);
  } catch {
    // non-critical — chart/comparison không load thì page vẫn dùng được
  }
}, [userId, dateRange, activePeriod]);

// Alert: luôn lấy 30d history để tính threshold
const fetchAlertThreshold = useCallback(async () => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const from30d = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const daily30d = await getDailyBreakdown(userId, from30d, today);
    setAlertThreshold(computeAlertThreshold(daily30d));
  } catch {
    // non-critical
  }
}, [userId]);

useEffect(() => { fetchDailyAndComparison(); }, [fetchDailyAndComparison]);
useEffect(() => { fetchAlertThreshold(); }, [fetchAlertThreshold]);
```

- [ ] **Step 4: Update `handleDateChange` để nhận period**

```typescript
const handleDateChange = (range: DateRange, period?: string) => {
  setOffset(0);
  setDateRange(range);
  if (period) setActivePeriod(period);
};
```

- [ ] **Step 5: Helper tính delta % giữa 2 periods**

Thêm function trước return:

```typescript
function calcDelta(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
```

- [ ] **Step 6: Update Summary Cards**

Thay `<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">` và các StatCard bên trong:

```typescript
{/* Row 1: Token metrics */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard
    label="Total Tokens"
    value={summary ? summary.totalTokens.toLocaleString() : "—"}
    loading={loadingSummary}
    delta={
      comparison
        ? {
            value: calcDelta(comparison.current.totalTokens, comparison.previous.totalTokens) ?? 0,
            label: "vs prev period",
            positiveIsGood: false,
          }
        : undefined
    }
  />
  <StatCard
    label="Input Tokens"
    value={summary ? summary.totalPromptTokens.toLocaleString() : "—"}
    loading={loadingSummary}
  />
  <StatCard
    label="Output Tokens"
    value={summary ? summary.totalCompletionTokens.toLocaleString() : "—"}
    loading={loadingSummary}
  />
  <StatCard
    label="Total Cost"
    value={summary ? `$${summary.totalCostUsd.toFixed(4)}` : "—"}
    hint="USD"
    loading={loadingSummary}
    tone={
      alertThreshold && summary && summary.totalCostUsd > alertThreshold
        ? "warning"
        : "default"
    }
    delta={
      comparison
        ? {
            value: calcDelta(comparison.current.totalCostUsd, comparison.previous.totalCostUsd) ?? 0,
            label: "vs prev period",
            positiveIsGood: false,
          }
        : undefined
    }
  />
</div>

{/* Row 2: Activity & cache */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard
    label="Turns"
    value={summary ? summary.requestCount.toLocaleString() : "—"}
    loading={loadingSummary}
  />
  <StatCard
    label="Sessions"
    value={sessionsData ? sessionsData.total.toLocaleString() : "—"}
    loading={loadingSessions}
  />
  <StatCard
    label="Avg Cost / Turn"
    value={
      summary && summary.requestCount > 0
        ? `$${(summary.totalCostUsd / summary.requestCount).toFixed(4)}`
        : "—"
    }
    loading={loadingSummary}
  />
  <StatCard
    label="Cache Saving"
    value={summary?.cacheSavingUsd != null ? `$${summary.cacheSavingUsd.toFixed(4)}` : "$0.0000"}
    hint="USD — BE pending"
    loading={loadingSummary}
  />
</div>
```

- [ ] **Step 7: Update chart block để dùng `dailyEntries`**

Tìm block `{/* Chart */}` và thay:

```typescript
<div className="bg-surface border border-border-default rounded-xl p-5">
  <h2 className="text-text-primary font-semibold text-sm mb-4">Token Usage Over Time</h2>
  {loadingSessions ? (
    <div className="h-40 flex items-center justify-center text-text-muted text-sm animate-pulse">
      Loading chart...
    </div>
  ) : (
    <TokenLineChart entries={dailyEntries} />
  )}
</div>
```

- [ ] **Step 8: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix bất kỳ lỗi nào xuất hiện.

- [ ] **Step 9: Commit**

```bash
git add src/app/users/[userId]/page.tsx
git commit -m "feat(UserDetail): add comparison delta, alert, Sessions/AvgCost cards, daily chart"
```

---

## Task 8: /sessions/[sessionId]/page.tsx — migrate StatCardLegacy + rename

**Files:**
- Modify: `src/app/sessions/[sessionId]/page.tsx`
- Delete: `src/components/StatCardLegacy.tsx`

- [ ] **Step 1: Tìm tất cả chỗ dùng StatCardLegacy trong sessions page**

```bash
grep -n "StatCardLegacy\|accent=" src/app/sessions/[sessionId]/page.tsx
```

- [ ] **Step 2: Thay import**

Thay:
```typescript
import StatCard from "@/components/StatCardLegacy";
```
Thành:
```typescript
import StatCard from "@/components/StatCard";
```

- [ ] **Step 3: Update Summary Cards trong sessions page**

Tìm `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">` và thay 3 cards:

```typescript
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  <StatCard
    label="Total Tokens"
    value={data.totalTokens.toLocaleString()}
    loading={loading}
  />
  <StatCard
    label="Total Cost"
    value={`$${data.totalCostUsd.toFixed(4)}`}
    hint="USD"
    tone="success"
    loading={loading}
  />
  <StatCard
    label="Turns"
    value={data.requestCount.toLocaleString()}
    loading={loading}
  />
</div>
```

- [ ] **Step 4: Rename "Turn Messages" → "Turns" và hiển thị cache hit trong MessageEntryCard**

Tìm `<span className="text-slate-500">` bên trong `MessageEntryCard` hiển thị tokens và thêm cache hit:

```typescript
{/* Trong MessageEntryCard, phần token + cost row */}
<div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1 sm:gap-x-5 text-xs">
  <span className="text-text-muted">
    Input: <span className="text-primary font-semibold">{entry.totalPromptTokens.toLocaleString()}</span>
  </span>
  <span className="text-text-muted">
    Output: <span className="text-text-secondary font-semibold">{entry.totalCompletionTokens.toLocaleString()}</span>
  </span>
  <span className="text-text-muted">
    Cache Hit: <span className="text-cyan-400 font-semibold">
      {/* cacheReadTokens aggregate chưa có ở turn level summary — hiển thị 0 */}
      0
    </span>
  </span>
  <span className="text-text-muted">
    Cost: <span className="text-success font-semibold">${entry.totalCostUsd.toFixed(6)}</span>
    <span className="text-text-muted"> (in ${entry.inputCostUsd.toFixed(6)} / out ${entry.outputCostUsd.toFixed(6)})</span>
  </span>
  {entry.requestCount > 1 && (
    <span className="text-text-muted">
      Turns: <span className="text-warning font-semibold">{entry.requestCount}</span>
    </span>
  )}
</div>
```

- [ ] **Step 5: Migrate hard-coded colors trong sessions page**

```bash
grep -n "slate-700\|slate-800\|slate-900\|indigo-\|emerald-\|amber-" src/app/sessions/[sessionId]/page.tsx
```

Thay từng cái:
- `border-slate-700` → `border-border-default`
- `bg-slate-800` → `bg-surface`
- `bg-slate-800/60` → `bg-surface/60`
- `text-slate-200` → `text-text-primary`
- `text-slate-400` → `text-text-secondary`
- `text-slate-500` → `text-text-muted`
- `text-indigo-300` → `text-primary`
- `text-emerald-400` → `text-success`
- `text-amber-400` → `text-warning`

- [ ] **Step 6: Xóa StatCardLegacy**

```bash
grep -r "StatCardLegacy" src/
```

Expected: không còn file nào import StatCardLegacy. Nếu có file khác vẫn dùng — fix trước.

```bash
rm src/components/StatCardLegacy.tsx
```

- [ ] **Step 7: Verify compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add src/app/sessions/[sessionId]/page.tsx
git rm src/components/StatCardLegacy.tsx
git commit -m "feat(SessionDetail): migrate StatCardLegacy, rename labels, add cache hit display"
```

---

## Task 9: Smoke test + dev server check

- [ ] **Step 1: Start dev server**

```bash
yarn dev
```

- [ ] **Step 2: Kiểm tra /users/[userId] page**

Mở `http://localhost:3000/users/23` (hoặc user ID có data).

Verify:
- [ ] 8 summary cards hiển thị đúng 2 rows
- [ ] Period pills hoạt động — click "Last 7d" update date range
- [ ] Chart hiển thị đường token (xanh) + cost (xanh lá dashed) với 2 Y-axis
- [ ] Tooltip trên chart hiển thị token + cost
- [ ] Session table có đủ 11 cột
- [ ] Burn rate tính đúng cho sessions có nhiều turns
- [ ] Cache columns hiển thị 0 (không hiển thị undefined/NaN)

- [ ] **Step 3: Kiểm tra /sessions/[sessionId] page**

Verify:
- [ ] 3 cards dùng StatCard mới (không có legacy)
- [ ] Label "Turns" thay vì "Requests"
- [ ] Không còn màu hard-coded slate-700/800

- [ ] **Step 4: Final commit nếu có hotfix**

```bash
git add -p
git commit -m "fix: smoke test fixes"
```

---

## Phase 2 Backlog (chờ BE)

Khi BE implement xong các endpoint sau, FE chỉ cần bỏ null-coalescing `?? 0`:

1. **Cache aggregate**: BE thêm `cacheWriteTokens`, `cacheHitTokens`, `cacheSavingUsd` vào `UserSessionEntry` và `UserCostSummary` response
2. **Cache write ở turn level**: BE thêm `cacheWriteTokens` vào `SessionMessageEntry`
