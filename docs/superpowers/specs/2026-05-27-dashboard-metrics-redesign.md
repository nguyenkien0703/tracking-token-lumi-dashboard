# LumiPulse Dashboard — Metrics & UI Redesign Spec
**Date:** 2026-05-27  
**Scope:** Full dashboard redesign — metrics, UI consistency, time filter  
**Stack:** Next.js 14 App Router + TypeScript + Tailwind + Recharts (existing)

---

## 1. Context & Problem

Dashboard hiện tại nhận feedback từ reviewer:
- Trông như trang web thường, không phải analytics dashboard chuyên nghiệp
- Thiếu metrics quan trọng: Turns, Cache write/hit/saving, Burn rate, Sessions
- Naming không đúng chuẩn LLM: "Prompt Tokens" → "Input Tokens", "Requests" → "Turns"
- Style inconsistency: nhiều component dùng hard-coded `slate-700/800` thay vì design tokens
- Chart thiếu Y-axis values — không đọc được giá trị
- Hai `StatCard` versions song song (legacy + mới)

---

## 2. Metrics Taxonomy

### 2.1 Metrics cho 1 Professional LLM Cost Tracking Dashboard

| Category | Metric | Source | Status |
|---|---|---|---|
| **Token** | Input Tokens | `totalPromptTokens` | ✅ có, rename |
| **Token** | Output Tokens | `totalCompletionTokens` | ✅ có, rename |
| **Token** | Total Tokens | `totalTokens` | ✅ có |
| **Token** | Cache Write Tokens | `cache_creation_input_tokens` | 🔴 BE pending |
| **Token** | Cache Hit Tokens | `cache_read_input_tokens` | 🔴 BE pending (session/user level) |
| **Cost** | Total Cost (USD) | `totalCostUsd` | ✅ có |
| **Cost** | Avg Cost / Turn | `totalCostUsd / requestCount` | 🟡 tính FE |
| **Cost** | Cache Saving ($) | `cacheHit × 90% × input_rate` | 🔴 BE pending |
| **Activity** | Turns | `requestCount` | ✅ có, rename |
| **Activity** | Sessions | count of sessions | 🟡 thêm card FE |
| **Activity** | Burn Rate (tok/hr) | `totalTokens / session_duration_hrs` | 🟡 tính FE từ `firstTrackedAt`/`lastTrackedAt` |
| **Trend** | 7d vs prev 7d comparison | 2× `getUserCost()` calls với date range khác nhau | 🟡 FE làm được |
| **Trend** | Cost/token breakdown theo ngày | group `getHistory()` entries by `createdAt` date | 🟡 FE làm được |
| **Alert** | Vượt ngưỡng cá nhân | so median 30d của chính user, threshold cố định (2x) | 🟡 FE làm được |

Legend: ✅ Đang có | 🟡 FE làm được ngay | 🔴 Cần BE

### 2.2 Turn-level metrics (session detail page)

| Metric | Field | Status |
|---|---|---|
| Role | `role` | ✅ có |
| Input Tokens | `totalPromptTokens` | ✅ có, rename |
| Output Tokens | `totalCompletionTokens` | ✅ có, rename |
| Cache Hit Tokens | `cacheReadTokens` | 🟡 field đã có trong `MessageCostEntry` type, chỉ cần hiển thị |
| Cache Write Tokens | — | 🔴 BE pending |
| Cost | `totalCostUsd` | ✅ có |
| Model | `model` | ✅ có trong `MessageCostEntry` |

---

## 3. UI/UX Design Decisions

### 3.1 Time Filter — Period pills + date range picker
- Vị trí: **topbar** (sticky, luôn hiển thị)
- Pills: `Today` | `Last 7d` | `Last 30d` | `This month`
- Date range picker: từ ngày → đến ngày (custom range)
- Behavior: pills và date picker sync — chọn pill thì update date picker, và ngược lại

### 3.2 Chart — Dual Y-axis với daily breakdown
- Data source: `getHistory(userId, from, to)` → group entries by `createdAt.slice(0,10)`
- Trục Y trái: Token values (0 → max, format `240k`)
- Trục Y phải: Cost USD (0 → max, format `$0.30`)
- Tooltip khi hover: hiển thị date + token + cost
- Grid lines: horizontal 4 lines, vertical theo date points
- Lines: Token = solid blue `#3B82F6`, Cost = dashed green `#10B981`

### 3.3 7d vs Prev 7d Comparison (delta trên Summary Cards)
- Gọi 2 API calls song song khi period = "Last 7d":
  - Current: `getUserCost(userId, today-7d, today)`
  - Previous: `getUserCost(userId, today-14d, today-7d)`
- Hiển thị delta `↑ 12.4% vs prev period` trên card Total Tokens và Total Cost

### 3.4 Alert ngưỡng cá nhân
- Lấy `getHistory(userId, today-30d, today)` → group by date → tính median cost/ngày
- Nếu cost hôm nay > 2× median → hiển thị warning badge trên card Total Cost
- Threshold: 2x median (hardcoded, có thể config sau)

### 3.5 Summary Cards Layout
**Row 1 — Token Metrics (4 cards):**
Total Tokens | Input Tokens | Output Tokens | Total Cost

**Row 2 — Activity & Cache (4 cards):**
Turns | Sessions | Avg Cost/Turn | Cache Saving (hiển thị $0.00 nếu BE chưa có)

### 3.6 Session Table Columns (theo thứ tự)
`#` | `Title` | `Turns` | `Input Tokens` | `Output Tokens` | `Cache Write` | `Cache Hit` | `Saving ($)` | `Burn Rate` | `Cost` | `Created At`

- Columns có data ngay: Turns, Input Tokens, Output Tokens, Cost, Created At
- Columns hiển thị `0`: Cache Write, Cache Hit, Saving ($)
- Columns tính FE: Burn Rate (từ `firstTrackedAt`/`lastTrackedAt`)

### 3.7 Design System Consistency
- Migrate tất cả hard-coded `slate-700/800/900` → `bg-surface`, `border-border-default`, `text-text-primary/secondary/muted`
- Xóa `StatCardLegacy` — chỉ dùng `StatCard` (mới)
- Design tokens đã có trong `globals.css` — không cần thêm dependency mới

---

## 4. Technical Decisions

### Chart Library
Giữ **Recharts** (đã có, không thêm dependency). Cấu hình:
- `ComposedChart` với `Line` + `YAxis` (left) + `YAxis yAxisId="cost"` (right)
- `Tooltip` custom component hiển thị cả 2 giá trị
- `ResponsiveContainer` width="100%"
- Data prep: FE group `HistoryEntry[]` by date, sum tokens + cost per day

### No new npm packages
Tất cả thay đổi dùng stack hiện tại: Recharts + Tailwind + design tokens.

---

## 5. Out of Scope (Phase 2 — chờ BE)

Chỉ còn **1 nhóm** thực sự cần BE:
- Cache Write/Hit aggregate lên session/user level — BE cần `SUM(cache_creation_input_tokens)` và `SUM(cache_read_input_tokens)` trong response `UserSessionEntry` và `UserCostSummary`
- Cache Saving ($) — phụ thuộc vào cache aggregate ở trên

---

## 6. Files Affected

| File | Thay đổi |
|---|---|
| `src/types/index.ts` | Thêm `cacheWriteTokens?`, `cacheHitTokens?`, `cacheSavingUsd?` vào `UserSessionEntry` và `UserCostSummary` (nullable) |
| `src/components/DateRangePicker.tsx` | Thêm period pills (Today/7d/30d/Month) tích hợp, sync với date input |
| `src/components/TokenLineChart.tsx` | Refactor: nhận `DailyEntry[]`, thêm dual Y-axis, tooltip, grid lines |
| `src/components/SessionTable.tsx` | Thêm 5 cột mới, rename 3 cột, tính burn rate |
| `src/components/StatCard.tsx` | Thêm `warning` tone cho alert state |
| `src/components/StatCardLegacy.tsx` | Xóa file |
| `src/app/users/[userId]/page.tsx` | Thêm 2 cards, rename labels, 7d comparison, daily chart data, alert logic |
| `src/app/sessions/[sessionId]/page.tsx` | Migrate StatCardLegacy → StatCard, rename labels, hiển thị cache hit |
| `src/lib/api.ts` | Thêm helper `getUserCostComparison()` gọi 2 API calls song song |

---

## 7. Constraints

- Không thêm npm package mới
- Cache columns hiển thị `0` / `$0.00` nếu BE chưa có data — không bỏ trống, không ẩn
- Burn rate: nếu `firstTrackedAt === lastTrackedAt` → hiển thị `—`
- 7d comparison delta chỉ hiển thị khi period = "Last 7d" (không show khi custom range)
- Alert chỉ hiển thị khi có đủ 30d history data (ít hơn 7 ngày data thì bỏ qua)
- Tất cả thay đổi visual phải dùng design tokens từ `globals.css`
