# Google OAuth Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shared-password admin login with Google OAuth restricted to `@savameta.com` accounts, with two roles (viewer / admin).

**Architecture:** DIY OAuth 2.0 Authorization Code flow. The dashboard signs its own HS256 session JWT after verifying Google's RS256 ID token. Middleware enforces auth on every route except `/login` and `/api/auth/*`. Admin allow-list combines a hardcoded seed (`kiennv@savameta.com`) with the `ADMIN_EMAILS` env var.

**Tech Stack:** Next.js 14 (App Router), TypeScript, `jose` for JWT, Tailwind, edge-runtime middleware. No test framework in this codebase — verification is via curl + browser checklists per task.

**Spec:** `docs/superpowers/specs/2026-05-27-google-oauth-savameta-design.md`

---

## File Plan

### New files
- `src/lib/session.ts` — sign/verify session JWT, read session from request cookies
- `src/lib/oauth.ts` — Google OAuth helpers: build auth URL, exchange code, verify Google ID token via JWKS
- `src/app/api/auth/login/route.ts` — generate state+nonce, set cookies, redirect to Google
- `src/app/api/auth/callback/route.ts` — verify state, exchange code, verify ID token, set session cookie
- `src/app/api/auth/logout/route.ts` — clear session cookie
- `src/app/login/page.tsx` — login UI (Sign in with Google button)

### Modified files
- `src/middleware.ts` — replace password-cookie auth with session JWT verify; expand matcher to all routes
- `src/app/layout.tsx` — derive `isAdmin` from session JWT instead of SHA256(password)
- `src/app/api/proxy/[...path]/route.ts` — add session guard at top of handler
- `src/app/admin/settings/page.tsx` — change Logout button to call `/api/auth/logout` and redirect to `/login`
- `.env.example` — document new env vars

### Deleted files
- `src/app/admin/login/page.tsx`
- `src/app/api/admin/auth/route.ts`

---

## Pre-flight: Google Cloud + secrets

Before any code: the human operator (kiennv) must complete these steps. The implementation engineer cannot do this themselves.

**Operator checklist:**

- [ ] Create OAuth client in GCP Console → APIs & Services → Credentials → OAuth client ID, type "Web application"
- [ ] Authorized redirect URIs: `http://localhost:3000/api/auth/callback` (dev), staging URL, prod URL
- [ ] OAuth consent screen → User type: **Internal** (restricts to savameta.com Workspace org)
- [ ] Save `client_id` and `client_secret`
- [ ] Generate session secret: `openssl rand -hex 32`
- [ ] Add to `.env.local`:
  ```
  GOOGLE_CLIENT_ID=<...>.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=<...>
  GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
  SESSION_SECRET=<64-char-hex>
  ADMIN_EMAILS=
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

The implementation engineer should request these values from the operator before starting Task 4 (callback). Tasks 1–3 can proceed without them.

---

## Task 1: Add jose dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install jose**

Run: `yarn add jose`

Expected: `package.json` updated with `"jose": "^5.x.x"` in dependencies; `yarn.lock` updated.

- [ ] **Step 2: Verify install**

Run: `node -e "console.log(require('jose/package.json').version)"`
Expected: prints a version number like `5.9.6`.

- [ ] **Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add jose for JWT signing and Google ID token verification"
```

---

## Task 2: Session JWT library

This module is self-contained — no Google dependencies. Build it first so later tasks can sign/verify sessions immediately.

**Files:**
- Create: `src/lib/session.ts`

- [ ] **Step 1: Create `src/lib/session.ts`**

```ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "lumipulse_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  email: string;
  name: string;
  picture?: string;
  isAdmin: boolean;
};

type VerifiedSession = SessionPayload & { iat: number; exp: number };

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined): Promise<VerifiedSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.isAdmin !== "boolean"
    ) {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      isAdmin: payload.isAdmin,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<VerifiedSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export function getSessionFromRequest(req: NextRequest): Promise<VerifiedSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build 2>&1 | head -40`
Expected: no TypeScript errors related to `src/lib/session.ts`. Build may fail for other reasons (env vars), but `session.ts` should compile cleanly.

If TypeScript errors appear in this file, fix them before committing.

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat(auth): add session JWT signing and verification"
```

---

## Task 3: OAuth helper library

**Files:**
- Create: `src/lib/oauth.ts`

- [ ] **Step 1: Create `src/lib/oauth.ts`**

```ts
import { createRemoteJWKSet, jwtVerify } from "jose";

export const ALLOWED_HD = "savameta.com";
export const SEED_ADMINS = ["kiennv@savameta.com"];

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const GOOGLE_ISSUER = "https://accounts.google.com";
const SCOPES = ["openid", "email", "profile"];

const JWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
};

export function buildGoogleAuthUrl(params: {
  state: string;
  nonce: string;
}): string {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("hd", ALLOWED_HD);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<{ id_token: string }> {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token_exchange_failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error("token_exchange_no_id_token");
  return { id_token: data.id_token };
}

export async function verifyGoogleIdToken(
  idToken: string,
  expectedNonce: string,
): Promise<GoogleProfile> {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: GOOGLE_ISSUER,
    audience: clientId,
  });

  if (payload.hd !== ALLOWED_HD) throw new Error("domain_not_allowed");
  if (payload.email_verified !== true) throw new Error("email_not_verified");
  if (payload.nonce !== expectedNonce) throw new Error("nonce_mismatch");

  const email = payload.email;
  const name = payload.name;
  if (typeof email !== "string" || typeof name !== "string") {
    throw new Error("missing_profile_claims");
  }

  return {
    email,
    name,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}

export function computeIsAdmin(email: string): boolean {
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

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}
```

- [ ] **Step 2: Type-check**

Run: `yarn build 2>&1 | head -40`
Expected: no TypeScript errors in `src/lib/oauth.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/oauth.ts
git commit -m "feat(auth): add Google OAuth helpers (auth URL, token exchange, ID token verify)"
```

---

## Task 4: Login endpoint (`/api/auth/login`)

Generates state + nonce, sets short-lived cookies, redirects to Google.

**Files:**
- Create: `src/app/api/auth/login/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildGoogleAuthUrl } from "@/lib/oauth";

const SHORT_COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "/";

  const state = randomBytes(32).toString("hex");
  const nonce = randomBytes(32).toString("hex");

  let authUrl: string;
  try {
    authUrl = buildGoogleAuthUrl({ state, nonce });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const res = NextResponse.redirect(authUrl);
  const secure = process.env.NODE_ENV === "production";
  const baseCookie = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: SHORT_COOKIE_MAX_AGE,
  };
  res.cookies.set("oauth_state", state, baseCookie);
  res.cookies.set("oauth_nonce", nonce, baseCookie);
  res.cookies.set("oauth_from", from, baseCookie);
  return res;
}
```

- [ ] **Step 2: Smoke test the redirect**

Run dev server in a separate terminal: `yarn dev` (requires env vars from Pre-flight).

Then:
```bash
curl -sI 'http://localhost:3000/api/auth/login' | head -20
```

Expected: HTTP 307 redirect with `Location:` header pointing to `https://accounts.google.com/o/oauth2/v2/auth?...`. The Location URL must include `hd=savameta.com`, `client_id=...`, `state=...`, `nonce=...`. `Set-Cookie:` headers should set `oauth_state`, `oauth_nonce`, `oauth_from`.

If `GOOGLE_CLIENT_ID is not set` or `GOOGLE_REDIRECT_URI is not set` appears in body, stop and configure env vars before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/login/route.ts
git commit -m "feat(auth): add /api/auth/login endpoint"
```

---

## Task 5: Callback endpoint (`/api/auth/callback`)

Verifies state, exchanges code, verifies ID token, sets session cookie.

**Files:**
- Create: `src/app/api/auth/callback/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  verifyGoogleIdToken,
  computeIsAdmin,
} from "@/lib/oauth";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return redirectToLogin(req, errorParam);
  }
  if (!code || !state) {
    return redirectToLogin(req, "missing_code_or_state");
  }

  const stateCookie = req.cookies.get("oauth_state")?.value;
  const nonceCookie = req.cookies.get("oauth_nonce")?.value;
  const fromCookie = req.cookies.get("oauth_from")?.value ?? "/";

  if (!stateCookie || !nonceCookie) {
    return redirectToLogin(req, "missing_oauth_cookies");
  }
  if (state !== stateCookie) {
    return redirectToLogin(req, "state_mismatch");
  }

  let profile;
  try {
    const { id_token } = await exchangeCodeForTokens(code);
    profile = await verifyGoogleIdToken(id_token, nonceCookie);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";
    return redirectToLogin(req, msg);
  }

  const isAdmin = computeIsAdmin(profile.email);
  const sessionJwt = await signSession({
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    isAdmin,
  });

  const safeFrom = fromCookie.startsWith("/") && !fromCookie.startsWith("//") ? fromCookie : "/";
  const res = NextResponse.redirect(new URL(safeFrom, req.url));

  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, sessionJwt, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // Clear short-lived OAuth cookies
  for (const name of ["oauth_state", "oauth_nonce", "oauth_from"]) {
    res.cookies.set(name, "", { path: "/api/auth", maxAge: 0 });
  }

  return res;
}

function redirectToLogin(req: NextRequest, error: string): NextResponse {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}
```

- [ ] **Step 2: Manual smoke test (requires operator env vars)**

In browser: navigate to `http://localhost:3000/api/auth/login`. You should be redirected to Google's account picker. Sign in with `kiennv@savameta.com`. You should land on `/` with an error since the `/login` page and middleware don't exist yet — but **the `lumipulse_session` cookie must be set**.

Open DevTools → Application → Cookies → `localhost:3000` → confirm `lumipulse_session` cookie exists, `HttpOnly`, with a long JWT-looking value.

If you instead see a redirect to `/login?error=...`, copy the error code and debug:
- `domain_not_allowed` → check signed in with savameta.com account
- `state_mismatch` → cookie not being set/sent (check `path=/api/auth` setting)
- `token_exchange_failed: 400` → check `GOOGLE_REDIRECT_URI` matches what's registered in GCP Console

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/callback/route.ts
git commit -m "feat(auth): add /api/auth/callback endpoint with state/nonce/hd verification"
```

---

## Task 6: Logout endpoint (`/api/auth/logout`)

**Files:**
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 2: Smoke test**

```bash
curl -si -X POST 'http://localhost:3000/api/auth/logout'
```

Expected: HTTP 200, body `{"ok":true}`, `Set-Cookie: lumipulse_session=; Max-Age=0; Path=/`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/logout/route.ts
git commit -m "feat(auth): add /api/auth/logout endpoint"
```

---

## Task 7: Login page (`/login`)

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
type SearchParams = { error?: string; from?: string };

const ERROR_MESSAGES: Record<string, string> = {
  domain_not_allowed: "Only @savameta.com Google accounts can sign in.",
  email_not_verified: "Your Google account email is not verified.",
  nonce_mismatch: "Login session expired. Please try again.",
  state_mismatch: "Login session expired. Please try again.",
  missing_oauth_cookies: "Login session expired. Please try again.",
  missing_code_or_state: "Login was interrupted. Please try again.",
  access_denied: "You cancelled the sign-in.",
};

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const error = searchParams.error;
  const from = searchParams.from ?? "/";
  const message = error ? (ERROR_MESSAGES[error] ?? `Sign-in failed (${error}). Please try again.`) : null;

  const loginHref = `/api/auth/login?from=${encodeURIComponent(from)}`;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm space-y-6">
        <div>
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-4 text-white font-bold">L</div>
          <h1 className="text-xl font-bold text-slate-100">Sign in to LumiPulse</h1>
          <p className="text-slate-400 text-sm mt-1">Use your @savameta.com Google account.</p>
        </div>

        {message && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <a
          href={loginHref}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1A20 20 0 0 0 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.1 5c.4-.4 6.9-5 6.9-14.7 0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Visit `http://localhost:3000/login` in browser. Verify:
- Card displays with "Sign in to LumiPulse" heading
- Google button is visible and styled white
- Clicking the button redirects to `/api/auth/login` then onward to Google

Then test error display: visit `http://localhost:3000/login?error=domain_not_allowed` — error message must appear in red box.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat(auth): add /login page with Google sign-in button"
```

---

## Task 8: Middleware — replace password auth with session JWT

This is the critical security boundary. After this task, the app gates every route.

**Files:**
- Modify: `src/middleware.ts` (rewrite entire file)

- [ ] **Step 1: Rewrite `src/middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

function isAdminZone(pathname: string): boolean {
  return (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminZone(pathname) && !session.isAdmin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (Next.js static assets)
     * - _next/image (Next.js image optimization)
     * - favicon.ico, *.png, *.svg, *.jpg, *.jpeg, *.gif (static files)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif)$).*)",
  ],
};
```

- [ ] **Step 2: Verify anonymous redirect**

Restart dev server (`yarn dev`). In a private browser window (no session cookie):

```bash
curl -sI 'http://localhost:3000/' | head -5
```

Expected: HTTP 307 with `Location: /login?from=%2F`.

- [ ] **Step 3: Verify anonymous API → 401**

```bash
curl -si 'http://localhost:3000/api/proxy/foo' | head -10
```

Expected: HTTP 401, body `{"error":"unauthorized"}`.

- [ ] **Step 4: Verify auth bypass routes still work**

```bash
curl -sI 'http://localhost:3000/login' | head -5
curl -sI 'http://localhost:3000/api/auth/login' | head -5
```

Expected: `/login` returns 200; `/api/auth/login` returns 307 → Google.

- [ ] **Step 5: Verify viewer cannot reach admin zone**

Use a non-admin savameta account (or temporarily comment out `kiennv@savameta.com` from `SEED_ADMINS` to test as viewer — remember to restore). Log in via browser, then:

```bash
# Copy the lumipulse_session cookie value from DevTools first, then:
curl -sI 'http://localhost:3000/admin/settings' -b 'lumipulse_session=<value>' | head -5
```

Expected: HTTP 307 redirect to `/`.

Restore `SEED_ADMINS` if you modified it.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): replace password middleware with session JWT verification"
```

---

## Task 9: Update root layout — derive isAdmin from session

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace layout body**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getSessionFromCookies } from "@/lib/session";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LumiPulse — Token Analytics",
  description: "Real-time token usage and adoption analytics for LumiLink",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  const isAdmin = session?.isAdmin ?? false;

  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body>
        <AppShell isAdmin={isAdmin}>{children}</AppShell>
      </body>
    </html>
  );
}
```

Note: removed `cookies` and `createHash` imports (no longer needed). `getSessionFromCookies` already reads cookies internally.

- [ ] **Step 2: Verify Sidebar visibility in browser**

Log in as admin (`kiennv@savameta.com`). Visit `/`. Sidebar must show both "DASHBOARD" and "SETTINGS" sections.

Log out, log back in as a non-admin savameta account. Sidebar must show only "DASHBOARD".

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(auth): derive isAdmin from session JWT in root layout"
```

---

## Task 10: Add session guard to proxy

The middleware already blocks unauthenticated requests to `/api/proxy/*`, but adding an explicit check at the handler level is defense-in-depth — if matcher ever misses, the handler still rejects.

**Files:**
- Modify: `src/app/api/proxy/[...path]/route.ts`

- [ ] **Step 1: Add session check at top of handler**

In `src/app/api/proxy/[...path]/route.ts`, modify the imports and the very top of the `handler` function.

Change the imports section (lines 1–2) from:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, forceRefresh } from "@/lib/auth";
```

to:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, forceRefresh } from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/session";
```

Then change the top of `handler` (right after the `if (!API_BASE_URL)` check) by adding a session guard. The function should look like:

```ts
async function handler(req: NextRequest, context: Context) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API_BASE_URL not configured" }, { status: 503 });
  }

  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const path = context.params.path.join("/");
  // ... rest of function unchanged
```

- [ ] **Step 2: Verify**

```bash
# Anonymous → 401
curl -si 'http://localhost:3000/api/proxy/api/v1/health' | head -5
```

Expected: HTTP 401 with `{"error":"unauthorized"}`.

With session cookie (from browser, copy `lumipulse_session` value):
```bash
curl -si 'http://localhost:3000/api/proxy/api/v1/health' -b 'lumipulse_session=<value>' | head -10
```

Expected: HTTP 200 (or whatever lumilink-be returns) — request passes through.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/proxy/[...path]/route.ts
git commit -m "feat(auth): add session guard to proxy as defense in depth"
```

---

## Task 11: Update Logout button in admin settings page

**Files:**
- Modify: `src/app/admin/settings/page.tsx:61-65`

- [ ] **Step 1: Update `handleLogout`**

In `src/app/admin/settings/page.tsx`, find the `handleLogout` function:

```tsx
const handleLogout = async () => {
  setLoggingOut(true);
  await fetch("/api/admin/auth", { method: "DELETE" });
  router.push("/admin/login");
};
```

Replace it with:

```tsx
const handleLogout = async () => {
  setLoggingOut(true);
  await fetch("/api/auth/logout", { method: "POST" });
  router.push("/login");
};
```

- [ ] **Step 2: Browser test**

Log in as admin. Visit `/admin/settings`. Click "Log out". Verify:
- Redirected to `/login`
- Sidebar gone (because layout sees no session)
- Visiting `/` redirects back to `/login`

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat(auth): point admin settings Logout button to OAuth logout"
```

---

## Task 12: Delete obsolete password-auth files

**Files:**
- Delete: `src/app/admin/login/page.tsx`
- Delete: `src/app/api/admin/auth/route.ts`

- [ ] **Step 1: Delete the files**

```bash
rm src/app/admin/login/page.tsx
rm src/app/api/admin/auth/route.ts
rmdir src/app/admin/login
rmdir src/app/api/admin/auth
```

- [ ] **Step 2: Search for stale references**

Run: `grep -rn "ADMIN_PANEL_PASSWORD\|admin_session\|/admin/login\|/api/admin/auth" src/`

Expected: no matches. If any are found, investigate and remove the dead references (likely none, since layout, middleware, and admin/settings have already been updated).

- [ ] **Step 3: Verify build still passes**

Run: `yarn build`
Expected: build succeeds (env vars must be set in `.env.local`).

If build fails with type errors referencing deleted files, fix the importing files.

- [ ] **Step 4: Commit**

```bash
git add -A src/app/admin src/app/api/admin
git commit -m "chore(auth): remove obsolete password-based admin login"
```

---

## Task 13: Update `.env.example` and document env requirements

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update `.env.example`**

Replace the contents of `.env.example` with:

```bash
# Base URL của lumilink-be (không có trailing slash)
API_BASE_URL=https://lumilink-be-staging.defikit.net

# Credentials để dashboard tự login vào lumilink-be backend (server-side only)
ADMIN_EMAIL=adminlumi@gmail.com
ADMIN_PASSWORD=lumilink123

# ---- Google OAuth (user-facing auth) ----

# OAuth client credentials from GCP Console → APIs & Services → Credentials
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Must match an Authorized redirect URI registered on the OAuth client
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session JWT signing secret (generate with: openssl rand -hex 32)
SESSION_SECRET=

# Comma-separated admin email allow-list. May be empty.
# kiennv@savameta.com is always admin via in-code seed.
ADMIN_EMAILS=

# Absolute app URL — used to build redirect URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: document new env vars for Google OAuth in .env.example"
```

---

## Task 14: Full end-to-end verification

Run through this checklist in a real browser before declaring the work done.

- [ ] **Anonymous → redirect**: open new private window → visit `/` → lands on `/login?from=%2F`
- [ ] **Login flow (admin)**: click "Sign in with Google" → Google picker shows → pick `kiennv@savameta.com` → lands on `/`, sidebar shows both DASHBOARD and SETTINGS
- [ ] **Admin route access**: visit `/settings/roster`, `/settings/releases`, `/settings`, `/admin/settings` — all load
- [ ] **API call from authed page**: open `/users` — data loads (proxy works with session cookie)
- [ ] **Logout**: click "Log out" on `/admin/settings` → back to `/login` → visiting `/` redirects to `/login`
- [ ] **Login flow (viewer)**: log in with any other `@savameta.com` account → lands on `/`, sidebar shows DASHBOARD only
- [ ] **Viewer blocked from admin**: as viewer, visit `/admin/settings` directly → redirected to `/`
- [ ] **Viewer blocked from admin API**: as viewer, `curl -b 'lumipulse_session=<viewer-cookie>' http://localhost:3000/api/admin/top-users` → 403 JSON
- [ ] **Wrong domain blocked**: log out, click "Sign in with Google", pick a `@gmail.com` account (or any non-savameta) → callback redirects to `/login?error=domain_not_allowed`, error message displays
- [ ] **State tampering**: log out. Open `/api/auth/login` and **before completing Google flow**, manually visit `/api/auth/callback?code=fake&state=tampered` → redirected to `/login?error=state_mismatch`
- [ ] **Session expiry**: in DevTools, edit the `lumipulse_session` cookie value to something invalid → reload `/` → redirected to `/login`
- [ ] **Session rotation by secret**: change `SESSION_SECRET` in `.env.local`, restart server → existing session invalid, redirected to `/login`

- [ ] **Commit checklist artifact (optional)**

If you took notes during verification, commit them:

```bash
# Only if you created notes file:
git add docs/superpowers/notes/2026-05-27-oauth-verification.md
git commit -m "docs: add OAuth verification notes"
```

---

## Out of scope — deferred

These were called out as YAGNI in the spec but worth listing here so they're not silently dropped:

- Refresh token rotation
- Per-user data filter on Lumi backend
- Audit log of logins
- 2FA enforcement at app layer (Google handles)
- User chip in TopBar (email + avatar + logout) — could be added separately later

---

## Rollback procedure

If something goes wrong in production after deploy:

1. Revert the auth-related commits: `git revert <range>` and redeploy.
2. Restore `ADMIN_PANEL_PASSWORD` to the deployment env.
3. The old `/admin/login` and `admin_session` cookie flow will work again.

Better: do a phased deploy on staging first (which the rollout plan in the spec assumes).
