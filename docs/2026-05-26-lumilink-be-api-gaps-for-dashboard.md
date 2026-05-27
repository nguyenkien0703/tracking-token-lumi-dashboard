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
| F1 | Không filter được theo **user segment** (savameta / external / anonymous / all) | High | `/admin/costs/top-users` |
| F2 | Cùng vấn đề segment filter | High | `/api/v1/normal-mode/costs/history` |

Ngoài ra 1 vấn đề data integrity (M1) liên quan đến `messageId` overflow ở endpoint messages.

---

## 1.5. User segments (cốt lõi cho F1)

Hệ thống có **3 loại user**, dashboard cần xem cả 3 (qua tab `[All] [Savameta] [External] [Anonymous]` trên Lifecycle / Engagement / Activity / Triggers):

| Segment | Định nghĩa SQL | Use case |
|---------|---------------|----------|
| `savameta` | `LOWER(email) LIKE '%@savameta.com'` | 80 nhân sự internal — track adoption HR |
| `external` | có email, NOT savameta, NOT anonymous (`email NOT LIKE '%@anon.lumilink' AND email NOT LIKE '%@savameta.com'`) | User cá nhân (Gmail, doanh nghiệp khác) — track ROI external |
| `anonymous` | `email LIKE '%@anon.lumilink'` | Người chat không login (Google OAuth chưa setup hoặc skip) |
| `all` | union 3 segment trên | Tổng quan |

**Lưu ý**: hệ thống login bằng Google OAuth → user đã login chắc chắn có email. `loginType = 'anonymous'` và email pattern `@anon.lumilink` là dấu hiệu user chưa login.

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

### F1. `/admin/costs/top-users` không filter theo segment

#### Vấn đề

Dashboard cần xem **mỗi segment** (savameta / external / anonymous / all) trong từng tab. Endpoint hiện trả top N gộp tất cả → phải set `limit=500` rồi filter client → tốn bandwidth + sai pagination (top 100 sau khi filter ≠ filter rồi top 100).

#### Đề xuất

Thêm 1 query param **`segment`** với 4 giá trị enum:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `segment` | enum: `all` / `savameta` / `external` / `anonymous` | `all` | Filter user ở DB level trước khi sort + paginate |

**SQL logic theo segment:**

```sql
-- segment=savameta
WHERE LOWER(u.email) LIKE '%@savameta.com'

-- segment=external
WHERE u.email NOT LIKE '%@anon.lumilink'
  AND u.email NOT LIKE '%@savameta.com'
  AND u.email IS NOT NULL

-- segment=anonymous
WHERE u.email LIKE '%@anon.lumilink'

-- segment=all (no filter)
```

**Lý do dùng `segment` enum thay vì `emailDomain` + `excludeAnonymous`:**

- Semantics rõ ràng — dashboard chỉ cần 1 param thay vì combine 2-3 param.
- BE control định nghĩa segment ở 1 chỗ (constants), không phải caller tự ghép regex.
- Dễ thay đổi nếu sau này muốn redefine (ví dụ thêm domain whitelist cho "internal").

**Logic order:** filter user IDs at DB level **BEFORE** sort + paginate.

**Backward compat**: param optional với default `all` → caller cũ (Lumi Token dashboard) không đổi behavior.

**Optional advanced**: nếu muốn flexibility cao hơn, vẫn có thể thêm `emailDomain` query param cho use case "Savameta sau này có domain khác". Nhưng em recommend làm `segment` trước, advanced sau khi cần.

---

### F2. `/api/v1/normal-mode/costs/history` không filter theo segment

#### Vấn đề

Dashboard muốn refresh raw history **theo từng segment** (để mỗi tab Engagement/Activity/Triggers tính số riêng). Endpoint hiện chỉ có `userId` (single) hoặc không filter → phải:

- **Option A**: gọi N lần `?userId={id}` cho mỗi user trong segment → N+1 fetch, chậm.
- **Option B**: gọi 1 lần không filter → fetch toàn bộ entries gồm cả 3 loại → filter client. Tốn bandwidth, scale kém khi external user lên hàng nghìn.

#### Đề xuất

Thêm **cùng `segment` enum** như F1:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `segment` | enum: `all` / `savameta` / `external` / `anonymous` | `all` | Filter theo user pool, áp dụng cùng logic SQL như F1 |

**Request example:**
```
GET /api/v1/normal-mode/costs/history?segment=savameta&from=2026-05-01&limit=1000
GET /api/v1/normal-mode/costs/history?segment=external&limit=1000
GET /api/v1/normal-mode/costs/history?segment=anonymous&limit=1000
```

**SQL pseudo:**
```sql
SELECT h.* FROM history_entries h
JOIN users u ON u.id = h."userId"
WHERE
  CASE :segment
    WHEN 'savameta' THEN LOWER(u.email) LIKE '%@savameta.com'
    WHEN 'external' THEN u.email NOT LIKE '%@anon.lumilink' AND u.email NOT LIKE '%@savameta.com' AND u.email IS NOT NULL
    WHEN 'anonymous' THEN u.email LIKE '%@anon.lumilink'
    ELSE TRUE
  END
ORDER BY h."createdAt" DESC
LIMIT :limit OFFSET :offset
```

**Backward compat**: `segment` optional, default `all` — không phá caller hiện tại.

**Response shape**: giữ nguyên (entries + total + pagination). Không cần thêm field.

**Optional**: vẫn giữ `userId` single param hiện tại (cho use case drill-down 1 user). `segment` và `userId` mutually exclusive — nếu cả 2 truyền cùng lúc, ưu tiên `userId` và ignore `segment`.

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

- [ ] **F1**: Thêm `segment` enum param (`all` / `savameta` / `external` / `anonymous`) cho `/admin/costs/top-users`.
- [ ] **F2**: Thêm cùng `segment` enum param cho `/api/v1/normal-mode/costs/history`. Định nghĩa SQL của segment phải khớp F1 (share constant ở backend).

### Nên có (MEDIUM)

- [ ] **M1**: Spec rõ semantics `isUnmapped` + non-null `role` cho `/session/{id}/messages`. Thêm `?excludeUnmapped=true`.

### Bỏ khỏi scope (nếu chưa build)

- [ ] PR #5170 các endpoint compute metric (`adoption`, `metrics/summary`, ...) — dashboard tự lo.

---

## 8. Open questions

- [ ] Định nghĩa segment `external` — cần exclude thêm domain nào ngoài `@savameta.com` không? (Ví dụ: nếu Defikit có domain riêng `@defikit.net` thì có gom vào "savameta-internal" không, hay coi là external?)
- [ ] Segment definition nên hardcode ở backend (rõ ràng, dễ control) hay configurable qua env var?
- [ ] M1: `role` được set null vì đâu — Prisma schema cho phép, hay logic backend chưa fill?
- [ ] Có nên thêm `?sinceCreatedAt={ISO}` cho `/costs/history` để dashboard refresh incremental (chỉ fetch entries mới) thay vì refetch full mỗi sync?
- [ ] Có thể anonymous user **upgrade** lên có email (login Google sau khi chat) không? Nếu có, segment của họ thay đổi giữa các thời điểm — `userId` cũ sẽ xuất hiện ở 2 segment khác nhau qua time. Dashboard cần biết để xử lý.
