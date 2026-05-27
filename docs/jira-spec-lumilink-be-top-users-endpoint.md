# [LUMI-BE] Extend `/admin/costs/top-users` for Savameta Adoption Dashboard

**Type:** Task / API Enhancement
**Component:** `lumilink-be` — admin costs endpoint
**Requested by:** AnDT (DevOps)
**Blocks:** `savameta-adoption-dashboard` Phase 1
**Effort estimate:** S (1-2h, mostly query + validation)

---

## Context

Dashboard mới `savameta-adoption-dashboard` (internal tool) cần track adoption của 80 nhân sự `@savameta.com` trên product LumiAI. Hiện tại endpoint `/admin/costs/top-users` cap 100 user, sort by cost/tokens — nếu user anonymous chiếm slot top, savameta user có thể bị loại khỏi response → dashboard miss data.

Cần extend endpoint hỗ trợ filter, pagination, search để dashboard query đúng & đủ data.

---

## Endpoint hiện tại (giả định)

```
GET /admin/costs/top-users
  ?sortBy=cost|tokens|requests
  &limit=100
  &from=2026-01-01
  &to=2026-05-25
Authorization: Bearer <admin-token>
```

---

## Yêu cầu mở rộng

### Query parameters mới

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `page` | int | No | `1` | 1-indexed page number |
| `limit` | int | No | `20` | Page size, max `100` |
| `emailDomain` | string | No | — | Filter users có email suffix `@<domain>`. Ví dụ: `emailDomain=savameta.com` |
| `excludeAnonymous` | bool | No | `false` | Filter `loginType != 'anonymous'` (loại user `@anon.lumilink`) |
| `search` | string | No | — | Substring match (case-insensitive) trên `email`, `firstName`, `lastName`, `userName`. Min 2 ký tự |

Existing params giữ nguyên: `sortBy`, `from`, `to`.

### Critical behavior

1. **Filter ÁP DỤNG TRƯỚC sort + paginate** (KHÔNG sort cap rồi filter sau)
   - Đúng: `WHERE email LIKE '%@savameta.com' AND loginType != 'anonymous' ORDER BY cost DESC LIMIT 20 OFFSET 0`
   - Sai: `SELECT ... ORDER BY cost DESC LIMIT 100` rồi filter ở application layer
   - Lý do: dashboard cần đảm bảo lấy đủ 80 savameta users, không bị anonymous chiếm slot

2. **`emailDomain` matching:**
   - Exact suffix match sau dấu `@`
   - Case-insensitive
   - Reject input chứa wildcard `%`, `_`, `*` (prevent SQL injection / regex abuse)

3. **`search` matching:**
   - Case-insensitive `LIKE %keyword%` trên 4 fields: `email`, `firstName`, `lastName`, `userName`
   - Min 2 ký tự (return 400 nếu < 2)
   - Có thể combine với `emailDomain`: `?emailDomain=savameta.com&search=nguyen` → tìm nguyen* trong savameta only

4. **Pagination:**
   - 1-indexed (`page=1` là trang đầu)
   - Return `400` nếu `page < 1` hoặc `limit < 1` hoặc `limit > 100`
   - Total count phải tính **sau khi áp filter** (KHÔNG phải tổng users của hệ thống)

### Response format

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 123,
        "email": "tamnt@savameta.com",
        "firstName": "Tam",
        "lastName": "Nguyen Thi",
        "userName": "tamnt",
        "loginType": "google",
        "avatarUrl": "https://...",
        "totalTokens": 872409,
        "totalPromptTokens": 806135,
        "totalCompletionTokens": 66274,
        "totalCostUsd": 1.2325,
        "requestCount": 44,
        "totalCacheReadTokens": 12000,
        "firstSeenAt": "2026-03-25T08:30:00.000Z",
        "lastActiveAt": "2026-05-24T10:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 53,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Fields bắt buộc thêm vào response (so với hiện tại):**
- `lastActiveAt` — timestamp turn cuối cùng (MAX `createdAt` của user trong `history_entries`). Critical cho dashboard tính "days since last activity" + lifecycle bucket assignment
- `firstSeenAt` — timestamp turn đầu tiên (MIN `createdAt`). Critical cho metric "New joiners by release" — biết user join trong release window nào
- `totalCacheReadTokens` — SUM(`cacheReadTokens`) của user. Cần cho Cache Hit Rate metric (`cacheReadTokens / promptTokens`)

---

## Test cases

| # | Request | Expected |
|---|---------|----------|
| 1 | `?emailDomain=savameta.com&limit=20&page=1` | Top 20 savameta user by cost, total = số savameta active |
| 2 | `?emailDomain=savameta.com&excludeAnonymous=true` | Như trên (savameta không có anon, nhưng test backward) |
| 3 | `?emailDomain=savameta.com&search=nguyen` | Savameta users có `nguyen` trong name/email |
| 4 | `?search=a` | 400 Bad Request (min 2 ký tự) |
| 5 | `?emailDomain=savameta%25.com` | 400 Bad Request (chứa `%`) |
| 6 | `?page=0` | 400 Bad Request |
| 7 | `?limit=200` | 400 Bad Request (max 100) |
| 8 | `?from=2026-05-01&to=2026-05-25&emailDomain=savameta.com` | Savameta users active trong range |
| 9 | Không truyền param mới | Backward compatible — behavior giống hiện tại |

---

## Backward compatibility

- Tất cả param mới đều **optional**
- Response shape có thêm field `lastActiveAt` + wrap trong `data.users[]` + `data.pagination` — **breaking change** nếu response cũ là flat array
- **Action:** verify response shape hiện tại với consumer (`tracking-token-lumi-dashboard`). Nếu cần, làm endpoint mới `/admin/costs/top-users/v2` để tránh break

---

## Performance / Index

- Schema D1 hiện tại đã có index trên `users.email` và `users.loginType` chưa?
- Nếu chưa → cần migration thêm index, vì `LIKE '%@savameta.com'` + `loginType != 'anonymous'` sẽ slow khi data lớn
- Aggregate `lastActiveAt` (MAX `createdAt`) trên `history_entries` — cần index `(userId, createdAt DESC)` nếu chưa có

---

## Acceptance criteria

- [ ] Tất cả 9 test cases ở trên pass
- [ ] Response include `lastActiveAt`, `firstSeenAt`, `totalCacheReadTokens` cho từng user
- [ ] Backward compatible với consumer hiện tại (`tracking-token-lumi-dashboard`)
- [ ] D1 query plan show index usage (không full table scan)
- [ ] Documentation cập nhật (Swagger/Postman/README — tùy team)
- [ ] AnDT verify từ dashboard request thành công

---

## Out of scope

- Webhook real-time (Phase 2)
- Bulk lookup `/admin/users?emails=...` (Phase 2 nếu cần)
- Survey/action triggers (Phase 2, dashboard tự handle qua CSV export)
