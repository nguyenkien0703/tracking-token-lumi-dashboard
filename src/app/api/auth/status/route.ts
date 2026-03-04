import { NextResponse } from "next/server";
import { getAdminToken, getTokenInfo } from "@/lib/auth";

export async function GET() {
  try {
    // Trigger login nếu chưa có token
    await getAdminToken();
    const info = getTokenInfo();
    return NextResponse.json({ status: "ok", ...info });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        hasToken: false,
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Force refresh endpoint — gọi từ settings page
  try {
    const { forceRefresh } = await import("@/lib/auth");
    await forceRefresh();
    const info = getTokenInfo();
    return NextResponse.json({ status: "ok", ...info });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
