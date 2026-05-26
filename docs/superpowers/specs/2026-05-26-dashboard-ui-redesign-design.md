# Dashboard UI Redesign — Design Spec

**Date:** 2026-05-26
**Owner:** kiennv (Savameta · AI Lumi Tech)
**Status:** Design approved, ready for implementation plan

---

## Goal

Redesign `tracking-token-lumi-dashboard` to (a) look more polished and consistent across pages, (b) work properly on tablet and mobile, and (c) lock in a reusable component pattern so future Savameta pages stop drifting.

## Scope

**In scope**
- Visual design tokens (palette, typography, spacing, radii)
- Layout system + responsive behavior (sidebar, headers, grids, tables)
- StatCard redesign — replaces existing `src/components/savameta/StatCard.tsx`
- Overview page (`src/app/page.tsx`) full redesign
- Universal pattern applied to all 5 savameta pages: Adoption, Engagement, Activity, Lifecycle, Triggers
- Sidebar (`src/components/Sidebar.tsx`) tablet rail + mobile drawer
- Empty/loading state replacements (skeleton, empty-state card)
- Replace all emoji icons with SVG (Heroicons)

**Out of scope**
- New features (no new metrics, no new pages)
- Backend changes
- Internal `/admin` + `/settings` pages — visual cleanup only if trivial, not a redesign target
- Light mode (dark only)

---

## Section 1 — Visual Language

### Palette (semantic tokens, dark only)

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B1020` | Page background |
| `--bg-surface` | `#141A2E` | Cards, sections |
| `--bg-surface-2` | `#1B2240` | Nested cards, table headers |
| `--border` | `#252D4A` | Dividers |
| `--text-primary` | `#F1F5F9` | Body text, numbers |
| `--text-secondary` | `#94A3B8` | Labels, captions |
| `--text-muted` | `#64748B` | Disabled, hint |
| `--primary` | `#3B82F6` | Brand, links, active nav |
| `--accent` | `#F59E0B` | Primary CTA (Refresh, Export) |
| `--success` | `#10B981` | DAU, positive delta, joined |
| `--warning` | `#F59E0B` | At-risk, cost, idle |
| `--danger` | `#EF4444` | Errors, never-joined, churn |

Defined as CSS variables in `globals.css`; Tailwind config extended to expose `bg-base / surface / surface-2 / border-default / text-primary / ...`.

### Typography

| Role | Font | Weights | Sizes |
|---|---|---|---|
| Heading | Plus Jakarta Sans | 600 / 700 | 32 / 24 / 20 / 18 |
| Body / labels | Inter | 400 / 500 | 16 / 14 / 12 |
| Numbers / tabular data | JetBrains Mono | 500 / 600 | 14–32 |

Loaded via `next/font/google` in `app/layout.tsx`, exposed as CSS vars `--font-heading / --font-body / --font-mono`.

### Style direction

- Dark mode only
- 3-layer background depth (base → surface → surface-2)
- Borders + subtle `shadow-sm` on cards, no heavy shadows
- 8pt spacing rhythm: 4 / 8 / 12 / 16 / 24 / 32 / 48
- `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs/buttons
- No emoji as structural icons — `lucide-react` (single icon family) at 16/20/24
- Transitions 150–300ms, `prefers-reduced-motion` respected

---

## Section 2 — Layout System & Responsive

### Breakpoints (Tailwind defaults)

| Tag | Min | Target |
|---|---|---|
| `sm` | 640 | Phone landscape |
| `md` | 768 | Tablet portrait |
| `lg` | 1024 | Tablet landscape / small laptop |
| `xl` | 1280 | Desktop |

### Sidebar behavior

| Width | Behavior |
|---|---|
| `≥ lg` (1024+) | Full sidebar 224px (current) |
| `md` (768–1023) | Icon-only rail 56px; CSS-only label tooltip on hover (absolute-positioned span, no JS lib); active item shows colored bg + accent left border |
| `< md` (≤ 767) | Hidden by default; hamburger in top header opens drawer overlay from left + backdrop scrim 40% black |

### Main area

- `max-w-7xl` centered, padding `px-4 md:px-5 lg:px-6 py-6`
- Sections stacked with `gap-6`

### KPI grid

| Page | Mobile | Tablet (md) | Desktop (lg) |
|---|---|---|---|
| Overview (4 KPIs) | 2 cols | 4 cols | 4 cols |
| Adoption (4) | 2 | 2 | 4 |
| Engagement (5) | 2 | 3 | 5 |
| Activity (4) | 2 | 2 | 4 |
| Lifecycle (4) | 2 | 2 | 4 |

### Tables — responsive

- Desktop / tablet: native table inside card wrapper, sticky header row, zebra row hover
- Mobile (< `md`): switch to **card list** — each row becomes a stacked card with key info on top (email + name + avatar), metadata below as `label: value` pairs
- Implementation: shared `<ResponsiveTable>` component that takes columns + rows and renders table OR card list based on a `useMediaQuery('md')` hook

### Charts

- Mobile: 1 chart per row, `h-48`
- Tablet/desktop: existing widths, `h-56`
- Axis labels abbreviated on mobile (e.g. `4/12` instead of `Apr 12`)

---

## Section 3 — StatCard Component

Single shared component `src/components/StatCard.tsx`, replaces the existing one.

### Props

```ts
type Tone = "default" | "success" | "warning" | "danger";

interface StatCardProps {
  label: string;           // uppercase, tracked, 11px
  value: string | number;  // JetBrains Mono, 28–32px, weight 600
  hint?: string;           // optional, 12px muted, below value
  delta?: {                // optional trend pill
    value: number;         // signed percentage, e.g. -3.2
    label?: string;        // e.g. "vs last week"
  };
  tone?: Tone;             // controls icon-chip color, default "default"
  icon?: React.ReactNode;  // SVG icon in 32px colored chip
  loading?: boolean;       // shows skeleton if true
}
```

### Anatomy (desktop)

```
┌────────────────────────────────────┐
│ ACTIVE USERS              [icon]   │ <- label + icon chip (top row)
│ 1,247                              │ <- big number (JetBrains Mono)
│ ↑ 12.4%  vs last week              │ <- delta line (success/danger color), OR hint if no delta
└────────────────────────────────────┘
```

### Tone → icon-chip color map

| Tone | Icon chip bg | Use case |
|---|---|---|
| `default` | `rgba(59,130,246,0.12)` blue tint | neutral counts |
| `success` | `rgba(16,185,129,0.12)` | DAU, joined, positive |
| `warning` | `rgba(245,158,11,0.12)` | cost, at-risk |
| `danger` | `rgba(239,68,68,0.12)` | never-joined, errors |

### Delta logic

- `delta.value > 0` AND metric is "positive growth" (active users, joins) → green `↑`
- `delta.value > 0` AND metric is "negative growth" (cost, errors) → red `↑`
- `delta.value < 0` → opposite of above
- `|delta.value| < 0.5` → grey "stable" instead
- If metric has no historical comparison (e.g. `totalEligible` — roster size), omit `delta` and use `hint` instead

The "positive growth vs negative growth" polarity is a per-call decision (the caller knows whether higher = better). Implementation: simply pick the color and arrow at the call site, pass already-formatted JSX as `delta`. No separate `polarity` prop.

### Loading state

When `loading={true}`: render skeleton — animated shimmer rectangle for label, big rectangle for value, thin rectangle for delta. Same dimensions as final state to avoid CLS.

---

## Section 4 — Overview Page Redesign

`src/app/page.tsx`.

### Structure (top to bottom)

1. **Page header**
   - Title `Overview` (24px, 700)
   - Subtitle: `Top 100 users · {period label}` (12px, secondary)
   - Right side: period chip dropdown + Refresh CTA
2. **KPI row** — 4 cards
   - Active Users (default tone, blue icon) — delta vs previous period
   - Total Tokens (default) — delta vs previous period
   - Total Cost (warning, amber icon) — delta vs previous period; red if cost ↑
   - Avg / User (default tone) — `totalCost / activeUsers`; hint "per active user"
3. **Controls row** — `<UserSearch />` on left, `By Cost / By Tokens` segmented control next to it, "Next refresh in 0:42" muted text on right
4. **Top users table** — single card wrapper
   - Card header: `Top Users — sorted by {sortBy}` · `({users.length} users)` muted · Export CSV link on right
   - Table desktop / card list mobile
   - Rank column: gold/silver/bronze SVG badges for 1/2/3 (no emoji), grey number for rest
   - Avatar circle (or initials) + name + email stacked

### Replaced / removed

- Date range picker → period chip dropdown (1h / 24h / 7d / 30d / Custom)
- Progress bar during loading → skeleton in KPI row + table rows
- 🥇🥈🥉 emoji → SVG badges
- Big orange refresh button → smaller header-right button

### State machine

| State | Render |
|---|---|
| Initial mount, no data | Show skeletons in all sections, fetch in background |
| Loading after filter change | Show existing data dimmed at 60% opacity + skeleton overlay on KPIs + refresh button shows spinner |
| Error | Inline banner above KPIs: icon + message + Retry button |
| Empty (filters return 0 rows) | Empty-state card replaces table — icon + "No usage data for {filters}" + Reset Filters CTA |
| Success | Render |

---

## Section 5 — Universal Savameta Page Pattern

Applied to Engagement, Activity, Lifecycle, Triggers, and (with one omission) Adoption.

### Pattern (top to bottom)

1. **Header**: title (700) + subtitle (secondary) on left · auto-refresh chip + Refresh CTA on right
2. **SegmentTabs**: Savameta / External / Anonymous / All — pill group, `bg-surface` with active `bg-primary`
   - **Omitted for Adoption** (HR roster metric — Savameta only by definition)
3. **KPI grid** (Section 2 sizing)
4. **Sub-sections** with related metrics → nested grid inside one card (e.g. Token Usage breakdown), not 4 standalone StatCards floating loose
5. **Data table** card:
   - Card header: title · `({rows.length} items)` · Filter dropdown + Export CSV on right
   - Mobile → card list
6. **Loading** → skeleton everywhere (no `Loading...` text)
7. **Empty state** → icon + 1-line message + (optional) CTA, never plain text

### "BA chưa define" cleanup

Replace the amber "BA chưa define" chips in Engagement (Quality Metrics) and Triggers (First Resolution) with a proper empty-state card:

- Icon (e.g. document-text outline, secondary color)
- "Pending product definition"
- Sub: "Awaiting BA spec — see Notion thread" + link
- Same card height as data sections so layout doesn't jump

---

## Component Inventory (new + modified)

| File | Change |
|---|---|
| `src/app/globals.css` | Add CSS variable tokens for palette |
| `tailwind.config.ts` | Extend `colors`, `fontFamily`, `borderRadius` |
| `src/app/layout.tsx` | Load Plus Jakarta Sans + Inter + JetBrains Mono via `next/font` |
| `src/components/StatCard.tsx` | Rewrite (new variant A) |
| `src/components/savameta/StatCard.tsx` | Delete — consolidate into shared `StatCard` |
| `src/components/Sidebar.tsx` | Tablet rail (56px) + mobile drawer behavior; remove emoji-flavored SVG, audit icon family |
| `src/components/AppShell.tsx` | Mobile hamburger + drawer state |
| `src/components/ResponsiveTable.tsx` | **New** — desktop table / mobile card list |
| `src/components/EmptyState.tsx` | **New** — icon + message + CTA card |
| `src/components/Skeleton.tsx` | **New** — animated shimmer primitive |
| `src/components/PeriodChip.tsx` | **New** — period dropdown (replaces DateRangePicker on Overview) |
| `src/components/SegmentTabs.tsx` | Restyle to new tokens (no logic change) |
| `src/app/page.tsx` | Apply Section 4 layout |
| `src/app/savameta/{adoption,engagement,activity,lifecycle,triggers}/page.tsx` | Apply Section 5 pattern |
| Icon set | Add `lucide-react` (chosen over Heroicons — smaller bundle, better tree-shaking); remove inline SVG soup from Sidebar |

---

## Implementation Order

1. **Tokens + fonts** (globals.css, tailwind config, layout fonts)
2. **Primitives** (Skeleton, EmptyState, StatCard, ResponsiveTable, PeriodChip)
3. **Shell** (Sidebar rail + mobile drawer, AppShell hamburger)
4. **Overview page** (Section 4)
5. **Savameta pages** in order: Adoption → Engagement → Activity → Lifecycle → Triggers (Section 5)
6. **QA pass** — Pre-Delivery checklist below, manual test at 375/768/1024/1440

This ordering means we can demo Overview after step 4 before touching savameta pages.

---

## Constraints & Non-Goals

- **No new API endpoints.** All redesign uses existing data shapes. If a redesign would need new data (e.g. period-over-period delta on a metric that has no history), the delta is omitted for now.
- **No theme toggle.** Dark only.
- **No animation library.** CSS transitions only.
- **No design system extraction into a separate package.** Tokens live in `globals.css` + Tailwind config — sufficient for one consumer.
- **AppShell mobile drawer state** stays component-local (`useState`), not in a context. Only 1 consumer.

---

## Pre-Delivery Checklist

From `ui-ux-pro-max` skill (skill output 2026-05-26) + project-specific:

### Accessibility
- [ ] Text contrast ≥ 4.5:1 in dark mode (verify with tool)
- [ ] Focus rings visible on all interactive elements
- [ ] Icon-only buttons (hamburger, refresh) have `aria-label`
- [ ] `prefers-reduced-motion`: shimmer + transitions disabled

### Interaction
- [ ] Touch targets ≥ 44×44px on mobile (tab pills, period chip, hamburger)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Transitions 150–300ms
- [ ] Disabled buttons reduced to 50% opacity + `pointer-events: none`

### Layout
- [ ] No horizontal scroll on mobile (test 375px viewport)
- [ ] Test 375 / 768 / 1024 / 1440
- [ ] Sticky table header doesn't overlap card border

### Visual
- [ ] Zero emoji as icons (grep `🥇\|🥈\|🥉\|📅\|↻\|↓\|↑\|⟲` in `src/`)
- [ ] One icon family only (`lucide-react`)
- [ ] All raw `#hex` removed from components — only token classes

### Code health
- [ ] `pnpm tsc --noEmit` passes
- [ ] No new `any` types
- [ ] `src/components/savameta/StatCard.tsx` deleted, imports updated

---

## Open Questions

None — all sections approved by user in brainstorming session 2026-05-26.
