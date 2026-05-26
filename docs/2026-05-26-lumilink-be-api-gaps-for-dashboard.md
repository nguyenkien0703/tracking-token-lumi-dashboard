# LumiLink-BE Admin Read APIs — Gap Analysis for Adoption Dashboard

**Date:** 2026-05-26
**Author:** AnDT (DevOps)
**Audience:** lumilink-be team (Kiên + Tâm)
**Related PR:** [DefikitTeam/lumilink-be#5170 (`feat/read-apis`)](https://github.com/DefikitTeam/lumilink-be/pull/5170)

---

## 1. TL;DR

**Nguyên tắc**: dev team chỉ expose raw data, **mọi business metric do dashboard tự compute** — Daily Active, Returning, First Value, lifecycle bucket, TTV, TTR... đều là logic của dashboard. BA đổi định nghĩa thì sửa dashboard, không phải sửa API.

Sau khi audit 6 endpoint hiện có, raw data **gần như đầy đủ**. Còn **2 filter gap** đáng làm:

| # | Gap | Severity | Endpoint ảnh hưởng |
|---|-----|----------|---------------------|
| F1 | Không filter được theo **email domain** | Medium | `/admin/costs/top-users` |
| F2 | Không filter được theo **userId list** (IN array) | High | `/api/v1/normal-mode/costs/history` |

Ngoài ra 1 vấn đề data integrity (M1) liên quan đến `messageId` overflow ở endpoint messages.

---

## 2. Bối cảnh

Dashboard `tracking-token-lumi-dashboard` track adoption của 80 nhân sự `@savameta.com`. Hiện đang **sync raw data về Postgres** rồi tự query — vì cần raw activity timeline để compute Daily Active 7/7d, Returning Users (idle ≥7d → quay lại trong N ngày), First Value (≥5 turns trong 1 session).

**Quan điểm hiện tại sau khi review:**

> Logic compute metric thuộc về dashboard, không phải lumilink-be. API chỉ cần raw data sạch + đủ filter để dashboard không kéo lượng dữ liệu vô ích.

PR #5170 hiện đang build 5 endpoint admin/analytics có nhiều logic compute (`active7d/30d/90d`, `medianTTV`, `dormantUsers`, `metrics/summary`...) — **những phần compute này dashboard không cần dev team build**. Đề xuất focus lại vào 2 filter ở mục 3.

---

## 3. Endpoint inventory (hiện trạng)

| # | Endpoint | Trả về | Đã đủ? |
|---|----------|--------|--------|
| 1 | `GET /admin/costs/top-users` | List users + email + name + avatar + tokens + cost + requestCount | Yes (cần thêm filter F1) |
| 2 | `GET /user/{userId}` | User profile (deprecated cho dashboard — #1 đã có) | OK |
| 3 | `GET /api/v1/normal-mode/costs/history` | Raw history entry (id, sessionId, userId, model, tokens, costs, cacheReadTokens, createdAt) | Yes (cần thêm filter F2) |
| 4 | `GET /api/v1/normal-mode/costs/user/{userId}/sessions` | Sessions của 1 user (title, status, tokens, cost, timestamps) | OK |
| 5 | `GET /api/v1/normal-mode/costs/session/{sessionId}/messages` | Raw turn (messageId, role, tokens, cost, timestamps) | OK (xem M1) |
| 6 | `GET /api/v1/normal-mode/costs/user/{userId}` | User cost summary | OK |

Với 6 endpoint trên dashboard đã có đủ raw để compute mọi metric:

| Metric (dashboard tự compute) | Raw data lấy từ |
|---|---|
| Joined / NotJoined (Adoption) | #1 (filter by email) + Excel roster |
| Daily Active 7/7d | #3 (history entries) → `COUNT(DISTINCT date)` |
| Lifecycle bucket (Active ≤3d / At-risk 4–30d / Dormant >30d) | #1 (lastActiveAt) hoặc #3 (MAX createdAt) |
| Returning Users (idle ≥7d → return) | #3 → `LAG()` window function |
| First Value (≥5 turns/session) | #5 hoặc #3 → `ROW_NUMBER() PARTITION BY userId, sessionId` |
| Engagement summary (totalTurns, totalCost, ...) | #3 → SUM/COUNT |
| Daily activity trend | #3 → `GROUP BY DATE(createdAt)` |

---

## 4. Gap chi tiết

### F1. `/admin/costs/top-users` không filter theo `emailDomain`

#### Vấn đề

Dashboard muốn lấy "top users là `@savameta.com`". Endpoint hiện trả top N theo cost, trong đó user external (gmail, ...) chiếm chỗ. Phải set `limit=500` rồi filter client → tốn bandwidth + slow.

#### Đề xuất

Thêm 2 query param:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `emailDomain` | string (domain regex) | — | Filter `email LIKE '%@<domain>'` |
| `excludeAnonymous` | boolean | `false` | Filter `loginType != 'anonymous'` (hoặc `email NOT LIKE '%@anon.lumilink'`) |

**Logic order:** filter user IDs at DB level **BEFORE** sort + paginate. Spec PR #5170 đã đề xuất đúng pattern này — chỉ cần giữ phần filter, **bỏ phần compute lastActiveAt** (vì dashboard tự derive từ #3).

**Backward compat**: thêm param optional, không phá caller hiện tại (Lumi Token dashboard).

---

### F2. `/api/v1/normal-mode/costs/history` không filter theo `userIds[]`

#### Vấn đề

Dashboard muốn refresh raw history cho **80 Savameta users**. Endpoint hiện chỉ có `userId` (single) hoặc không filter → phải:

- **Option A**: gọi 80 lần `?userId={id}` → N+1 fetch
- **Option B**: gọi 1 lần không filter → fetch toàn bộ 2237 entries gồm external users → filter client (tốn bandwidth)

Cả 2 đều tệ. Đặc biệt khi external users sẽ scale lên hàng nghìn — Option B chết.

#### Đề xuất

Cho phép **multiple userIds** trong 1 request:

**Option preferred — repeat query param:**
```
GET /api/v1/normal-mode/costs/history?userId=8&userId=20&userId=42&from=2026-05-01&limit=1000
```

**Hoặc — POST với body để vượt qua URL length limit (80+ userId):**
```http
POST /api/v1/normal-mode/costs/history/search
{
  "userIds": [8, 20, 42, ...],
  "from": "2026-05-01",
  "limit": 1000,
  "offset": 0
}
```

Em recommend **POST search variant** — clean hơn, không lo URL length, tiền lệ ở `/admin/users/join-status` PR #5170 đã có pattern body.

**Response shape**: giữ nguyên (entries + total + pagination). Không cần thêm field.

---

## 5. Minor: M1 — `messageId` overflow ở `/session/{id}/messages`

#### Vấn đề observed

```json
{
  "messageId": 9007199254740991,   // = Number.MAX_SAFE_INTEGER
  "isUnmapped": true,
  "role": null,
  ...
}
```

Đây là sentinel value cho entry chưa map được với DB. Không phải bug nghiêm trọng, nhưng:

- Dashboard phải skip những entry này khi count "user turns".
- `role: null` → không phân biệt được user-turn vs assistant-turn → khó compute "First Value" chính xác (cần đếm chỉ user message).

#### Đề xuất

- Documentation: spec rõ semantics của `isUnmapped: true` và khi nào field `role` là null. Ideal là `role` không null cho mọi message (kể cả unmapped — đoán từ context).
- Filter param: `?excludeUnmapped=true` để dashboard không phải filter client.

---

## 6. Out of scope (dev team KHÔNG cần build)

Spec PR #5170 đang định build mấy thứ sau — em đề xuất **bỏ** vì dashboard sẽ tự compute:

| Feature trong spec | Lý do bỏ |
|---|----------|
| `/admin/users/adoption` | Dashboard derive từ #1 + #3 |
| `/admin/users/join-status` (POST bulk lookup) | Dashboard derive từ #1 + Excel roster (chỉ 80 email, không cần endpoint) |
| `/admin/metrics/summary.active7d/30d/90d` | Dashboard compute từ #3 |
| `/admin/metrics/summary.dormantUsers` | Dashboard compute từ #3 |
| `/admin/metrics/summary.medianTTV_L1/L2` | Dashboard compute (chưa có yêu cầu rõ TTV của BA) |
| `/admin/share-sessions` | Dashboard compute từ #3 nếu share data có trong history; nếu không thì có thể giữ |
| Caching `metrics/summary` 5 phút | Dashboard tự cache ở Postgres / Next.js memory |

**Endpoint duy nhất trong spec đáng giữ:**

- `/admin/costs/top-users` extension (đã có lý do F1) — chỉ giữ phần **filter + pagination**, bỏ phần compute `lastActiveAt`.

---

## 7. Tóm tắt action items cho dev team

### Bắt buộc (HIGH)

- [ ] **F2**: Cho phép multiple userIds trong `/costs/history` (POST search variant preferred).
- [ ] **F1**: Thêm `emailDomain` + `excludeAnonymous` filter cho `/admin/costs/top-users`.

### Nên có (MEDIUM)

- [ ] **M1**: Spec rõ semantics `isUnmapped` + non-null `role` cho `/session/{id}/messages`. Thêm `?excludeUnmapped=true`.

### Bỏ khỏi scope (nếu chưa build)

- [ ] PR #5170 các endpoint compute metric (`adoption`, `metrics/summary`, ...) — dashboard tự lo.

---

## 8. Open questions

- [ ] Confirm rằng cách filter ở F1 chỉ dùng cho `top-users` endpoint, không phá tương thích Lumi Token dashboard hiện đang dùng.
- [ ] F2: ưu tiên POST search variant hay repeat query param?
- [ ] M1: `role` được set null vì đâu — Prisma schema cho phép, hay logic backend chưa fill?
- [ ] Có nên thêm `?sinceCreatedAt={ISO}` cho `/costs/history` để dashboard refresh incremental (chỉ fetch entries mới) thay vì refetch full mỗi sync?
