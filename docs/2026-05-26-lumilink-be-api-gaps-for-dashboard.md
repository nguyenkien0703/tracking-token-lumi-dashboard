# LumiLink-BE Admin Read APIs — Gap Analysis for Adoption Dashboard

**Date:** 2026-05-26
**Author:** AnDT (DevOps)
**Audience:** lumilink-be team (Kiên + Tâm)
**Related PR:** [DefikitTeam/lumilink-be#5170 (`feat/read-apis`)](https://github.com/DefikitTeam/lumilink-be/pull/5170)
**Related spec:** `lumilink-be/docs/superpowers/specs/2026-05-26-admin-read-apis-design.md`

---

## 1. TL;DR

PR #5170 cover được ~70% nhu cầu của dashboard. Còn **3 gap** cần extend hoặc thêm endpoint mới để dashboard không phải tự maintain Postgres trung gian:

| # | Gap | Severity | Phase đề xuất |
|---|-----|----------|---------------|
| G1 | `metrics/summary.active*` định nghĩa "có ≥1 message trong window" — không phải **Daily Active N/N** (yêu cầu BA mới) | Medium | Phase 2 — extend |
| G2 | Không có endpoint **Returning Users** (idle ≥X ngày → quay lại trong window) | High | Phase 2 — new endpoint |
| G3 | Không có endpoint **First Value** (lần đầu user đạt ≥N turns trong 1 session) | High | Phase 2 — new endpoint |

Ngoài ra có **2 minor improvements** mong muốn để tối ưu (xem mục 5).

---

## 2. Bối cảnh

Dashboard `tracking-token-lumi-dashboard` track adoption của 80 nhân sự `@savameta.com`. Hiện đang **sync raw data về Postgres** (bảng `users`, `history_entries`, `employee_roster`) rồi tự query — vì các metric phức tạp (Daily Active 7/7d, Returning, First Value) cần raw activity timeline mà API hiện chưa expose.

5 endpoints trong PR #5170 sẽ giúp dashboard:
- Bỏ N+1 ở vòng lặp `/admin/costs/top-users` → `/user/{id}` (G0, đã giải quyết — không liệt kê ở đây).
- Lấy adoption per-user trong 1 call (`/admin/users/adoption`).
- Bulk lookup HR roster (`/admin/users/join-status`).
- Aggregate metrics có cache (`/admin/metrics/summary`).

Nhưng **5 endpoints chưa đủ** để bỏ hoàn toàn Postgres sync — 3 metric ở mục 1 buộc dashboard vẫn phải giữ raw timeline.

---

## 3. Gap chi tiết

### G1. "Daily Active N/N" metric

#### Current spec

`/admin/metrics/summary` trả `active7d`, `active30d`, `active90d`:

> "Active" = sent at least 1 user-side message in the window (last 7/30/90 days, relative to `now`, ignoring `from`/`to`).

#### Gap

BA mới định nghĩa **Daily Active 7/7d** = user có **≥1 chat message ở MỖI ngày** trong 7 ngày calendar gần nhất. Tức là 7/7 ngày liên tục đều có activity, miss 1 ngày → fail.

Số này nhỏ hơn nhiều so với "active7d" hiện tại. Dashboard cần cả 2:
- `active7d` (hiện có) — soft metric: "có quay lại trong tuần"
- `dailyActive7d` (cần thêm) — hard metric: "thành thói quen daily"

Cùng pattern, BA có thể yêu cầu `dailyActiveNd` cho N tùy chỉnh (3, 5, 14, 30) trong tương lai.

#### Đề xuất — Option A (preferred): extend `/admin/metrics/summary`

Thêm field vào response cho mỗi segment:

```json
{
  "savameta": {
    "active7d": 45,
    "active30d": 65,
    "dailyActive7d": 8,         // NEW: distinct days = 7 in last 7 days
    "dailyActive30d": 2          // NEW: distinct days = 30 in last 30 days
  }
}
```

**SQL pseudo (D1/SQLite):**
```sql
SELECT COUNT(*) FROM (
  SELECT userId
  FROM ChatMessage cm JOIN ChatSession cs ON cs.id = cm.chatSessionId
  WHERE cm.role = 'user'
    AND cm.createdAt >= datetime('now', '-7 days')
    AND cs.userId IN (<segment user ids>)
  GROUP BY cs.userId
  HAVING COUNT(DISTINCT DATE(cm.createdAt)) = 7
)
```

**Trade-off:** thêm 2 sub-query / segment × 3 segments = 6 queries. Đã có cache 5 phút nên acceptable.

#### Đề xuất — Option B: new endpoint `/admin/users/daily-active`

```
GET /admin/users/daily-active?windowDays=7&requiredDays=7&emailDomain=savameta.com
```

Trả list users thoả mãn (kèm số ngày active). Linh hoạt hơn nhưng tốn 1 endpoint cho trường hợp đặc biệt.

**Em đề xuất Option A** — extend summary, vì:
- Dashboard cần **count** (không cần list từng user thoả) → fit response shape của summary.
- Mở rộng tự nhiên metric đã có, không phá structure spec.
- Cache 5 phút auto cover.

---

### G2. Returning Users endpoint

#### Current spec

Không có.

#### Use case (Phase 1D dashboard)

Detect users **quay lại sau khi idle ≥7 ngày**, để BA outreach. Dashboard hiện tự compute bằng `LAG()` window function trên Postgres sync.

#### Đề xuất — new endpoint

```
GET /admin/users/returning
```

**Query params:**
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `idleThresholdDays` | int ≥ 1 | `7` | User phải idle ≥ N ngày |
| `windowDays` | int 1-30 | `1` | Quay lại trong N ngày gần nhất |
| `emailDomain` | string | — | Filter Savameta |
| `excludeAnonymous` | boolean | `true` | |
| `limit` | int 1-200 | `100` | |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 123,
        "email": "khoitt@savameta.com",
        "firstName": "Khôi", "lastName": "Trần",
        "previousActiveAt": "2026-04-07T08:20:00.000Z",
        "returnedAt": "2026-05-22T10:13:05.000Z",
        "idleDays": 45.1
      }
    ],
    "total": 3,
    "config": {
      "idleThresholdDays": 7,
      "windowDays": 1
    }
  }
}
```

**SQL pseudo:**
```sql
WITH activity_with_gap AS (
  SELECT
    cs.userId,
    cm.createdAt AS current_at,
    LAG(cm.createdAt) OVER (PARTITION BY cs.userId ORDER BY cm.createdAt) AS prev_at
  FROM ChatMessage cm JOIN ChatSession cs ON cs.id = cm.chatSessionId
  WHERE cm.role = 'user' AND cs.userId IN (<segment>)
)
SELECT DISTINCT ON (userId) ...
WHERE
  (current_at - prev_at) >= INTERVAL '<idleThresholdDays> days'
  AND current_at >= NOW() - INTERVAL '<windowDays> days'
ORDER BY userId, current_at DESC;
```

**D1 note:** SQLite không có `LAG()` window function trên một số version. Cần check `@cloudflare/d1` SQLite version hiện tại. Fallback: self-join 2 lần.

---

### G3. First Value Users endpoint

#### Current spec

Không có. (Spec có `medianTTV_L1_sec` và `medianTTV_L2_sec` nhưng đó là median của TTV, không phải list user-level.)

#### Use case (Phase 1D dashboard)

Detect users **lần đầu đạt ≥5 turns trong 1 session** — signal "user đã hiểu giá trị product". BA muốn outreach để xin share conversation.

#### Đề xuất — new endpoint

```
GET /admin/users/first-value
```

**Query params:**
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `turnThreshold` | int ≥ 1 | `5` | Số turn / session để gọi là "first value" |
| `emailDomain` | string | — | |
| `excludeAnonymous` | boolean | `true` | |
| `limit` | int 1-200 | `100` | |

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 20,
        "email": "tamnt@savameta.com",
        "firstName": "Tâm", "lastName": "Nguyễn",
        "firstValueAt": "2026-03-19T10:07:21.000Z",
        "sessionId": "fb383744-727b-4552-a8a9-9650d7401b59-25",
        "turnsAtValue": 5
      }
    ],
    "total": 4,
    "config": { "turnThreshold": 5 }
  }
}
```

**SQL pseudo:**
```sql
WITH numbered_turns AS (
  SELECT
    cs.userId, cs.id AS sessionId, cm.createdAt,
    ROW_NUMBER() OVER (PARTITION BY cs.userId, cs.id ORDER BY cm.createdAt) AS turn_no
  FROM ChatMessage cm JOIN ChatSession cs ON cs.id = cm.chatSessionId
  WHERE cm.role = 'user' AND cs.userId IN (<segment>)
)
SELECT DISTINCT ON (userId) userId, sessionId, createdAt AS firstValueAt, turn_no AS turnsAtValue
FROM numbered_turns
WHERE turn_no = <turnThreshold>
ORDER BY userId, createdAt ASC;
```

---

## 4. Tổng kết endpoints sau gap

| # | Endpoint | Status | Phase |
|---|----------|--------|-------|
| 1 | `GET /admin/costs/top-users` (extend) | PR #5170 | 1 |
| 2 | `GET /admin/users/adoption` | PR #5170 | 1 |
| 3 | `GET /admin/share-sessions` | PR #5170 | 1 |
| 4 | `POST /admin/users/join-status` | PR #5170 | 1 |
| 5 | `GET /admin/metrics/summary` (with G1 extension) | PR #5170 + extend | 1.5 |
| 6 | `GET /admin/users/returning` | NEW | 2 |
| 7 | `GET /admin/users/first-value` | NEW | 2 |

---

## 5. Minor improvements

### M1. `lastActiveAt` per user dùng `ChatMessage` thay vì `*CostLog`

Spec hiện compute `lastActiveAt = MAX(NormalModeCostLog.createdAt, CodeModeCostLog.createdAt)`. Nhưng định nghĩa "active" của dashboard là **gửi message** → nên dùng `MAX(ChatMessage.createdAt WHERE role='user')`. CostLog cũng được tạo khi mỗi message gửi, nên có thể gần đúng, nhưng:

- Có những API call tạo cost log nhưng không phải user-initiated (ví dụ background tool calls, retry).
- Dashboard hiện dùng `history_entries.createdAt` = `NormalModeCostLog`, **nhận thấy** một số case `lastActiveAt` lệch với "last user message".

**Đề xuất:** thêm field riêng `lastUserMessageAt` (song song với `lastActiveAt`) trong response của endpoints #1 và #2.

### M2. Token field naming

Dashboard hiện consume `totalPromptTokens`, `totalCompletionTokens`, `totalTokens`, `cache_read_tokens`. Spec response field `totalTokens` OK nhưng không thấy `cacheReadTokens` được expose:

```json
{
  "totalTokens": 872409,
  "totalPromptTokens": 806135,
  "totalCompletionTokens": 66274,
  "totalCacheReadTokens": 145000   // NEW: needed for cache hit rate
}
```

Dashboard hiện compute `cacheHitRate = cacheReadTokens / promptTokens`. Không có field này thì dashboard mất metric.

---

## 6. Migration plan (dashboard-side)

Khi 7 endpoints (5 PR #5170 + 2 mới G2/G3) sẵn sàng, dashboard có thể:

| Bước | Thay đổi |
|------|---------|
| 1 | Bỏ N+1 ở sync: gọi `/admin/users/adoption` thay cho loop `/user/{id}` |
| 2 | Thay query `getAdoptionSummary` bằng 1 call `/admin/users/join-status` (POST 80 emails) + 1 call `/admin/metrics/summary` |
| 3 | Thay query `getEngagementSummary` bằng `/admin/metrics/summary` (3 segments) — sau khi M2 add `cacheReadTokens` |
| 4 | Thay 2 routes `/api/savameta/triggers/{returning,first-value}` bằng proxy call sang `/admin/users/{returning,first-value}` |
| 5 | Đánh giá: có thể bỏ Postgres `history_entries` được không? Nếu có endpoint #6+#7 + summary metrics đủ → bỏ sync tốn kém |

Việc bỏ Postgres sync **tiết kiệm**:
- 1 docker container postgres + volume trên VPS
- Background sync job với token refresh logic
- Cache invalidation logic phức tạp

Bù lại dashboard sẽ **phụ thuộc** vào latency của `lumilink-api`. Cần đo p95 trước khi quyết định.

---

## 7. Open questions cho dev team

- [ ] D1/SQLite version hiện có support `LAG()` / `ROW_NUMBER()` không? (Cần cho G2, G3)
- [ ] Có thể extend `metrics/summary` với `dailyActiveNd` không phá cache key hiện tại không? (G1)
- [ ] Endpoint G2/G3 ưu tiên Phase nào — sau khi PR #5170 merge có thể làm tiếp luôn?
- [ ] M1 (`lastUserMessageAt`) có khả thi không, hay chi phí thêm query quá cao?
- [ ] M2 (`cacheReadTokens`) field có sẵn trong cost log không?

---

## Appendix: Mapping dashboard queries → endpoints

| Dashboard query (current) | API endpoint (after spec + gaps) |
|---------------------------|-----------------------------------|
| `getAdoptionSummary` | `/admin/users/join-status` + `/admin/metrics/summary` |
| `getJoinedUsers` | `/admin/users/adoption?emailDomain=savameta.com` |
| `getNeverJoinedUsers` | `/admin/users/join-status` (notJoined) |
| `getLifecycleCounts` | `/admin/users/adoption` (derive bucket from `daysSinceLastChat`) |
| `getEngagementSummary` | `/admin/metrics/summary.savameta` |
| `getEngagementByUser` | `/admin/users/adoption` (sort/filter) |
| `getDailyActivity` | **Gap** — cần endpoint daily timeline (Phase 3?) |
| `detectReturningUsers` | `/admin/users/returning` (G2) |
| `detectFirstValueUsers` | `/admin/users/first-value` (G3) |
| `countDailyActiveUsers7d` | `/admin/metrics/summary.dailyActive7d` (G1) |
