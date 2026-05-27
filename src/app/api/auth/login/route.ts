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
