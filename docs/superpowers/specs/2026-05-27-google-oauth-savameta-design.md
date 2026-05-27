# Google OAuth Authentication for LumiPulse Dashboard

**Status**: Approved design — ready for implementation plan
**Date**: 2026-05-27
**Author**: kiennv@savameta.com

## Problem

The LumiPulse dashboard currently has minimal security:

- Routes under `/admin/*` and `/settings/*` are gated by a single shared password (`ADMIN_PANEL_PASSWORD`) stored as `SHA256(password)` in a cookie.
- All other routes (`/`, `/users`, `/sessions`, `/engagement`, `/activity`, `/lifecycle`, `/triggers`, `/savameta/*`) are publicly accessible.
- `/api/proxy/*` has no auth — anyone with the URL can call the lumilink-be backend through it.
- The shared-password model has no per-user identity, no revocation, and no audit trail.

We need a real authentication system where:

1. Only members of the Savameta organization can access the dashboard.
2. Most members can view dashboard data ("viewer" role).
3. A small list of operators can additionally access settings ("admin" role).
4. Login is fast — no password to manage.

## Goals

- **Identity**: Each request is associated with a real Savameta user email.
- **Domain restriction**: Only `@savameta.com` Google accounts can sign in.
- **2-role authorization**: viewer (default) vs admin (allow-list).
- **Simple**: No external auth library; one new dependency (`jose` for JWT).
- **Internal tool scope**: ≤10 users, low traffic, stateless sessions are acceptable.

## Non-goals (YAGNI)

- Refresh-token rotation (single 7-day session JWT is enough).
- Multiple identity providers (Google only).
- Audit log of logins (out of scope).
- Per-user data filtering on the Lumi backend (all signed-in users see the same data).
- "Remember me" toggle (always 7 days).
- 2FA (Google handles this).

## Architecture

### Authentication flow

Authorization Code flow with server-side token exchange:

```
[User]                  [Dashboard]                    [Google]
  │                          │                              │
  │  GET /login              │                              │
  │─────────────────────────▶│                              │
  │                          │  set oauth_state +           │
  │                          │  oauth_nonce + oauth_from    │
  │                          │  cookies (10 min)            │
  │  302 → accounts.google   │                              │
  │◀─────────────────────────│                              │
  │                                                         │
  │  Authenticate (hd=savameta.com UI hint)                 │
  │────────────────────────────────────────────────────────▶│
  │                                                         │
  │  302 → /api/auth/callback?code=...&state=...            │
  │◀────────────────────────────────────────────────────────│
  │                                                         │
  │  GET /api/auth/callback  │                              │
  │─────────────────────────▶│                              │
  │                          │  verify state cookie         │
  │                          │  POST oauth2.googleapis.com  │
  │                          │       /token                 │
  │                          │─────────────────────────────▶│
  │                          │  { id_token, access_token }  │
  │                          │◀─────────────────────────────│
  │                          │  verify ID token JWT         │
  │                          │   (RS256 sig via JWKS,       │
  │                          │    iss, aud, exp, nonce,     │
  │                          │    hd === "savameta.com",    │
  │                          │    email_verified === true)  │
  │                          │  compute isAdmin             │
  │                          │  sign session JWT (HS256, 7d)│
  │                          │  set lumipulse_session cookie│
  │  302 → /                 │                              │
  │◀─────────────────────────│                              │
```

### Session JWT (post-login)

```ts
type SessionPayload = {
  email: string;        // e.g. "kiennv@savameta.com"
  name: string;         // display name from Google
  picture?: string;     // avatar URL
  isAdmin: boolean;     // computed at callback, baked into token
  iat: number;          // issued at (epoch seconds)
  exp: number;          // iat + 7*24*3600
};
```

Signed HS256 with `SESSION_SECRET` (32 random bytes). `isAdmin` is baked in to avoid re-checking `ADMIN_EMAILS` env on every request. The trade-off: removing an email from `ADMIN_EMAILS` does not revoke their admin role until their current session expires (max 7 days). Acceptable for an internal tool. If urgent revocation is needed, rotate `SESSION_SECRET` to force all sessions to re-login.

### Security guarantees

| Threat | Mitigation |
|--------|-----------|
| Non-Savameta user logs in | Server-side check `hd === "savameta.com"` claim in ID token (UI hint `hd=` query param is not trusted) |
| CSRF on OAuth callback | Random 32-byte `state` stored in `oauth_state` httpOnly cookie, verified on callback |
| Replay of ID token | Random `nonce` in auth URL, verified against `nonce` claim in returned ID token |
| Session forgery | HMAC-SHA256 signature with `SESSION_SECRET`; cookie is `httpOnly`, `secure`, `sameSite=lax` |
| ID token forgery | Verify RS256 signature against Google's JWKS endpoint; check `iss`, `aud`, `exp` |
| Email spoofing | Require `email_verified === true` claim |

## Authorization

### Roles

- **Viewer**: Any Google account with `@savameta.com` domain.
- **Admin**: Viewer + email is in the admin allow-list.

### Admin allow-list

Computed at callback time:

```ts
const SEED_ADMINS = ["kiennv@savameta.com"];

function computeIsAdmin(email: string): boolean {
  const envAdmins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = new Set([
    ...SEED_ADMINS.map((s) => s.toLowerCase()),
    ...envAdmins,
  ]);
  return all.has(email.toLowerCase());
}
```

`kiennv@savameta.com` is hardcoded as a seed admin to prevent lockout if `ADMIN_EMAILS` is misconfigured. Adding/removing other admins is done via the `ADMIN_EMAILS` env var (comma-separated). To revoke the seed admin, edit the code.

### Route protection matrix

| Route pattern | Anonymous | Viewer | Admin |
|---------------|-----------|--------|-------|
| `/login` | ✅ | redirect `/` | redirect `/` |
| `/api/auth/login`, `/api/auth/callback`, `/api/auth/logout` | ✅ | ✅ | ✅ |
| `/`, `/users/**`, `/sessions/**`, `/engagement`, `/activity`, `/lifecycle`, `/triggers`, `/savameta/**` | redirect `/login?from=...` | ✅ | ✅ |
| `/settings/**`, `/admin/**` | redirect `/login` | redirect `/` | ✅ |
| `/api/proxy/**` | 401 JSON | ✅ | ✅ |
| `/api/admin/**` (sync, etc.) | 401 JSON | 403 JSON | ✅ |

### Middleware (pseudocode)

```ts
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) return next();
  if (pathname.startsWith("/api/auth/")) return next();

  const session = await verifySession(req.cookies.get("lumipulse_session")?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return json({ error: "unauthorized" }, 401);
    }
    return redirect(`/login?from=${encodeURIComponent(pathname)}`);
  }

  const isAdminZone =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  if (isAdminZone && !session.isAdmin) {
    if (pathname.startsWith("/api/")) {
      return json({ error: "forbidden" }, 403);
    }
    return redirect("/");
  }

  return next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
```

## Files

### New files

| File | Purpose |
|------|---------|
| `src/lib/oauth.ts` | Build Google auth URL, exchange code → tokens, verify Google ID token via JWKS |
| `src/lib/session.ts` | Sign/verify session JWT, read session from request cookies |
| `src/app/api/auth/login/route.ts` | GET → generate state+nonce, set short-lived cookies, redirect to Google |
| `src/app/api/auth/callback/route.ts` | GET → verify state, exchange code, verify ID token, set session cookie, redirect home |
| `src/app/api/auth/logout/route.ts` | POST → clear session cookie, return 200 (client redirects) |
| `src/app/login/page.tsx` | Login UI — "Sign in with Google" button + error message support |

### Modified files

| File | Change |
|------|--------|
| `src/middleware.ts` | Replace SHA256 password-cookie logic with session JWT verify. Update matcher to cover all routes except `/login`, `/api/auth/*`, static assets. |
| `src/app/layout.tsx` | Replace `ADMIN_PANEL_PASSWORD` SHA256 check with `getSessionFromCookie()` → derive `isAdmin` from session payload |
| `src/app/api/proxy/[...path]/route.ts` | Add session guard at top — return 401 JSON if no session |
| `src/app/admin/settings/page.tsx` | Logout button calls `/api/auth/logout` instead of clearing `admin_session` |
| `src/components/Sidebar.tsx` | No change — still receives `isAdmin` prop, still filters "Settings" section |

### Deleted files

| File | Reason |
|------|--------|
| `src/app/admin/login/page.tsx` | Replaced by `/login` (Google OAuth) |
| `src/app/api/admin/auth/route.ts` | Password auth no longer used |

## Cookies

| Cookie | Purpose | Attributes | Lifetime |
|--------|---------|------------|----------|
| `lumipulse_session` | Session JWT | `httpOnly`, `secure`, `sameSite=lax`, `path=/` | 7 days |
| `oauth_state` | CSRF nonce for OAuth flow | `httpOnly`, `secure`, `sameSite=lax`, `path=/api/auth` | 10 min |
| `oauth_nonce` | Replay nonce for OAuth flow | `httpOnly`, `secure`, `sameSite=lax`, `path=/api/auth` | 10 min |
| `oauth_from` | Redirect-after-login path | `httpOnly`, `sameSite=lax`, `path=/api/auth` | 10 min |

Cookie `admin_session` (from the old password-based flow) will no longer be set or read. It expires naturally; no explicit cleanup is required.

## Environment variables

### New

```bash
GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<secret>
GOOGLE_REDIRECT_URI=https://lumipulse.savameta.com/api/auth/callback

# Random 32-byte hex (generate with: openssl rand -hex 32)
SESSION_SECRET=<64-char-hex-string>

# Comma-separated. May be empty — kiennv@savameta.com is always admin via seed.
ADMIN_EMAILS=

# App URL used to build absolute redirect URLs
NEXT_PUBLIC_APP_URL=https://lumipulse.savameta.com
```

### Constants in code (not env)

```ts
const ALLOWED_HD = "savameta.com";
const SEED_ADMINS = ["kiennv@savameta.com"];
```

### Removed

- `ADMIN_PANEL_PASSWORD` — no longer used. Remove from all environments after deploy.

### Kept

- `API_BASE_URL` — lumilink-be endpoint.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — credentials the dashboard uses to call lumilink-be on behalf of itself. Unrelated to user auth.

## Dependencies

One new dependency:

- `jose` (~15 KB) — used for both verifying Google ID tokens (RS256 via JWKS) and signing/verifying session JWTs (HS256). Edge-runtime compatible, works in Next.js middleware.

Install: `yarn add jose`

## Rollout

### Phase 1 — Google Cloud setup

1. In GCP Console, create or select project "LumiPulse".
2. APIs & Services → Credentials → Create credentials → OAuth client ID.
3. Application type: **Web application**.
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://<staging-host>/api/auth/callback`
   - `https://<prod-host>/api/auth/callback`
5. Authorized JavaScript origins: corresponding origins (without the path).
6. OAuth consent screen → User type: **Internal** (restricts to the `savameta.com` Workspace org — a second independent layer on top of the in-code `hd` check).
7. Save `client_id` and `client_secret`.

### Phase 2 — Implementation

Tracked separately in the implementation plan. Implementation tasks:

1. Add `jose` dependency.
2. Create `src/lib/oauth.ts` and `src/lib/session.ts`.
3. Create `/api/auth/login`, `/api/auth/callback`, `/api/auth/logout` route handlers.
4. Create `/login` page.
5. Rewrite `src/middleware.ts`.
6. Update `src/app/layout.tsx` to compute `isAdmin` from session.
7. Add session guard to `/api/proxy/[...path]/route.ts`.
8. Update Logout button in `/admin/settings`.
9. Delete `src/app/admin/login/page.tsx` and `src/app/api/admin/auth/route.ts`.
10. Remove `ADMIN_PANEL_PASSWORD` references.

### Phase 3 — Local verification

Set env vars in `.env.local` (with `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback`) and run through this checklist:

- [ ] Anonymous → `/` → redirect `/login`
- [ ] Login with `kiennv@savameta.com` → land on `/`, sidebar shows "Settings"
- [ ] Login with any other `@savameta.com` account → land on `/`, sidebar hides "Settings"
- [ ] Viewer → `/admin/settings` → redirect `/`
- [ ] Anonymous → `/api/proxy/foo` → 401 JSON
- [ ] Anonymous → `/api/auth/login` → redirect to Google
- [ ] Login with a `@gmail.com` account → callback errors → `/login?error=domain_not_allowed`
- [ ] Tamper with `oauth_state` cookie → callback errors
- [ ] Logout → cookie cleared → redirect `/login`
- [ ] Restart server → existing session still works (cookie persists)
- [ ] Rotate `SESSION_SECRET` → all sessions invalidated

### Phase 4 — Deploy

1. Add staging redirect URI to Google OAuth client.
2. Set env vars on staging (Docker `.env` or deployment platform).
3. Deploy → smoke test.
4. Repeat for production.

### Phase 5 — Cleanup

1. Remove `ADMIN_PANEL_PASSWORD` from staging and prod env.
2. Monitor logs for 1–2 days for unexpected 401/403 responses.

## Risks

| Risk | Mitigation |
|------|-----------|
| Seed admin `kiennv@savameta.com` is disabled in Google Workspace → lockout | Add a backup admin email to `ADMIN_EMAILS` before disabling the account |
| `SESSION_SECRET` leaked (e.g. committed to git) | Rotate the secret — invalidates all sessions; document the rotation procedure |
| Google OAuth client secret leaked | Regenerate in Google Console; update env |
| Middleware bug locks everyone out | Roll back the deploy; consider a temporary recovery route for prod |
| User confused by auto-redirect on first visit | `/login` page clearly states "Sign in with your @savameta.com Google account" |
| `isAdmin` baked into JWT → revocation is slow (≤ 7 days) | For urgent revocation, rotate `SESSION_SECRET` to force all users to re-login |

## Backwards compatibility

This is a breaking change. All users must sign in again after deploy. Since the tool has fewer than 10 users, no migration tooling is needed.
