import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, forceRefresh } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";

export async function GET(req: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json({ success: false, error: "API_BASE_URL not configured" }, { status: 503 });
  }

  const sp = req.nextUrl.searchParams;
  const params = new URLSearchParams();
  const sortBy = sp.get("sortBy");
  const limit = sp.get("limit");
  const from = sp.get("from");
  const to = sp.get("to");
  if (sortBy) params.set("sortBy", sortBy);
  if (limit) params.set("limit", limit);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const doFetch = async (token: string) =>
    fetch(`${API_BASE_URL}/admin/costs/top-users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

  try {
    let token = await getAdminToken();
    let res = await doFetch(token);

    if (res.status === 401) {
      token = await forceRefresh();
      res = await doFetch(token);
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[admin/top-users] Non-JSON response:", res.status, text.slice(0, 200));
      return NextResponse.json(
        { success: false, error: `Backend returned status ${res.status} (endpoint may not be implemented yet)` },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
