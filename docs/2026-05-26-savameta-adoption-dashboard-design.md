# Savameta Adoption Dashboard — Design

**Date:** 2026-05-26
**Owner:** AnDT (DevOps)
**Stakeholders:** Anh Ban (request), Chị BA (functional requirements), Dev `lumilink-be` (external dep)
**Status:** Draft — pending review
**Approach:** Extend existing repo `tracking-token-lumi-dashboard` (NOT new repo)

---

## 1. Problem statement

Sava Meta có ~80 nhân sự nội bộ. Anh Ban yêu cầu dashboard để track adoption của LumiAI cho team nội bộ. Chị BA đã định nghĩa danh sách metrics cụ thể chia 2 nhóm:

**Adoption (lifecycle / funnel):**
- Adoption rate = `joined / eligible`
- Active user (7d) = users với ≥1 conversation trong 7 ngày
- Lifecycle buckets: Active (≤7d) / At-risk (8-30d) / Dormant (>30d)
- Never-joined = `eligible - joined`
- New joiners by release = users có `firstSeenAt` trong release window

**Engagement & Quality:**
- Conversations, Turns/convo
- Median TTV, Median TTR, Resolution rate (defer — BA chưa định nghĩa)
- Token in/out, Cache hit rate
- Cost/active user

Anh Ban reject GA4 vì 80 user quá ít. Data nằm trong D1 production của `lumilink-be`, expose qua admin API tại `lumilink-api.defikit.net`.

---

## 2. Approach: Extend existing repo

Repo `tracking-token-lumi-dashboard` (Next.js 14 full-stack, Postgres, Docker, VPS) đã có:
- Auth + middleware (shared password)
- Sync worker (API → Postgres)
- Proxy gateway
- AppShell + Sidebar
- Tab Overview hiện tại (cost & token tracking)

→ Extend repo này bằng cách add 5 tabs mới dưới namespace `/savameta/*`. **KHÔNG tạo repo riêng** vì:
- Data layer trùng (cùng API, cùng Postgres)
- Auth/sync/Docker pattern trùng
- 1 dashboard tổng hợp dễ maintain hơn 2 dashboard riêng
- User own toàn bộ infra → không có ownership conflict

---

## 3. Out of scope (Phase 1)

| Item | Lý do defer |
|------|-------------|
| TTV / TTR / Resolution Rate logic | Chị BA chưa định nghĩa. Phase 1 chỉ làm placeholder UI |
| Cost/resolution, $ saved nhờ cache | Phụ thuộc Resolution definition + cần pricing table từ bên thứ 3 |
| Action automation (auto send DM/email/survey) | Phase 2 — Phase 1 chỉ export CSV |
| Popup share convo trong `lumilink-fe` | Phase 2 — không phải dashboard scope |
| Survey tool integration | Phase 2 — BA tự chọn tool |
| Real-time webhook | Chấp nhận lag 5-15 phút (cron sync) |
| GA4 integration | Anh Ban đã reject |

---

## 4. Architecture overview

```
┌──────────────────────┐         ┌──────────────────────┐
│  lumilink-be (prod)  │         │  Roster source       │
│  Cloudflare Worker   │         │  (textarea / CSV)    │
│  D1 database         │         └──────────┬───────────┘
└──────────┬───────────┘                    │
           │ Admin HTTP API                 │
           │ /admin/costs/top-users (EXTEND)│
           │ /api/v1/normal-mode/costs/...  │
           ▼                                ▼
┌──────────────────────────────────────────────────────┐
│  tracking-token-lumi-dashboard (Next.js 14)         │
│  (EXISTING REPO — extend, không build mới)          │
│                                                      │
│  ┌────────────────┐  ┌──────────────────┐           │
│  │  Sync worker   │→ │ Postgres (local) │           │
│  │  (existing)    │  │  - history_entries│ existing │
│  │                │  │  - users         │ existing  │
│  │                │  │  - sync_state    │ existing  │
│  │                │  │  - employee_roster│ NEW      │
│  │                │  │  - releases      │ NEW       │
│  └────────────────┘  └──────────────────┘           │
│                                                      │
│  Routes:                                             │
│  - /                  (existing Overview)            │
│  - /sessions/...      (existing)                     │
│  - /users/...         (existing)                     │
│  - /settings          (existing)                     │
│  - /savameta/adoption          NEW                   │
│  - /savameta/engagement        NEW                   │
│  - /savameta/activity          NEW                   │
│  - /savameta/lifecycle         NEW                   │
│  - /savameta/triggers          NEW                   │
│  - /settings/roster            NEW                   │
│  - /settings/releases          NEW                   │
└──────────────────────────────────────────────────────┘
           │
           ▼
   Docker container on VPS (existing deployment)
   Domain: lumi-tracking.defikit.net (existing)
```

---

## 5. Sidebar layout

```
┌─────────────────────────────┐
│  Lumi Token Dashboard       │
├─────────────────────────────┤
│  COST TRACKING              │
│  • Overview                 │ ← existing
│  • Sessions                 │ ← existing
│  • Users                    │ ← existing
│                             │
│  SAVAMETA ADOPTION          │ ← NEW section
│  • Adoption                 │
│  • Engagement & Quality     │
│  • Activity Trends          │
│  • Lifecycle                │
│  • Triggers                 │
│                             │
│  SETTINGS                   │
│  • Roster                   │ ← NEW
│  • Releases                 │ ← NEW
│  • Sync Status              │ ← existing
│  • Admin                    │ ← existing
└─────────────────────────────┘
```

---

## 6. Tab specifications

### Tab 1: `/savameta/adoption`

**Stat cards:**
- Total Eligible (X) — từ `employee_roster`
- Joined (Y) — users có ≥1 entry trong `history_entries`
- Adoption Rate = `Y/X * 100%`
- Active 7d (Z) — users có entry trong 7 ngày gần nhất
- Never-Joined (X - Y)

**Section: New Joiners by Release**
- Bảng so sánh các releases:
  | Release | Window | New Joiners | Velocity (joiners/day) |
  |---------|--------|-------------|------------------------|
  | Release 1 | 2026-03-22 → 2026-05-26 | 35 | 0.53 |
  | Release 2 | 2026-05-27 → ongoing | 0 (just started) | — |

**Table: Joined Users**
- Email, Name, First Seen At, Last Active At, Days Since Last Activity, Total Sessions, Total Cost
- Sort, search, filter by lifecycle bucket

**Table: Never-Joined Users**
- Email, Name, Department, Added to roster at
- Export CSV

### Tab 2: `/savameta/engagement` — Engagement & Quality

**Stat cards:**
- Total Conversations (savameta only, date range)
- Avg Turns/Conversation
- Total Tokens (in/out)
- Cache Hit Rate = `cacheReadTokens / promptTokens * 100%`
- Cost/Active User

**Deferred metrics (placeholder UI, label "Awaiting BA definition"):**
- Median Time to Value
- Median Time to Resolution
- Resolution Rate

→ Render as disabled stat cards with tooltip explaining defer reason

**Table: Per-User Engagement**
- Email, Sessions, Avg turns/session, Total tokens, Cache hit %, Total cost, Last model used
- Drill-down: Click user → list sessions → reuse existing session detail page

### Tab 3: `/savameta/activity` — Activity Trends

**Charts (Recharts):**
- DAU line chart (30/90 days, savameta only)
- WAU rolling 12 weeks
- MAU rolling 12 months
- Stickiness ratio: DAU/MAU per day
- Overlay toggle: "Show anonymous activity" (userId=null entries) — separate line for audit purpose

### Tab 4: `/savameta/lifecycle`

**Lifecycle definitions (chị BA):**
- **Active** = days since last conversation ≤ 7
- **At-risk** = 8 to 30 days
- **Dormant** = > 30 days

**UI:**
- Donut chart with 3 buckets (count + %)
- Click bucket → table of users in bucket
- Each table: Email, Last Active At, Days Since, Total Sessions, Total Cost
- Export CSV per bucket

### Tab 5: `/savameta/triggers` — Detection & Export

Dashboard chỉ DETECT events + export CSV. Action thật chị BA tự làm.

**Widget 1: Returning Users (last 24h)**
- Definition: savameta user inactive ≥ 7 days, có message mới trong 24h qua
- Columns: Email, Previous Last Active, New First Active, Gap Duration
- Action: Export CSV

**Widget 2: First Value Achievers (last 7d)** — proposed definition
- Definition: savameta user lần đầu đạt 5+ messages trong 1 session, trong 7 ngày qua
- Columns: Email, Session ID, Date achieved, Total turns in session
- Action: Export CSV → chị BA xin share convo

**Widget 3: First Resolution Achievers** — **DEFER**
- Phụ thuộc Resolution definition của BA
- Placeholder UI: "Awaiting BA definition"

---

## 7. Settings

### `/settings/roster`

**Mode A — Textarea paste:**
```
[textarea]
tamnt@savameta.com
linhtd@savameta.com
...
[Save] → upsert by email (lowercase normalize)
```

**Mode B — CSV upload:**
- Format: `email,full_name,department`
- Header required
- Validate `email` ends with `@savameta.com` → warn nếu domain khác, vẫn cho save với confirm dialog
- Show diff preview: `Added X / Updated Y / Unchanged Z`

**Mode C — Manage existing:**
- Table list current roster
- Edit / delete individual rows
- Search by email

### `/settings/releases`

**UI:** Form CRUD release windows

| Field | Type | Required |
|-------|------|----------|
| `name` | text | Yes (unique) |
| `startDate` | date | Yes |
| `endDate` | date | No (null = ongoing) |
| `notes` | textarea | No |

**Validation:**
- `endDate >= startDate` if provided
- Windows can overlap (no constraint enforced) — admin's responsibility

**Initial data (seed migration):**
- Release 1: name="Release 1", start=2026-03-22, end=2026-05-26
- Release 2: name="Release 2", start=2026-05-27, end=null

---

## 8. Data model

### New tables

```sql
-- Roster of eligible employees
CREATE TABLE employee_roster (
  email TEXT PRIMARY KEY,                  -- normalized lowercase
  full_name TEXT,
  department TEXT,
  source TEXT,                              -- 'csv_upload' | 'textarea' | 'manual'
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by TEXT
);

CREATE INDEX idx_roster_email_lower ON employee_roster (LOWER(email));

-- Release windows for "New joiners by release" metric
CREATE TABLE releases (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,                            -- null = ongoing
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_releases_start ON releases (start_date);
```

### Tables reused (existing schema)
- `history_entries` — synced from API
- `users` — cached from `/user/{id}` API
- `sync_state` — sync tracking

### Schema change to `users` (existing table)
Add column `first_seen_at TIMESTAMPTZ` — computed as `MIN(createdAt)` of user's entries in `history_entries`. Maintain via:
- Trigger on `history_entries` INSERT: update `users.first_seen_at = LEAST(first_seen_at, NEW.createdAt)` (skip if exists & older)
- One-time backfill query when migrating: `UPDATE users SET first_seen_at = (SELECT MIN(createdAt) FROM history_entries WHERE userId = users.userId)`

OR: dev `lumilink-be` thêm `firstSeenAt` vào response của `/admin/costs/top-users` — sync về cache.

### Derived views

```sql
-- savameta users only (no anonymous)
CREATE VIEW v_savameta_users AS
SELECT u.*
FROM users u
WHERE LOWER(u.email) LIKE '%@savameta.com'
  AND u.email NOT LIKE '%@anon.lumilink';

-- adoption status per roster entry
CREATE VIEW v_adoption_status AS
SELECT r.email AS roster_email,
       r.full_name,
       r.department,
       u."userId",
       u."firstName" || ' ' || u."lastName" AS user_name,
       u.first_seen_at,
       (SELECT MAX("createdAt") FROM history_entries h WHERE h."userId" = u."userId") AS last_active_at,
       CASE WHEN u."userId" IS NULL THEN 'not_joined' ELSE 'joined' END AS status
FROM employee_roster r
LEFT JOIN v_savameta_users u ON LOWER(u.email) = LOWER(r.email);

-- lifecycle bucket assignment
CREATE VIEW v_lifecycle_buckets AS
SELECT *,
       CASE
         WHEN last_active_at IS NULL THEN 'never_joined'
         WHEN last_active_at >= NOW() - INTERVAL '7 days' THEN 'active'
         WHEN last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
         ELSE 'dormant'
       END AS bucket
FROM v_adoption_status;
```

---

## 9. New API routes (Next.js)

All under `src/app/api/savameta/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `roster/route.ts` | GET/POST/DELETE | CRUD roster |
| `roster/import/route.ts` | POST | Bulk CSV import |
| `releases/route.ts` | GET/POST/PATCH/DELETE | CRUD releases |
| `adoption/summary/route.ts` | GET | Stat cards data |
| `adoption/joined/route.ts` | GET | List joined users |
| `adoption/never-joined/route.ts` | GET | List never-joined users |
| `adoption/by-release/route.ts` | GET | Joiners grouped by release |
| `engagement/summary/route.ts` | GET | Engagement stats |
| `engagement/per-user/route.ts` | GET | Per-user engagement table |
| `activity/timeseries/route.ts` | GET | DAU/WAU/MAU data |
| `lifecycle/buckets/route.ts` | GET | Bucket counts + user lists |
| `triggers/returning/route.ts` | GET | Returning users last 24h |
| `triggers/first-value/route.ts` | GET | First value achievers last 7d |
| `triggers/export/route.ts` | GET | CSV export endpoint |

---

## 10. Components

New components under `src/components/savameta/`:
- `RosterTable.tsx`, `RosterInput.tsx`, `RosterCsvUpload.tsx`
- `ReleaseForm.tsx`, `ReleaseTable.tsx`
- `AdoptionStatCards.tsx`, `LifecycleDonut.tsx`
- `EngagementTable.tsx`, `CacheHitRateBadge.tsx`
- `TriggerWidget.tsx`, `ExportCsvButton.tsx`

Modify existing:
- `Sidebar.tsx` — add 2 sections "SAVAMETA ADOPTION" + new Settings items

---

## 11. External dependencies

| Dependency | Owner | Status | Blocker level |
|------------|-------|--------|---------------|
| `lumilink-be` extend `/admin/costs/top-users` (xem `jira-spec-lumilink-be-top-users-endpoint.md`) | Dev `lumilink-be` | Pending Jira ticket | **Medium** — Phase 1 fallback: gọi endpoint hiện tại + filter client-side |
| Roster CSV/list từ HR | AnDT | Pending | **Low** — chỉ block Tab Adoption |
| TTV/TTR/Resolution definitions | Chị BA | Pending | **Low** — defer, render placeholder UI |
| Resolution status per session | `lumilink-be` (sau khi BA define) | Phase 2 | Defer |
| Pricing table cho cache savings | `lumilink-be` | Phase 2 | Skipped — bỏ metric này |

---

## 12. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Add tables vào DB cũ break migration của repo | Idempotent migrations (`CREATE TABLE IF NOT EXISTS`), test trên staging trước |
| Refactor `sync.ts` raise `MAX_RECORDS` có thể slow sync | Test với production data (807 entries) trước; raise dần |
| Sidebar 9 items có thể quá dài | Collapsible sections; mobile responsive |
| Production data còn nhỏ (807 entries hiện tại) → metrics chưa rõ pattern | Set expectations với anh Ban / chị BA |
| `userId=null` anonymous noise | Tách rõ trong Activity Trends overlay, filter mặc định khỏi savameta tables |
| Bị break feature cũ (Overview) khi extend | Smoke test manual sau mỗi PR; e2e test cho Overview route |
| Release windows overlap → New joiners count gấp đôi | Doc rõ: 1 user chỉ count vào release đầu tiên match (theo `firstSeenAt`) |

---

## 13. Implementation phases

**Phase 1A — Foundation (~3 days):**
- Migration: add `employee_roster`, `releases` tables + views
- Sidebar update with new sections
- Settings → Roster CRUD (textarea + CSV)
- Settings → Releases CRUD with seed data
- Raise `MAX_RECORDS` to 200000

**Phase 1B — Adoption + Lifecycle (~3 days):**
- `/savameta/adoption` page + APIs
- `/savameta/lifecycle` page + APIs
- New joiners by release section

**Phase 1C — Engagement + Activity (~3 days):**
- `/savameta/engagement` page + APIs (skip TTV/TTR/Resolution UI as placeholder)
- `/savameta/activity` page + APIs (DAU/WAU/MAU charts)

**Phase 1D — Triggers (~2 days):**
- `/savameta/triggers` page + APIs
- CSV export utility
- Returning users widget + First value widget

**Phase 1E — Polish & ship (~1 day):**
- Manual smoke test all routes (incl. existing Overview)
- Deploy to VPS
- Demo to anh Ban + chị BA

**Total estimate: ~2 weeks** (vs 1 month nếu làm repo riêng)

**Phase 2 (future, after BA defines):**
- TTV/TTR/Resolution logic
- First resolution trigger widget
- Cost/resolution metric
- Action automation
- Workspace OAuth (nếu policy mở)

---

## 14. Success criteria

- Anh Ban xem được Adoption Rate + Active 7d + Lifecycle buckets cho 80 nhân sự
- Chị BA export được CSV "never-joined", "returning users", "first value achievers"
- "New joiners by Release" so sánh được Release 1 vs Release 2
- Cache Hit Rate visible cho engineering tracking
- Dashboard cũ (Cost & Token tabs) KHÔNG regression
- Sync vẫn chạy ổn định ≤ 5 phút lag
- Deploy không downtime
