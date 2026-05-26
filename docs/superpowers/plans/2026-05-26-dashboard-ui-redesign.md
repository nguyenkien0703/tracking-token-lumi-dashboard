# Dashboard UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard's ad-hoc styling with a token-based dark UI, responsive layout (mobile/tablet/desktop), shared primitives (StatCard, Skeleton, EmptyState, ResponsiveTable, PeriodChip), restructure the Overview page, and lock a universal pattern across the 5 savameta pages.

**Architecture:** Next.js 14 App Router. Design tokens live in `globals.css` as CSS variables and are surfaced via the Tailwind config (`bg-base`, `bg-surface`, etc.). New shared components live in `src/components/`. Pages are rewritten in-place. No new APIs.

**Tech Stack:** Next.js 14, React 18 client components, Tailwind 3.4, recharts, `lucide-react` (new), `next/font/google` (Plus Jakarta Sans + Inter + JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-05-26-dashboard-ui-redesign-design.md`

**Verification model:** No test framework is configured in this repo. Each task is verified by (a) `npx tsc --noEmit` clean, and (b) manual viewport check in `npm run dev` at 375/768/1024/1440. The implementing engineer should keep `next dev` running in one terminal and the dashboard open in a browser sized via DevTools device emulation.

---

## File Structure

### New files

| Path | Responsibility |
|---|---|
| `src/components/Skeleton.tsx` | Shimmer rectangle primitive |
| `src/components/EmptyState.tsx` | Icon + message + optional CTA card |
| `src/components/ResponsiveTable.tsx` | Renders `<table>` on `≥md`, stacked card list on `<md` |
| `src/components/PeriodChip.tsx` | Period dropdown (1h / 24h / 7d / 30d / Custom) — replaces `DateRangePicker` on Overview |
| `src/lib/hooks/useMediaQuery.ts` | Tailwind-breakpoint media query hook |
| `src/lib/format.ts` | `formatNumber`, `formatCurrency`, `formatDelta` |

### Modified files

| Path | Change |
|---|---|
| `src/app/globals.css` | Add CSS variable palette + shimmer keyframes |
| `tailwind.config.ts` | Extend `colors` (semantic tokens) + `fontFamily` |
| `src/app/layout.tsx` | Load 3 Google fonts via `next/font`, apply via body classes |
| `src/components/StatCard.tsx` | Rewrite to spec Section 3 (icon chip + delta + loading) |
| `src/components/AppShell.tsx` | Tablet rail logic + drawer width + responsive `main` padding |
| `src/components/Sidebar.tsx` | Tablet rail (56px) with CSS-only tooltip, swap inline SVG → `lucide-react` icons |
| `src/components/savameta/SegmentTabs.tsx` | Restyle to new tokens |
| `src/app/page.tsx` | Apply Section 4 layout |
| `src/app/savameta/adoption/page.tsx` | Apply Section 5 pattern (no SegmentTabs — HR roster) |
| `src/app/savameta/engagement/page.tsx` | Apply Section 5 pattern, replace "BA chưa define" with EmptyState |
| `src/app/savameta/activity/page.tsx` | Apply Section 5 pattern |
| `src/app/savameta/lifecycle/page.tsx` | Apply Section 5 pattern |
| `src/app/savameta/triggers/page.tsx` | Apply Section 5 pattern, replace "BA chưa define" with EmptyState |

### Deleted files

| Path | Reason |
|---|---|
| `src/components/savameta/StatCard.tsx` | Consolidated into shared `src/components/StatCard.tsx` |
| `src/components/DateRangePicker.tsx` | Replaced by `PeriodChip` (verify no other consumers first) |

---

## Phase 1: Foundation (tokens, fonts, deps)

### Task 1: Add `lucide-react` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install package**

```bash
yarn add lucide-react@^0.460.0
```

- [ ] **Step 2: Verify install**

```bash
yarn list --pattern lucide-react
```

Expected: shows `lucide-react@0.460.0` or newer.

- [ ] **Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "deps: add lucide-react for icon family"
```

---

### Task 2: Define CSS variable palette in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace file contents**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #0B1020;
  --bg-surface: #141A2E;
  --bg-surface-2: #1B2240;
  --border-default: #252D4A;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --primary: #3B82F6;
  --accent: #F59E0B;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body), system-ui, -apple-system, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), system-ui, sans-serif;
}

.font-mono, code, pre {
  font-family: var(--font-mono), ui-monospace, monospace;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-surface); }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-surface) 0px, var(--bg-surface-2) 200px, var(--bg-surface) 400px);
  background-size: 1000px 100%;
  animation: shimmer 1.6s linear infinite;
  border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: zero errors (CSS is not type-checked but tsc validates the project).

- [ ] **Step 3: Verify dev server boots**

```bash
yarn dev
```

Expected: server starts on `:3000`, page background should now be `#0B1020` (slightly different from old `#020617`). Stop server with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add CSS variable palette + shimmer animation"
```

---

### Task 3: Extend Tailwind config with semantic color tokens + font families

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace file contents**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        "surface-2": "var(--bg-surface-2)",
        "border-default": "var(--border-default)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        slate: { 950: "#020617" }, // keep for legacy class references during migration
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify Tailwind compiles new tokens**

```bash
yarn dev
```

Open `http://localhost:3000` and inspect a card — color tokens like `bg-surface` should not throw "unknown utility" warnings. Stop server.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "style: extend tailwind with semantic color + font tokens"
```

---

### Task 4: Load 3 Google fonts via `next/font` in layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumi Token Dashboard",
  description: "DevOps monitoring dashboard for LumiLink token usage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify fonts load in browser**

```bash
yarn dev
```

Open `http://localhost:3000`. DevTools → Network → filter "font" → reload. Should see Plus Jakarta Sans, Inter, JetBrains Mono `.woff2` files fetched. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "style: load Plus Jakarta Sans + Inter + JetBrains Mono via next/font"
```

---

## Phase 2: Primitives

### Task 5: Create `Skeleton` primitive

**Files:**
- Create: `src/components/Skeleton.tsx`

- [ ] **Step 1: Write component**

```tsx
type Props = {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
};

const radiusMap: Record<NonNullable<Props["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export default function Skeleton({
  width = "100%",
  height = 16,
  className = "",
  rounded = "md",
}: Props) {
  return (
    <div
      className={`skeleton ${radiusMap[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Skeleton.tsx
git commit -m "feat(ui): add Skeleton shimmer primitive"
```

---

### Task 6: Create `useMediaQuery` hook

**Files:**
- Create: `src/lib/hooks/useMediaQuery.ts`

- [ ] **Step 1: Write hook**

```ts
"use client";

import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useMediaQuery(bp: Breakpoint): boolean {
  const query = BREAKPOINTS[bp];
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/useMediaQuery.ts
git commit -m "feat(ui): add useMediaQuery hook keyed to Tailwind breakpoints"
```

---

### Task 7: Create `format.ts` formatters

**Files:**
- Create: `src/lib/format.ts`

- [ ] **Step 1: Write formatters**

```ts
export function formatNumber(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return n.toLocaleString("en-US");
}

export function formatCurrency(n: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? (n >= 100 ? 2 : 4);
  return `$${n.toFixed(decimals)}`;
}

export function formatDelta(value: number): { sign: "up" | "down" | "flat"; pct: string } {
  if (Math.abs(value) < 0.5) return { sign: "flat", pct: "0%" };
  return {
    sign: value > 0 ? "up" : "down",
    pct: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
  };
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/format.ts
git commit -m "feat: add number/currency/delta formatters"
```

---

### Task 8: Create `EmptyState` primitive

**Files:**
- Create: `src/components/EmptyState.tsx`

- [ ] **Step 1: Write component**

```tsx
import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 bg-surface border border-border-default rounded-xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary mb-3">
        {icon}
      </div>
      <p className="text-text-primary text-sm font-medium">{title}</p>
      {description && (
        <p className="text-text-secondary text-xs mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat(ui): add EmptyState card primitive"
```

---

### Task 9: Rewrite shared `StatCard` (Section 3 of spec)

**Files:**
- Modify: `src/components/StatCard.tsx` (full rewrite)

- [ ] **Step 1: Replace file contents**

```tsx
import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import Skeleton from "./Skeleton";

export type StatCardTone = "default" | "success" | "warning" | "danger";

export type StatCardDelta = {
  value: number; // signed percentage e.g. -3.2
  label?: string; // e.g. "vs last week"
  positiveIsGood?: boolean; // default true; set false for cost/error metrics
};

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  delta?: StatCardDelta;
  tone?: StatCardTone;
  icon?: ReactNode;
  loading?: boolean;
};

const chipBgMap: Record<StatCardTone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

function DeltaRow({ delta }: { delta: StatCardDelta }) {
  const positiveIsGood = delta.positiveIsGood ?? true;
  const abs = Math.abs(delta.value);

  if (abs < 0.5) {
    return (
      <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
        <Minus className="w-3 h-3" />
        <span>stable{delta.label ? ` ${delta.label}` : ""}</span>
      </p>
    );
  }

  const isUp = delta.value > 0;
  const isGood = isUp === positiveIsGood;
  const color = isGood ? "text-success" : "text-danger";
  const Arrow = isUp ? ArrowUp : ArrowDown;

  return (
    <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${color}`}>
      <Arrow className="w-3 h-3" />
      <span>{Math.abs(delta.value).toFixed(1)}%</span>
      {delta.label && <span className="text-text-muted font-normal">{delta.label}</span>}
    </p>
  );
}

export default function StatCard({
  label,
  value,
  hint,
  delta,
  tone = "default",
  icon,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border-default rounded-xl p-4">
        <Skeleton width="60%" height={10} />
        <Skeleton width="50%" height={28} className="mt-3" />
        <Skeleton width="40%" height={12} className="mt-2" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-default rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">
          {label}
        </p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chipBgMap[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 font-mono text-2xl md:text-3xl font-semibold text-text-primary leading-none">
        {value}
      </p>
      {delta ? (
        <DeltaRow delta={delta} />
      ) : hint ? (
        <p className="mt-2 text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: existing `src/components/savameta/StatCard.tsx` is still untouched, current Overview page still uses old shape — both must continue compiling. If errors, the old StatCard call sites in `src/app/page.tsx` may be broken by the new prop shape. Note them but do NOT fix here — they'll be rewritten in Phase 4. If a call site uses props the new StatCard doesn't accept (e.g. `sub`, `accent`), revert this task and refactor in a later commit; otherwise proceed.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatCard.tsx
git commit -m "feat(ui): rewrite StatCard with icon chip + delta + loading"
```

---

### Task 10: Create `ResponsiveTable` primitive

**Files:**
- Create: `src/components/ResponsiveTable.tsx`

- [ ] **Step 1: Write component**

```tsx
"use client";

import { ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export type ColumnAlign = "left" | "right" | "center";

export type Column<Row> = {
  key: string;
  header: string;
  align?: ColumnAlign;
  width?: string;            // e.g. "60px", "20%"
  render: (row: Row) => ReactNode;
  mobileHidden?: boolean;     // omit from card list on mobile
  primary?: boolean;          // show as card title on mobile
};

type Props<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  emptyState?: ReactNode;
  rowHref?: (row: Row) => string;
};

const alignClass: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export default function ResponsiveTable<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  rowHref,
}: Props<Row>) {
  const isDesktop = useMediaQuery("md");

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-text-secondary">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2 font-medium ${alignClass[c.align ?? "left"]}`}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-surface-2/40 transition-colors"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${alignClass[c.align ?? "left"]}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile: card list
  return (
    <div className="divide-y divide-border-default">
      {rows.map((row) => {
        const primary = columns.find((c) => c.primary);
        const rest = columns.filter((c) => !c.primary && !c.mobileHidden);
        const content = (
          <div className="px-4 py-3">
            {primary && <div className="mb-2">{primary.render(row)}</div>}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {rest.map((c) => (
                <div key={c.key} className="flex justify-between gap-2">
                  <dt className="text-text-secondary">{c.header}</dt>
                  <dd className={`text-text-primary ${alignClass[c.align ?? "left"]}`}>
                    {c.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
        return rowHref ? (
          <a key={rowKey(row)} href={rowHref(row)} className="block hover:bg-surface-2/40">
            {content}
          </a>
        ) : (
          <div key={rowKey(row)}>{content}</div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ResponsiveTable.tsx
git commit -m "feat(ui): add ResponsiveTable — desktop table / mobile card list"
```

---

### Task 11: Create `PeriodChip` component

**Files:**
- Create: `src/components/PeriodChip.tsx`

- [ ] **Step 1: Write component**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

export type Period = "1h" | "24h" | "7d" | "30d" | "custom";

export type PeriodValue = {
  period: Period;
  from?: string;  // ISO date when period === "custom"
  to?: string;
};

type Props = {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
};

const PRESETS: { value: Period; label: string }[] = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range…" },
];

export default function PeriodChip({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PRESETS.find((p) => p.value === value.period) ?? PRESETS[2];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-default rounded-lg text-sm text-text-primary hover:bg-surface-2 transition-colors"
      >
        <Calendar className="w-4 h-4 text-text-secondary" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 text-text-secondary" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-surface border border-border-default rounded-lg shadow-lg overflow-hidden z-10">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                onChange({ period: p.value, from: value.from, to: value.to });
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                p.value === value.period
                  ? "bg-primary/10 text-primary"
                  : "text-text-primary hover:bg-surface-2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PeriodChip.tsx
git commit -m "feat(ui): add PeriodChip dropdown for period selection"
```

---

## Phase 3: Shell (Sidebar + AppShell responsive)

### Task 12: Rewrite Sidebar with tablet rail + lucide icons + CSS tooltip

**Files:**
- Modify: `src/components/Sidebar.tsx` (full rewrite)

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BarChart3,
  Activity,
  RotateCcw,
  Zap,
  Tag,
  Settings,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Home;
};

type NavSection = {
  title: string | null;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "COST TRACKING",
    items: [
      { href: "/", label: "Overview", Icon: Home },
      { href: "/users", label: "Users", Icon: Users },
    ],
  },
  {
    title: "SAVAMETA ADOPTION",
    items: [
      { href: "/savameta/adoption", label: "Adoption", Icon: BarChart3 },
      { href: "/savameta/engagement", label: "Engagement & Quality", Icon: Zap },
      { href: "/savameta/activity", label: "Activity Trends", Icon: Activity },
      { href: "/savameta/lifecycle", label: "Lifecycle", Icon: RotateCcw },
      { href: "/savameta/triggers", label: "Triggers", Icon: Zap },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { href: "/settings/roster", label: "Roster", Icon: Users },
      { href: "/settings/releases", label: "Releases", Icon: Tag },
      { href: "/settings", label: "Sync Status", Icon: Settings },
      { href: "/admin/settings", label: "Admin", Icon: Settings },
    ],
  },
];

function isItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/") return pathname === "/";
  if (itemHref === "/settings") return pathname === "/settings";
  return pathname.startsWith(itemHref);
}

type Props = {
  variant: "rail" | "full";
  onClose?: () => void;
};

export default function Sidebar({ variant, onClose }: Props) {
  const pathname = usePathname();
  const isRail = variant === "rail";

  return (
    <aside
      className={`h-full bg-surface border-r border-border-default flex flex-col ${
        isRail ? "w-14" : "w-56"
      }`}
    >
      <div className={`border-b border-border-default ${isRail ? "py-3 flex justify-center" : "px-4 py-5"}`}>
        {isRail ? (
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold leading-tight">Lumi Token</p>
              <p className="text-text-secondary text-xs">Dashboard</p>
            </div>
          </div>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto py-4 ${isRail ? "px-2 space-y-3" : "px-3 space-y-4"}`}>
        {sections.map((section) => (
          <div key={section.title ?? "_default"} className={isRail ? "space-y-1" : "space-y-1"}>
            {!isRail && section.title && (
              <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isItemActive(item.href, pathname);
              if (isRail) {
                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-label={item.label}
                      className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors ${
                        active
                          ? "bg-primary/15 text-primary border-l-2 border-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                      }`}
                    >
                      <item.Icon className="w-5 h-5" />
                    </Link>
                    <span
                      role="tooltip"
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-surface-2 border border-border-default rounded text-xs text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  <item.Icon className="w-5 h-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!isRail && (
        <div className="px-4 py-3 border-t border-border-default">
          <p className="text-text-muted text-xs truncate">
            {process.env.NEXT_PUBLIC_API_BASE_URL || "API URL not set"}
          </p>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: error — `AppShell.tsx` passes `Sidebar` without the new `variant` prop. We'll fix that in Task 13. Note the error; do not fix in this commit.

- [ ] **Step 3: Commit (build will be broken until Task 13)**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat(ui): rewrite Sidebar with rail variant + lucide icons + CSS tooltip"
```

---

### Task 13: Update AppShell to drive rail/full/drawer per breakpoint

**Files:**
- Modify: `src/components/AppShell.tsx` (full rewrite)

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <div
        className={`fixed left-0 top-0 h-full z-30 transition-transform duration-200 md:hidden
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar variant="full" onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Tablet: icon rail */}
      <div className="hidden md:flex lg:hidden fixed left-0 top-0 h-full z-10">
        <Sidebar variant="rail" />
      </div>

      {/* Desktop: full sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full z-10">
        <Sidebar variant="full" />
      </div>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-surface border-b border-border-default flex items-center px-4 z-10 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-2 text-text-primary text-sm font-semibold">Lumi Token</span>
      </div>

      {/* Main content */}
      <main className="min-h-screen pt-12 md:pt-0 md:ml-14 lg:ml-56 px-4 md:px-5 lg:px-6 py-6">
        {children}
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors. (The Sidebar `variant` prop introduced in Task 12 is now satisfied.)

- [ ] **Step 3: Manual viewport check**

```bash
yarn dev
```

Open `http://localhost:3000`. Use DevTools device emulation:
- **375px (mobile):** Sidebar hidden, hamburger in top bar, click → drawer slides in over backdrop, click backdrop → drawer closes.
- **768px (tablet):** 56px icon rail visible, hover an item → tooltip appears to the right of icon.
- **1024px (desktop):** Full 224px sidebar with labels.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppShell.tsx
git commit -m "feat(ui): drive Sidebar rail/full/drawer per breakpoint"
```

---

## Phase 4: Overview page

### Task 14: Rewrite Overview page to Section 4 spec

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { RefreshCw, Download, Trophy, Users as UsersIcon, Coins, DollarSign, Gauge, Search } from "lucide-react";
import PeriodChip, { PeriodValue } from "@/components/PeriodChip";
import UserSearch from "@/components/UserSearch";
import StatCard from "@/components/StatCard";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import { formatNumber, formatCurrency } from "@/lib/format";

interface TopUser {
  rank: number;
  userId: number;
  email: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  requestCount: number;
}

const REFRESH_INTERVAL = 60;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function periodToDateRange(period: PeriodValue): { from?: string; to?: string } {
  if (period.period === "custom") return { from: period.from, to: period.to };
  const to = new Date();
  const from = new Date(to);
  switch (period.period) {
    case "1h": from.setHours(from.getHours() - 1); break;
    case "24h": from.setDate(from.getDate() - 1); break;
    case "7d": from.setDate(from.getDate() - 7); break;
    case "30d": from.setDate(from.getDate() - 30); break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) {
    return <span className="text-text-muted text-xs font-mono">{rank}</span>;
  }
  const colorMap = {
    1: "bg-amber-400/20 text-amber-300",
    2: "bg-slate-400/20 text-slate-300",
    3: "bg-orange-700/20 text-orange-400",
  } as const;
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colorMap[rank as 1 | 2 | 3]}`}>
      <Trophy className="w-3 h-3" />
    </span>
  );
}

function UserCell({ user }: { user: TopUser }) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.userName ||
    user.email ||
    `#${user.userId}`;
  const initials = (user.firstName?.[0] ?? user.lastName?.[0] ?? user.userName?.[0] ?? "#").toUpperCase();
  return (
    <Link href={`/users/${user.userId}`} className="flex items-center gap-2.5 group">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-medium group-hover:text-primary transition-colors truncate">
          {displayName}
        </p>
        {user.email && user.email !== displayName && (
          <p className="text-text-muted text-xs truncate">{user.email}</p>
        )}
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const [period, setPeriod] = useState<PeriodValue>({ period: "7d" });
  const [sortBy, setSortBy] = useState<"cost" | "tokens">("cost");
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const scanRef = useRef<() => Promise<void>>(async () => {});

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = periodToDateRange(period);
      const sp = new URLSearchParams({ sortBy });
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      const res = await fetch(`/api/admin/top-users?${sp}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setUsers(json.data?.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [period, sortBy]);

  useEffect(() => { scanRef.current = scan; }, [scan]);
  useEffect(() => { scan(); }, [scan]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          scanRef.current();
          return REFRESH_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCost = users.reduce((s, u) => s + u.totalCostUsd, 0);
  const totalTokens = users.reduce((s, u) => s + u.totalTokens, 0);
  const activeUsers = users.length;
  const avgCostPerUser = activeUsers > 0 ? totalCost / activeUsers : 0;

  const periodLabel = period.period === "custom" ? "Custom range" : `Last ${period.period}`;

  const columns: Column<TopUser>[] = [
    { key: "rank", header: "#", width: "50px", align: "center", render: (u) => <RankBadge rank={u.rank} />, mobileHidden: true },
    { key: "user", header: "User", render: (u) => <UserCell user={u} />, primary: true },
    { key: "tokens", header: "Tokens", align: "right", render: (u) => <span className="font-mono text-text-primary">{formatNumber(u.totalTokens)}</span> },
    { key: "prompt", header: "Prompt", align: "right", render: (u) => <span className="font-mono text-text-muted text-xs">{formatNumber(u.totalPromptTokens)}</span>, mobileHidden: true },
    { key: "completion", header: "Completion", align: "right", render: (u) => <span className="font-mono text-text-muted text-xs">{formatNumber(u.totalCompletionTokens)}</span>, mobileHidden: true },
    { key: "requests", header: "Requests", align: "right", render: (u) => <span className="font-mono text-text-primary">{u.requestCount}</span> },
    { key: "cost", header: "Cost", align: "right", render: (u) => <span className="font-mono font-semibold text-accent">{formatCurrency(u.totalCostUsd)}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Top 100 users · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodChip value={period} onChange={setPeriod} />
          <button
            onClick={() => { scan(); setCountdown(REFRESH_INTERVAL); }}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-accent hover:opacity-90 disabled:opacity-50 text-[#0B1020] font-medium transition-colors flex items-center gap-1.5"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Active Users"
          value={loading ? "—" : formatNumber(activeUsers)}
          icon={<UsersIcon className="w-4 h-4" />}
          tone="default"
          hint="in selected period"
          loading={loading && users.length === 0}
        />
        <StatCard
          label="Total Tokens"
          value={loading ? "—" : formatNumber(totalTokens, { compact: true })}
          icon={<Coins className="w-4 h-4" />}
          tone="default"
          loading={loading && users.length === 0}
        />
        <StatCard
          label="Total Cost"
          value={loading ? "—" : formatCurrency(totalCost)}
          icon={<DollarSign className="w-4 h-4" />}
          tone="warning"
          loading={loading && users.length === 0}
        />
        <StatCard
          label="Avg / User"
          value={loading ? "—" : formatCurrency(avgCostPerUser)}
          icon={<Gauge className="w-4 h-4" />}
          tone="default"
          hint="per active user"
          loading={loading && users.length === 0}
        />
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <UserSearch />
        <div className="flex rounded-lg border border-border-default overflow-hidden text-xs">
          <button
            onClick={() => setSortBy("cost")}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === "cost"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            By Cost
          </button>
          <button
            onClick={() => setSortBy("tokens")}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === "tokens"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            By Tokens
          </button>
        </div>
        <div className="ml-auto text-text-muted text-xs">
          Next refresh in <span className="font-mono">{formatCountdown(countdown)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => scan()} className="text-xs px-2 py-1 rounded bg-danger/20 hover:bg-danger/30">
            Retry
          </button>
        </div>
      )}

      {/* Top users table card */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-text-primary text-sm font-semibold">
              Top Users · sorted by {sortBy === "cost" ? "Cost" : "Tokens"}
            </h2>
            <p className="text-text-muted text-xs mt-0.5">{users.length} users</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {loading && users.length === 0 ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={48} />
            ))}
          </div>
        ) : (
          <ResponsiveTable
            columns={columns}
            rows={users}
            rowKey={(u) => u.userId}
            emptyState={
              <EmptyState
                icon={<Search className="w-5 h-5" />}
                title="No usage data"
                description="No requests recorded for the selected period."
              />
            }
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Manual viewport check**

```bash
yarn dev
```

Open `http://localhost:3000`. Test:
- **Desktop 1440:** 4-column KPI grid, full sidebar visible. Click period chip → dropdown appears with 5 options. Hover Refresh → orange bg lightens.
- **Tablet 768:** 4-column KPI grid still fits, icon rail sidebar. Table shows all columns.
- **Mobile 375:** 2-column KPI grid (2×2), hamburger sidebar. Table switches to card list — each row is a card with user info on top, `Tokens: X / Requests: X / Cost: $X` as label:value pairs.
- **Loading state:** hard-refresh, KPI cards should show skeleton shimmer (3 rectangles per card), table area shows 8 stacked skeleton rows.
- **Empty state:** change period to `1h` (likely empty in dev) → EmptyState card with search icon + "No usage data" should replace table.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(overview): redesign with KPI row, PeriodChip, ResponsiveTable, skeleton"
```

---

## Phase 5: Savameta pages — universal pattern

### Task 15: Restyle SegmentTabs to new tokens

**Files:**
- Modify: `src/components/savameta/SegmentTabs.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
export type Segment = "all" | "savameta" | "external" | "anonymous";

const TABS: Array<{ value: Segment; label: string; hint: string }> = [
  { value: "all", label: "All", hint: "all signed-in + anonymous" },
  { value: "savameta", label: "Savameta", hint: "@savameta.com" },
  { value: "external", label: "External", hint: "personal email" },
  { value: "anonymous", label: "Anonymous", hint: "no login" },
];

type Props = {
  value: Segment;
  onChange: (next: Segment) => void;
};

export default function SegmentTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex bg-surface border border-border-default rounded-lg p-1 gap-1">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            title={tab.hint}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/savameta/SegmentTabs.tsx
git commit -m "style(savameta): restyle SegmentTabs to new tokens"
```

---

### Task 16: Apply universal pattern to Adoption page

**Files:**
- Modify: `src/app/savameta/adoption/page.tsx` (full rewrite)

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Download, Filter, Users as UsersIcon, UserCheck, TrendingUp, UserX, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import { formatNumber } from "@/lib/format";

type Summary = {
  totalEligible: number;
  joined: number;
  notJoined: number;
  adoptionRate: number;
  dailyActive7d: number;
};

type JoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  user_id: number;
  display_name: string | null;
  first_seen_at: string | null;
  last_active_at: string | null;
  days_since_last_activity: number | null;
};

type NeverJoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  added_at: string;
};

type ReleaseJoiners = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  new_joiners: number;
  days_active: number;
  velocity: number;
};

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

export default function AdoptionPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [joined, setJoined] = useState<JoinedUser[]>([]);
  const [neverJoined, setNeverJoined] = useState<NeverJoinedUser[]>([]);
  const [byRelease, setByRelease] = useState<ReleaseJoiners[]>([]);
  const [activeTab, setActiveTab] = useState<"joined" | "never">("joined");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, j, n, r] = await Promise.all([
        fetch("/api/savameta/adoption/summary").then((r) => r.json()),
        fetch("/api/savameta/adoption/joined").then((r) => r.json()),
        fetch("/api/savameta/adoption/never-joined").then((r) => r.json()),
        fetch("/api/savameta/adoption/by-release").then((r) => r.json()),
      ]);
      setSummary(s.data);
      setJoined(j.data ?? []);
      setNeverJoined(n.data ?? []);
      setByRelease(r.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const joinedColumns: Column<JoinedUser>[] = [
    { key: "email", header: "Email", primary: true, render: (u) => (
      <div>
        <p className="text-text-primary text-sm font-medium">{u.display_name ?? u.full_name ?? u.email}</p>
        <p className="text-text-muted text-xs">{u.email}</p>
      </div>
    )},
    { key: "department", header: "Department", render: (u) => <span className="text-text-secondary text-xs">{u.department ?? "—"}</span> },
    { key: "first_seen", header: "First Seen", render: (u) => <span className="text-text-secondary text-xs">{u.first_seen_at ? new Date(u.first_seen_at).toLocaleDateString() : "—"}</span> },
    { key: "last_active", header: "Last Active", render: (u) => <span className="text-text-secondary text-xs">{u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "—"}</span> },
    { key: "idle", header: "Days Idle", align: "right", render: (u) => {
      if (u.days_since_last_activity === null) return <span className="text-text-muted text-xs">—</span>;
      const days = u.days_since_last_activity;
      const cls = days <= 7 ? "text-success" : days <= 30 ? "text-warning" : "text-danger";
      return <span className={`text-xs font-medium font-mono ${cls}`}>{days}d</span>;
    }},
  ];

  const neverColumns: Column<NeverJoinedUser>[] = [
    { key: "email", header: "Email", primary: true, render: (u) => (
      <div>
        <p className="text-text-primary text-sm font-medium">{u.full_name ?? u.email}</p>
        <p className="text-text-muted text-xs">{u.email}</p>
      </div>
    )},
    { key: "department", header: "Department", render: (u) => <span className="text-text-secondary text-xs">{u.department ?? "—"}</span> },
    { key: "added", header: "Added", render: (u) => <span className="text-text-secondary text-xs">{new Date(u.added_at).toLocaleDateString()}</span> },
  ];

  const releaseColumns: Column<ReleaseJoiners>[] = [
    { key: "name", header: "Release", primary: true, render: (r) => <span className="text-text-primary text-sm font-medium">{r.name}</span> },
    { key: "window", header: "Window", render: (r) => (
      <span className="text-text-secondary text-xs">
        {r.start_date} → {r.end_date ?? <span className="text-success">ongoing</span>}
      </span>
    )},
    { key: "new", header: "New Joiners", align: "right", render: (r) => <span className="font-mono text-text-primary text-sm">{r.new_joiners}</span> },
    { key: "days", header: "Days Active", align: "right", render: (r) => <span className="font-mono text-text-secondary text-xs">{r.days_active}</span> },
    { key: "velocity", header: "Velocity", align: "right", render: (r) => <span className="font-mono text-text-secondary text-xs">{r.velocity.toFixed(2)}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Adoption</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Track who joined / not / when. Source: roster + history_entries.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg bg-accent hover:opacity-90 disabled:opacity-50 text-base font-medium transition-colors flex items-center gap-1.5 self-start"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* KPI grid — 4 cards (Adoption has no SegmentTabs per spec) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Eligible"
          value={summary ? formatNumber(summary.totalEligible) : "—"}
          hint="from roster"
          icon={<UsersIcon className="w-4 h-4" />}
          loading={loading && !summary}
        />
        <StatCard
          label="Joined"
          value={summary ? formatNumber(summary.joined) : "—"}
          icon={<UserCheck className="w-4 h-4" />}
          tone="success"
          loading={loading && !summary}
        />
        <StatCard
          label="Adoption Rate"
          value={summary ? `${(summary.adoptionRate * 100).toFixed(0)}%` : "—"}
          icon={<TrendingUp className="w-4 h-4" />}
          tone="success"
          loading={loading && !summary}
        />
        <StatCard
          label="Daily Active 7/7"
          value={summary ? formatNumber(summary.dailyActive7d) : "—"}
          hint="active every day in last 7"
          icon={<Activity className="w-4 h-4" />}
          tone="success"
          loading={loading && !summary}
        />
      </div>

      {/* By Release card */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <h2 className="text-text-primary text-sm font-semibold">New Joiners by Release</h2>
          <p className="text-text-muted text-xs mt-0.5">
            User được count vào release đầu tiên match `first_seen_at` trong window.
          </p>
        </div>
        {loading && byRelease.length === 0 ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={36} />)}
          </div>
        ) : (
          <ResponsiveTable
            columns={releaseColumns}
            rows={byRelease}
            rowKey={(r) => r.id}
            emptyState={
              <EmptyState
                icon={<TrendingUp className="w-5 h-5" />}
                title="No releases defined"
                description="Add a release in Settings → Releases to track adoption velocity per release window."
              />
            }
          />
        )}
      </div>

      {/* Joined / Never tabs card */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-surface-2 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab("joined")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "joined" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Joined ({joined.length})
            </button>
            <button
              onClick={() => setActiveTab("never")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "never" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Never Joined ({neverJoined.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded border border-border-default">
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button
              onClick={() => {
                const filename = activeTab === "joined"
                  ? `joined-users-${new Date().toISOString().slice(0, 10)}.csv`
                  : `never-joined-users-${new Date().toISOString().slice(0, 10)}.csv`;
                const rows = (activeTab === "joined" ? joined : neverJoined) as unknown as Record<string, unknown>[];
                downloadCsv(filename, rows);
              }}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>

        {loading && (activeTab === "joined" ? joined : neverJoined).length === 0 ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={40} />)}
          </div>
        ) : activeTab === "joined" ? (
          <ResponsiveTable
            columns={joinedColumns}
            rows={joined}
            rowKey={(u) => u.email}
            emptyState={
              <EmptyState
                icon={<UsersIcon className="w-5 h-5" />}
                title="No joined users yet"
                description="Users will appear here after their first activity is recorded."
              />
            }
          />
        ) : (
          <ResponsiveTable
            columns={neverColumns}
            rows={neverJoined}
            rowKey={(u) => u.email}
            emptyState={
              <EmptyState
                icon={<UserX className="w-5 h-5" />}
                title="Everyone in roster has joined"
                description="No outstanding eligible users."
              />
            }
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Manual viewport check**

```bash
yarn dev
```

Visit `http://localhost:3000/savameta/adoption`. Confirm:
- 4 KPI cards top row (no SegmentTabs, no 5th "Never Joined" KPI moved into a 5-col grid)
- 2 data cards below (By Release, Joined/Never tabs)
- Mobile 375: 2-col KPI, tables → card list with email as title
- Empty state if no releases: card with TrendingUp icon

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/savameta/adoption/page.tsx
git commit -m "feat(adoption): apply universal savameta pattern"
```

---

### Task 17: Apply universal pattern to Engagement page

**Canonical reference:** Task 16 (Adoption) is the structural template for Tasks 17–20. Before starting any of those, re-read Task 16's final code to internalize the shell layout (header → KPI grid card → data cards with header+ResponsiveTable+EmptyState). The skeleton/empty/responsive primitives are the same; only the metrics, columns, and SegmentTabs presence change.

**Files:**
- Modify: `src/app/savameta/engagement/page.tsx`
- Reference: read current file first to preserve API contracts + data shapes

- [ ] **Step 1: Read current engagement page**

```bash
cat src/app/savameta/engagement/page.tsx
```

Note: keep all data fetching, query params, and API endpoints exactly as-is — this task only changes presentation. Identify which sub-sections currently show "BA chưa define" amber chips; those become `EmptyState` cards.

- [ ] **Step 2: Rewrite the page**

Apply the same shell pattern as Adoption (Task 16):
- Header with title + subtitle on left, auto-refresh chip + Refresh button on right
- `<SegmentTabs value={...} onChange={...} />` row below header
- KPI grid (5 cards): wrap each in `<StatCard>` with appropriate `tone` and `icon` (lucide-react)
  - Convos → MessageSquare, default tone
  - Turns → ArrowRightLeft, default
  - Med Turns → BarChart3, success
  - Total Cost → DollarSign, warning
  - Cost / DAU → Gauge, warning
- Token Usage breakdown → nested 4-cell grid inside one card (not 4 standalone StatCards)
- Per-user table → wrap in card with header (title · count · Filter + Export CSV) and use `<ResponsiveTable>`
- Replace all `Loading...` text + spinners with `<Skeleton>`
- Replace any "BA chưa define" / "Pending" amber chip with `<EmptyState icon={<FileText/>} title="Pending product definition" description="Awaiting BA spec — see Notion thread" action={<a href="...">Open Notion</a>} />`

Use Adoption page (Task 16 output) as the structural template. Do NOT invent new metrics or API calls — keep every fetch + state variable the engagement page already has.

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Manual viewport check**

```bash
yarn dev
```

Visit `http://localhost:3000/savameta/engagement`. Confirm:
- SegmentTabs visible below header
- 5 KPI cards (or 2/3/5 col responsive grid)
- Token Usage as nested grid inside one card
- "BA chưa define" sections are now EmptyState cards
- Mobile: 2-col KPI, table → card list, no horizontal scroll

Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/app/savameta/engagement/page.tsx
git commit -m "feat(engagement): apply universal savameta pattern + replace BA-chưa-define chips"
```

---

### Task 18: Apply universal pattern to Activity page

**Files:**
- Modify: `src/app/savameta/activity/page.tsx`

- [ ] **Step 1: Read current page**

```bash
cat src/app/savameta/activity/page.tsx
```

- [ ] **Step 2: Rewrite using the pattern from Task 16**

Same shell: header, SegmentTabs, KPI grid (4 cards per spec line 107), data cards below. Use `<Skeleton>` for loading, `<EmptyState>` for empty results, `<ResponsiveTable>` for any tabular data, `<StatCard>` for KPIs.

Preserve all existing API calls + state — only change presentation.

For any charts (recharts): wrap in a card, set `h-56` on `≥md` and `h-48` on mobile (use Tailwind `h-48 md:h-56`).

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Manual viewport check at 375/768/1024**

```bash
yarn dev
```

Confirm: SegmentTabs visible, KPI grid 2/2/4 columns, charts not overflow, tables → card list on mobile. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/app/savameta/activity/page.tsx
git commit -m "feat(activity): apply universal savameta pattern"
```

---

### Task 19: Apply universal pattern to Lifecycle page

**Files:**
- Modify: `src/app/savameta/lifecycle/page.tsx`

- [ ] **Step 1: Read current page**

```bash
cat src/app/savameta/lifecycle/page.tsx
```

- [ ] **Step 2: Rewrite using the pattern from Task 16**

Same shell. KPI grid 4 cards (2/2/4). Preserve all data fetching + state.

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Manual viewport check at 375/768/1024**

```bash
yarn dev
```

Stop server when done.

- [ ] **Step 5: Commit**

```bash
git add src/app/savameta/lifecycle/page.tsx
git commit -m "feat(lifecycle): apply universal savameta pattern"
```

---

### Task 20: Apply universal pattern to Triggers page (+ BA-chưa-define cleanup)

**Files:**
- Modify: `src/app/savameta/triggers/page.tsx`

- [ ] **Step 1: Read current page**

```bash
cat src/app/savameta/triggers/page.tsx
```

Identify the "First Resolution" amber chip — this becomes an `EmptyState` (per spec line 242).

- [ ] **Step 2: Rewrite using the pattern from Task 16**

Same shell. KPI grid per spec line 106 (Engagement = 5; Triggers not explicitly listed, so default to 4 unless the existing page has 5 — match the existing count). Preserve API calls.

Replace "First Resolution" amber chip block with:

```tsx
<EmptyState
  icon={<FileText className="w-5 h-5" />}
  title="Pending product definition"
  description="Awaiting BA spec — see Notion thread"
  action={
    <a href="https://www.notion.so/..." target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:opacity-80">
      Open Notion →
    </a>
  }
/>
```

(Use the actual Notion URL from the current page if present; otherwise leave the `href` as `"#"` and add a TODO comment — but a TODO is acceptable here only because the URL is content data, not implementation. If a URL is in the codebase, use it.)

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Manual viewport check**

```bash
yarn dev
```

Confirm "First Resolution" section is now an EmptyState card with same height as data sections. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/app/savameta/triggers/page.tsx
git commit -m "feat(triggers): apply universal savameta pattern + replace BA chip with EmptyState"
```

---

## Phase 6: Cleanup + QA

### Task 21: Delete legacy `savameta/StatCard.tsx`

**Files:**
- Delete: `src/components/savameta/StatCard.tsx`

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -rn 'from "@/components/savameta/StatCard"' src/ || echo "clean"
grep -rn "from '@/components/savameta/StatCard'" src/ || echo "clean"
```

Expected: both print "clean". If any import remains, fix that page first.

- [ ] **Step 2: Delete file**

```bash
rm src/components/savameta/StatCard.tsx
```

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/savameta/StatCard.tsx
git commit -m "chore: remove legacy savameta/StatCard — consolidated"
```

---

### Task 22: Delete `DateRangePicker.tsx` if unused

**Files:**
- Delete (conditional): `src/components/DateRangePicker.tsx`

- [ ] **Step 1: Check for remaining consumers**

```bash
grep -rn "DateRangePicker" src/ || echo "no references"
```

Expected: either "no references" → safe to delete, OR you'll see remaining consumers (e.g. `/users` or `/admin`) → SKIP this task and add a follow-up note in the commit message saying "DateRangePicker retained — still used by X".

- [ ] **Step 2: If no consumers, delete file**

```bash
rm src/components/DateRangePicker.tsx
```

- [ ] **Step 3: Verify tsc clean**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/DateRangePicker.tsx
git commit -m "chore: remove unused DateRangePicker"
```

If skipped (still has consumers), commit an empty message:

```bash
echo "(skipped — still consumed by X)"
```

---

### Task 23: Pre-delivery checklist sweep

**Files:** none new — verification only

- [ ] **Step 1: Emoji audit**

```bash
grep -rn '🥇\|🥈\|🥉\|📅\|⟲\|🎉' src/ || echo "no emoji"
```

Expected: "no emoji". If any remain, replace with `lucide-react` equivalents and recommit.

- [ ] **Step 2: Inline `#hex` audit in TSX files**

```bash
grep -rEn '#[0-9A-Fa-f]{3,8}' src/components/ src/app/ | grep -v '\.css' || echo "no inline hex"
```

Expected: "no inline hex" (or only legitimate cases like avatar URL placeholders). All color decisions should go through Tailwind tokens.

- [ ] **Step 3: `tsc` strict check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Zero `any` introduced in any new file.

- [ ] **Step 4: Build check**

```bash
yarn build
```

Expected: build succeeds, no warnings about unused imports / undefined Tailwind classes.

- [ ] **Step 5: Multi-viewport smoke test**

```bash
yarn dev
```

For each viewport (375 / 768 / 1024 / 1440), visit every page:
- `/` — Overview
- `/savameta/adoption`
- `/savameta/engagement`
- `/savameta/activity`
- `/savameta/lifecycle`
- `/savameta/triggers`

Check:
- No horizontal scroll on mobile
- Sidebar behavior correct at each breakpoint (drawer / rail / full)
- KPI grids reflow as per spec Section 2 table
- Tables become card lists on mobile
- Touch targets ≥ 44×44 (hamburger, tabs, period chip)
- Focus rings visible when tabbing
- Skeleton appears during load, EmptyState appears when no data

Stop server.

- [ ] **Step 6: `prefers-reduced-motion` check**

In Chrome DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`. Reload. Shimmer should freeze, transitions should be near-instant.

- [ ] **Step 7: Commit final checklist note**

```bash
git commit --allow-empty -m "qa: pre-delivery checklist pass — emoji/hex/tsc/build/viewports/a11y"
```

---

## Constraints & Non-Goals (from spec)

- No new API endpoints
- Dark mode only
- No animation library — CSS transitions only
- No design system extraction
- AppShell drawer state stays component-local (no context)

## Open Questions

None — all design decisions locked in the spec at `docs/superpowers/specs/2026-05-26-dashboard-ui-redesign-design.md`.
