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
    const fullMsg = err instanceof Error ? err.message : "unknown_error";
    console.error("[auth/callback] OAuth verification failed:", fullMsg);
    // Map to short stable tag — never put raw error into redirect URL
    const tag = fullMsg.startsWith("token_exchange_failed")
      ? "token_exchange_failed"
      : fullMsg;
    return redirectToLogin(req, tag);
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
