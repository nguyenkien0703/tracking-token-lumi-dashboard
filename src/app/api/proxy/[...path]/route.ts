import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, forceRefresh } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";

type Context = { params: { path: string[] } };

async function handler(req: NextRequest, context: Context) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API_BASE_URL not configured" }, { status: 503 });
  }

  const path = context.params.path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}/${path}${search}`;

  // Buffer body trước vì req.text() chỉ đọc được 1 lần
  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  const doFetch = async (token: string) =>
    fetch(targetUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

  try {
    let token = await getAdminToken();
    let upstreamRes = await doFetch(token);

    // Token hết hạn → tự refresh và retry 1 lần
    if (upstreamRes.status === 401) {
      console.log("[proxy] Got 401 — forcing token refresh and retrying...");
      token = await forceRefresh();
      upstreamRes = await doFetch(token);
    }

    const responseBody = await upstreamRes.text();
    return new NextResponse(responseBody, {
      status: upstreamRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[proxy] Error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
