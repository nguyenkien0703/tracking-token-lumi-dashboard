import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "lumi_admin_token";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token || typeof token !== "string" || token.trim().length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token.trim(), {
    httpOnly: true,      // Không accessible từ JS browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return NextResponse.json({ hasToken: !!token });
}
