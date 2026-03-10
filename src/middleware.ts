import { NextRequest, NextResponse } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin/* but not the login page itself
  if (pathname === "/admin/login") return NextResponse.next();

  const sessionCookie = req.cookies.get("admin_session")?.value;
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD ?? "";
  const expectedHash = await hashPassword(adminPassword);

  if (sessionCookie !== expectedHash) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
