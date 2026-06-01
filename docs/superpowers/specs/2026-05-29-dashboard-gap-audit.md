# LumiPulse Dashboard — Gap Audit vs Research Report

**Date:** 2026-05-29
**Author:** AnDT (DevOps)
**Scope:** So sánh từng metric trong `2026-05-29-token-tracking-dashboard-metrics-research.md` với code thực tế đang render trên dashboard.
**Phương pháp:** Đọc trực tiếp từng page file (`src/app/**/page.tsx`) — không dựa vào memory.

---

## 0. TL;DR — Gap thực tế nhỏ hơn research report dự đoán

Sau khi đọc code, dashboard hiện tại **đầy đủ hơn** estimate ban đầu trong research report:

| Estimate báo cáo | Thực tế sau audit |
|---|---|
| "~70% cost metrics có" | **~75-80% có**, đặc biệt nhóm Volume + Per-model + Trend khá đầy đủ |
| Cache hit rate ❌ | ✅ **Engagement page** đã có (`cacheHitRate`, `totalCacheReadTokens`) |
| Cost per DAU ❌ | ✅ **Engagement page** đã có (`costPerDailyActiveUser7d`) |
| Median turns/convo ❌ | ✅ **Engagement page** đã có (`medianTurnsPerConvo`) |
| TPM ❌ | ⚠️ **Session detail** có Burn Rate (tokens/hr) — global TPM rolling thì chưa |
| Heavy hitters threshold | ⚠️ `computeAlertThreshold` đã apply lên User detail (đổi tone card "Total Cost") |
| Login + security | ✅ Google OAuth + admin zone middleware đã có |

**Top 5 gap thực sự đáng làm (sau audit):**

1. **Cache visualization khi BE bật** — write/read split, ratio %, write amortization, composition stacked bar.
2. **Budget tracking** — set $ ceiling, % used, projected EOM, days until exhausted.
3. **Cost spike alert trang riêng** — list "ai vượt threshold", surface logic `computeAlertThreshold` ra UI.
4. **Hourly breakdown** + **WoW/MoM split** — anh đã yêu cầu trong brief gốc.
5. **Cost per session canonical** + **Input vs Output cost ratio** — 2 KPI FinOps chuẩn còn thiếu.

---

## 1. Mapping từng metric — kết quả audit chi tiết

Status legend: ✅ rendered · ⚠️ partial / derive được · ⏳ BE pending (UI placeholder) · ❌ missing

### 1.1 Volume metrics

| Metric | Render ở đâu | Status |
|---|---|---|
| Total tokens | `app/page.tsx:280` (Overview), `engagement:184`, `user/[id]:166`, `session/[id]:162` | ✅ |
| Input/prompt tokens | `engagement:200`, `user/[id]:174`, `session/[id]:163` | ✅ |
| Output/completion tokens | `engagement:205`, `user/[id]:181`, `session/[id]:164` | ✅ |
| Total requests / turns | `engagement:175` (totalTurns), `user/[id]:203`, `session/[id]:172` | ✅ |
| Total sessions | `user/[id]:210` ("Sessions" card), `engagement:170` (conversations) | ✅ |
| Total active users | Overview top users count, `engagement:192` (dailyActive7d) | ✅ |
| Avg tokens / request | — derive được từ totalTokens / requestCount, **chưa render KPI riêng** | ⚠️ |
| Avg tokens / session | — derive được, **chưa render KPI riêng** | ⚠️ |
| Avg tokens / user | — derive được, **chưa render KPI riêng** | ⚠️ |
| Median turns / convo | `engagement:180` | ✅ |

**Verdict:** Nhóm Volume đầy đủ. Chỉ thiếu 3 KPI derive (avg tokens / req|sess|user) — effort cực thấp nếu thêm.

---

### 1.2 Cost metrics

| Metric | Render ở đâu | Status |
|---|---|---|
| Total cost | `page.tsx:281`, `engagement:185`, `user/[id]:187`, `session/[id]:165` | ✅ |
| Input cost (USD) | — có raw trong API response, **chưa split KPI** | ⚠️ |
| Output cost (USD) | — có raw trong API response, **chưa split KPI** | ⚠️ |
| Input vs Output cost ratio | — | ❌ |
| Cost per request | `user/[id]:217` (Avg Cost/Turn), `session/[id]:177` | ✅ |
| Cost per session | — derive được, **chưa render KPI canonical** | ❌ |
| Cost per user | `page.tsx:282` (Overview "Avg/User") | ⚠️ chỉ trên Overview |
| Cost per DAU | `engagement:190` (Cost / Daily Active User 7/7d) | ✅ |
| Cost per 1000 tokens | — | ❌ |
| Cost per 1000 requests | — | ❌ |

**Verdict:** Có 3 critical FinOps metric chưa có canonical KPI: **cost per session**, **input/output cost ratio**, **cost per 1K tokens**. Mỗi metric chỉ là 1 card thêm.

---

### 1.3 Per-model breakdown

| Metric | Render ở đâu | Status |
|---|---|---|
| Tokens per model | `session/[id]:255` (Models Used card) | ✅ |
| Cost per model | `session/[id]:258` + ModelBarChart trong user/[id] | ✅ |
| Requests per model | `session/[id]:252` (turn count) | ✅ |
| Model usage share % | `session/[id]:233-264` (progress bar per model) | ✅ |
| Cost per 1K tokens (per model) | — | ❌ |
| Most expensive model | implicit (sorted by cost desc) | ✅ |
| Most used model | implicit | ✅ |

**Verdict:** Per-model nhóm này khá đầy đủ. Thiếu duy nhất "effective rate per model" (cost / 1K tokens) — handy nhưng không critical.

---

### 1.4 Cache metrics

| Metric | Render ở đâu | Status |
|---|---|---|
| Cache write tokens | `types/index.ts` có field, BE chưa expose | ⏳ |
| Cache read/hit tokens | `engagement:210` (đã render!) | ✅ |
| Cache read ratio % | `engagement:215` (cacheHitRate, đã render!) | ✅ |
| Cache hit rate over time | — | ❌ |
| Cache write cost | — | ❌ |
| Cache read cost | — | ❌ |
| Cache saving USD | `user/[id]:225` + `session/[id]:191` ("BE pending" badge) | ⏳ |
| Write amortization (read_tokens / write_tokens) | — | ❌ |
| Cache composition (stacked) | — | ❌ |

**Verdict:** Engagement page đã có 2 metric quan trọng nhất (cache read tokens + hit rate). Khi BE bật cache write — build composition stacked + write amortization + saving USD trend là đủ chuẩn Anthropic dashboard.

---

### 1.5 Trend & time-series

| Chart | Render ở đâu | Status |
|---|---|---|
| Daily cost trend | `user/[id]:241` (TokenLineChart) | ✅ |
| Daily tokens trend | `user/[id]:241`, `activity:201` (Daily Turns bar) | ✅ |
| Hourly cost (last 24h/7d) | — | ❌ |
| WoW comparison | — only "vs prev period" (generic) | ⚠️ |
| MoM comparison | — | ❌ |
| YoY | — | ❌ |
| Cumulative cost (current month) | — | ❌ |
| Projected cost (end of month) | — | ❌ |

**Verdict:** Daily granularity tốt. Thiếu **hourly + cumulative MTD + projected EOM** — 3 cái này là budget tracking layer.

---

### 1.6 Distribution — ai tốn nhiều

| Metric | Render ở đâu | Status |
|---|---|---|
| Top N users by cost | `page.tsx:296` (Overview top 10), `users/page.tsx` | ✅ |
| Top N users by tokens | `users/page.tsx` (sortable) | ✅ |
| Top N sessions by cost | — `user/[id]` có session list nhưng không rank toàn hệ thống | ❌ |
| p50/p90/p95/p99 cost per user | — | ❌ |
| Mean vs median cost per user | — | ❌ |
| Cost concentration (Gini / top 10%) | — | ❌ |
| Heavy hitters list | `lib/api.ts: computeAlertThreshold` (logic có), apply tại `user/[id]:191` (đổi tone card) | ⚠️ |

**Verdict:** Top N ranking đầy đủ. **Percentile + distribution** chưa có — đây là gap quan trọng để phát hiện outlier ("1 user dominates"). Heavy hitter logic đã có nhưng chỉ surface từng user, chưa có dashboard global "ai đang vượt".

---

### 1.7 Budget & forecast

| Metric | Render ở đâu | Status |
|---|---|---|
| Monthly budget ceiling | — | ❌ |
| Spent vs budget % | — | ❌ |
| Days remaining in cycle | — | ❌ |
| Avg daily spend (current month) | — | ❌ |
| Projected end-of-month cost | — | ❌ |
| Burn rate vs target | — | ❌ |
| Days until budget exhausted | — | ❌ |
| Per-user budget | — | ❌ |

**Verdict:** **Toàn bộ section này là gap.** Đây là layer CFO/CEO quan tâm nhất — sprint riêng.

---

### 1.8 Throughput / rate

| Metric | Render ở đâu | Status |
|---|---|---|
| TPM (tokens/min) — current rolling | — | ❌ |
| TPM peak last 24h | — | ❌ |
| RPM (requests/min) | — | ❌ |
| Tokens per day | `activity:201` (Daily Turns) + TokenLineChart | ✅ |
| % of TPM quota used | — | ❌ |
| **Session-level burn rate (tokens/hr)** | `session/[id]:184` ("Burn Rate" card) | ✅ |

**Verdict:** Burn rate đã có ở scope session — đủ cho 1 use case. Gap thực sự là **global TPM rolling** để phát hiện bot/abuse realtime.

---

### 1.9 Cost spike & anomaly

| Metric | Render ở đâu | Status |
|---|---|---|
| Daily spend vs 7-day avg | — | ❌ |
| Daily spend vs 30-day avg | — | ❌ |
| Threshold breach % (>150% avg alert) | — | ❌ |
| Rolling z-score (>3σ) | — `computeAlertThreshold` dùng median × 2, **không phải z-score** | ⚠️ |
| Per-user spike (today vs 30d median) | — logic có (`computeAlertThreshold`), chỉ render ở user detail page | ⚠️ |

**Verdict:** Có nửa logic (median × 2 cho từng user). Gap: (1) nâng cấp z-score, (2) build trang "Alerts" dedicated, (3) thêm system-wide spike (daily vs 7d/30d avg).

---

### 1.10 Segmentation & filters

| Filter | Render ở đâu | Status |
|---|---|---|
| Date range | `PeriodChip` (mọi page) | ✅ |
| Period preset (7d/30d/90d) | `PeriodChip` | ✅ |
| User segment (savameta/external/anonymous/all) | `SegmentTabs` (Overview, Users, Engagement) | ✅ |
| Per-user filter | `user/[userId]/page.tsx` | ✅ |
| Per-model filter | history API có `model` param, **UI chưa expose** | ⚠️ |
| Per-session filter | `session/[sessionId]/page.tsx` | ✅ |
| Per-feature/agent filter | — cần BE expose `feature_id` tag | ❌ |

**Verdict:** Segmentation đầy đủ ở mức user/session. Thiếu **model filter UI** (1 dropdown, low effort) và **feature_id tag** (cần BE, high effort).

---

## 2. Gap thực sự — đã sort lại theo impact

### P1 — High impact, build trước

| # | Gap | Effort | Lý do ưu tiên |
|---|-----|--------|-----|
| 1 | **Budget tracking layer** (monthly ceiling, spent %, projected EOM, days left, burn vs target) | Med | CFO/CEO ưu tiên cao nhất. Trả lời 2/5 câu của dashboard. |
| 2 | **Cost spike alert page** (list users vượt threshold, daily vs 7d/30d, z-score nâng cấp) | Low-Med | Logic đã có (`computeAlertThreshold`), chỉ build UI riêng. |
| 3 | **Cache visualization** (write/read split, ratio over time, write amortization, composition stacked, saving trend) | Low (khi BE bật) | Type sẵn, BE pending. Bật được ngay. |
| 4 | **Cost per session canonical** + **Input vs Output cost ratio** + **Cost per 1K tokens** | Low | 3 card KPI thêm vào Overview / Engagement. |

### P2 — Med impact

| # | Gap | Effort |
|---|-----|--------|
| 5 | **Hourly breakdown** chart (anh đã yêu cầu trong brief gốc) | Med (cần BE expose hourly aggregate) |
| 6 | **Global TPM/RPM rolling** (tokens/min last 5/15 min) | Med |
| 7 | **Cost distribution percentiles** (p50/p90/p95/p99 cost per user) | Low |
| 8 | **WoW / MoM comparison** riêng (không gộp vs prev period) | Low |
| 9 | **Cumulative cost MTD chart** + **Projected EOM** | Low |
| 10 | **Per-model filter UI** (dropdown trong /history page) | Low |

### P3 — Low impact, optional

| # | Gap | Effort |
|---|-----|--------|
| 11 | **Cost concentration** (Gini coefficient hoặc top 10% share) | Low |
| 12 | **Mean vs median cost per user split viz** | Low |
| 13 | **Top N sessions by cost** ranking page | Low |
| 14 | **Cost per feature/agent** | High (cần BE expose `feature_id`) |
| 15 | **Cost per 1K tokens per model** (effective rate) | Low |
| 16 | **Docs page** giải thích economic meaning (content section 5 của research report) | Low |

---

## 3. So sánh với 6 yêu cầu gốc của anh

| # | Yêu cầu gốc | Status sau audit |
|---|---|---|
| 1 | **Missing metrics** (turns, input/output, per-model, retry count, B-red, sessions) | ✅ Hầu hết đã có. Thiếu: retry count (không nằm trong scope cost), global TPM ("B-red"). |
| 2 | **Cache savings visualization** | ⏳ BE pending. UI placeholder sẵn. Khi BE bật → build Anthropic-style 3-metric: read ratio, composition, amortization. |
| 3 | **UI/UX upgrade** (breakdown theo giờ/phiên) | ⚠️ Phiên đã có (session detail). Theo giờ — chưa có. |
| 4 | **Login + permissions (highest priority)** | ✅ Đã xong. Google OAuth `@savameta.com` + admin zone middleware (`/settings`, `/admin`, `/api/admin`). |
| 5 | **Threshold analysis** (norm/median 7-30d + auto-alert) | ⚠️ `computeAlertThreshold` (median × 2 trên 30d) đã apply trên user detail (đổi tone card). Thiếu: trang Alerts dedicated, system-wide alert, email/Slack notification. |
| 6 | **Docs giải thích economic meaning** | ❌ Chưa có /docs page. Content section 5 của research report sẵn sàng paste. |

---

## 4. Đề xuất sprint order (revised)

Sau audit, recommend đổi thứ tự so với research report gốc:

| Sprint | Nội dung | Effort | Value |
|---|---|---|---|
| **1** | **Cost spike alert page** + nâng cấp z-score + system-wide alert | Low-Med | High — logic 80% đã có |
| **2** | **Budget tracking** (ceiling, % used, projected EOM, days left) | Med | Very High — CFO/CEO ask |
| **3** | **Cache viz** (đợi BE bật, sau đó build 3 metric Anthropic-style) | Low | High khi data có |
| **4** | **Hourly breakdown** + **Cumulative MTD** + **WoW/MoM** | Med | Med |
| **5** | **KPI nhỏ thêm** (cost per session, input/output ratio, cost per 1K, avg tokens/req\|sess\|user, distribution percentiles) | Low | Med |
| **6** | **Global TPM/RPM rolling** + per-model filter UI | Med | Med |
| **7** | **Docs page** (paste section 5 của research report) | Low | Med — onboarding BA/CFO |

**Đừng build all 1 PR.** Mỗi sprint = 1 PR riêng. Sprint 1+2 là 2 PR đem lại 70% value.

---

## 5. Hành động ngay

1. **Anh đọc file này**, confirm sprint order trên (hoặc đổi thứ tự nếu có ưu tiên khác).
2. Em mở **brainstorming riêng cho Sprint 1 (Cost spike alert page)** — vì logic đã sẵn, build nhanh, demo value sớm.
3. Song song, ping BE team về **cache write/read tokens** + **hourly aggregate endpoint** để Sprint 3 + 4 không bị block.

---
