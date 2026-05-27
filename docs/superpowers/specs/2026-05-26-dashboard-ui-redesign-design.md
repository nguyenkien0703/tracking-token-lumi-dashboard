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

---

# Amendment 1 — Unified Information Architecture (2026-05-26, post-Phase-3)

**Status:** Supersedes Sections 4, 5, and parts of the Component Inventory above.
**Trigger:** After Phase 3 (responsive shell) shipped, user asked to merge the "cost tracking" and "Savameta adoption" universes into a single product. Sidebar currently advertises them as two products under separate section headers ("COST TRACKING" / "SAVAMETA ADOPTION") — that boundary is artificial because every metric is just a different view of the same `history_entries` + `users` data, sliced by user segment.

## A1.1 — Goal restated

`tracking-token-lumi-dashboard` is **one product**: **Lumi Token Analytics**. It serves both:
- **Engineering / Finance:** "where is the LLM spend going?"
- **HR / Adoption owners:** "are Savameta employees actually using it?"

Both audiences read the same underlying data; the segment filter (`all` / `savameta` / `external` / `anonymous`) is the lens, not a product boundary.

## A1.2 — Sidebar (replaces "COST TRACKING" + "SAVAMETA ADOPTION" sections)

New structure (single "DASHBOARD" section, plus SETTINGS):

```
DASHBOARD
  Overview            ← KPI summary (segment-aware) + Top-N preview
  Users               ← full Top-N table with SegmentTabs (was: Overview's table)
  Activity            ← daily trends (segment-aware)         [moved from /savameta/activity]
  Engagement          ← quality metrics (segment-aware)      [moved from /savameta/engagement]
  Lifecycle           ← buckets (segment-aware)              [moved from /savameta/lifecycle]
  Triggers            ← returning + first-value (segment-aware) [moved from /savameta/triggers]

SETTINGS
  Roster              ← grouped by department (was flat list)
  Releases
  Sync Status
  Admin
```

### What's removed from the sidebar

- **`/users`** (the User Lookup search page) — duplicate of the search box already on Overview. Search remains; the dedicated page goes away. `/users/[userId]` drill-down stays.
- **`/savameta/adoption`** — the four adoption KPIs (Total Eligible, Joined, Not Joined, Adoption Rate) are folded into Overview as additional KPI cards that appear only when `segment === "savameta"` and there is a non-empty roster. The `joined` / `never-joined` user lists move to the new `Users` page as a subview/tab.

### What's renamed / moved

- `/savameta/activity` → `/activity`
- `/savameta/engagement` → `/engagement`
- `/savameta/lifecycle` → `/lifecycle`
- `/savameta/triggers` → `/triggers`

Old URLs return HTTP redirects (Next.js `redirect()` in a `route.ts` or `next.config.js` `redirects`) so existing bookmarks/Slack links don't 404.

## A1.3 — Segment-aware Overview (replaces Section 4)

### Backend contract confirmed (verified 2026-05-26)

Endpoint: `GET /admin/costs/top-users?segment={all|savameta|external|anonymous}&limit=...&from=...&to=...`
- Backward compat: `segment` defaults to `all`.
- Tested all 4 segment values against deployed backend (`lumilink-be-feat-read-apis.alex-defikit.workers.dev`) — returned correctly filtered users in each case.
- Reference: `docs/2026-05-26-lumilink-be-api-gaps-for-dashboard.md` § F1.

### Structure (top to bottom)

1. **Page header** — title `Overview` + subtitle `{segment label} · {period label}` · Refresh CTA + period chip on right.
2. **Segment + Period bar** — `<SegmentTabs>` (All / Savameta / External / Anonymous) on left, `<PeriodChip>` on right. Selection drives all data below.
3. **Primary KPI row (4 cards, always shown)**
   - Active Users (in selected segment + period)
   - Total Tokens
   - Total Cost (warning tone)
   - Avg / User (`totalCost / activeUsers`)
4. **Adoption KPI row (4 cards, shown only when `segment === "savameta"`)**
   - Total Eligible (from roster size)
   - Joined
   - Not Joined (danger tone)
   - Adoption Rate (success tone, percentage)
   - Data source: existing `/api/savameta/adoption/summary` route (already segment-aware = savameta-only by definition).
5. **Top-N preview table** — first 10 rows of `/admin/costs/top-users`, with a "View all →" link to `/users`.
6. **Footer hint** — auto-refresh countdown chip (existing behaviour).

### Empty / loading / error

- Loading: all KPI cards render their skeleton variant; preview table renders 5 skeleton rows.
- Adoption row in non-`savameta` segment: simply not rendered (no placeholder).
- Empty roster (savameta + 0 roster entries): adoption row shows `EmptyState` card spanning 4 columns: "Roster is empty — import employees in Settings → Roster".

## A1.4 — Users page (new, replaces "Top users table" on old Overview)

`src/app/users/page.tsx` is rewritten (current 17-line `<UserSearch expanded />` is deleted).

### Structure

1. **Header** — title `Users` + subtitle.
2. **Filter bar** — SegmentTabs · PeriodChip · sort dropdown (Cost / Tokens / Requests / Last Active) · search input.
3. **Sub-tabs** (only when `segment === "savameta"`):
   - `Top usage` (default) — current Top-N table
   - `Joined` — list of roster employees who joined (`/api/savameta/adoption/joined`)
   - `Never joined` — roster employees with no activity (`/api/savameta/adoption/never-joined`)
4. **Data table** (`ResponsiveTable`) — desktop table / mobile card list.

### Why sub-tabs are inside Users (not as separate sidebar entries)

Adoption joined/not-joined are a Savameta-specific slice of "users". Promoting them to top-level sidebar items would re-introduce the segment-as-product confusion this amendment is removing. They live as sub-tabs only when the segment context is `savameta`.

## A1.5 — Pages 17-20 (segment-aware page pattern, unchanged structure but new paths)

Section 5's "Universal Pattern" still applies to Activity / Engagement / Lifecycle / Triggers. Only changes:
- File paths: `src/app/{activity,engagement,lifecycle,triggers}/page.tsx` (not `/savameta/*`).
- All four already use `<SegmentTabs>` and segment-aware queries (`savameta-queries.ts`) — no logic change needed, just path + restyle.

## A1.6 — Roster grouping (Settings → Roster)

Replaces the flat sortable table with an **accordion grouped by department**.

### Structure

- Top bar: search input (filters across all groups) + total count + Import buttons (unchanged).
- For each department (sorted alphabetically):
  - `<details open>` accordion section.
  - Summary row: `▾ Department name  (N employees)`.
  - Body: same table columns (Email / Full Name / Source / Added / Actions) — Department column removed (it's the grouping key).
- Trailing group: `Unassigned` (rows where `department IS NULL`) — collapsed by default.

### Why Option A (accordion) over Option B (rowspan grouped table)

- Easier to skim with 10+ departments and 80+ employees.
- Collapsing irrelevant departments reduces visual noise.
- Search still works — filter at the row level, expand all matching groups, hide groups with 0 matches.
- Accessible by default via native `<details>` element.

### Data

No API changes — `/api/savameta/roster` already returns `department` field. Grouping happens client-side after fetch (small dataset, ~80 rows).

## A1.7 — Component inventory delta

Additions on top of original inventory:

| File | Change |
|---|---|
| `src/components/SegmentTabs.tsx` | Move from `src/components/savameta/SegmentTabs.tsx` to `src/components/SegmentTabs.tsx` (shared across pages now). Restyle to new tokens. |
| `src/app/users/page.tsx` | Rewrite — full Top-N table + sub-tabs (was: `<UserSearch expanded />`) |
| `src/app/activity/page.tsx` | New path; copy from `src/app/savameta/activity/page.tsx` with restyle |
| `src/app/engagement/page.tsx` | Same |
| `src/app/lifecycle/page.tsx` | Same |
| `src/app/triggers/page.tsx` | Same |
| `src/app/savameta/*` | Delete after redirects in place |
| `src/app/settings/roster/page.tsx` | Add department grouping (accordion layout) |
| `next.config.js` (or new `src/app/savameta/[...slug]/page.tsx`) | Add redirects: `/savameta/activity` → `/activity`, etc. |
| `src/app/api/admin/top-users/route.ts` | Forward new `segment` query param to backend |

Removals:

| File | Reason |
|---|---|
| `src/app/savameta/adoption/page.tsx` | Folded into Overview as conditional KPI row + Users sub-tabs |
| `src/components/savameta/SegmentTabs.tsx` | Moved to shared location |
| (existing) old `/users` content | Replaced (not removed — file rewritten) |

## A1.8 — Constraints reaffirmed

- No new API endpoints — Amendment 1 uses only `?segment=` (already deployed) + existing savameta endpoints.
- Adoption page disappears entirely as a route. Existing `/savameta/adoption` redirects to `/?segment=savameta`.
- All segment definitions live in **one place** (`src/lib/segment.ts` — extracted from `savameta-queries.ts`) so the FE label and BE filter stay in sync.

## A1.9 — Open questions in this amendment

None — user approved Option 3 (sidebar) + Option A (roster) + folding adoption into Overview.

---

**End of Amendment 1.** Sections 4 and 5 above are superseded by A1.3–A1.6. Section 2 (Layout/responsive), Section 3 (StatCard), and Section 1 (Visual Language) still apply as-is.
