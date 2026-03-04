import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const BATCH_SIZE = 25;

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  userName: string;
}

async function fetchUserInfo(userId: number, token: string): Promise<UserInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = Array.isArray(json) ? json[0] : json;
    if (!u) return null;
    return {
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? u.userName ?? "",
      avatarUrl: u.avatarUrl ?? null,
      userName: u.userName ?? "",
    };
  } catch {
    return null;
  }
}

async function fetchUserCost(
  userId: number,
  token: string,
  from: string,
  to: string
) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const url = `${API_BASE_URL}/api/v1/normal-mode/costs/user/${userId}?${params}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    if (!data || data.totalTokens === 0) return null;
    return { userId, ...data };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const maxId = Math.min(parseInt(sp.get("maxId") ?? "200"), 500);
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";

  let token: string;
  try {
    token = await getAdminToken();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }

  // Step 1: Scan costs in batches
  const ids = Array.from({ length: maxId }, (_, i) => i + 1);
  const costResults: Array<{ userId: number; totalTokens: number; totalCostUsd: number; requestCount: number; totalPromptTokens: number; totalCompletionTokens: number }> = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map((id) => fetchUserCost(id, token, from, to)));
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) costResults.push(r.value);
    }
  }

  costResults.sort((a, b) => b.totalTokens - a.totalTokens);
  const top = costResults.slice(0, 100);

  // Step 2: Fetch user info for active users only (in parallel)
  const infoResults = await Promise.allSettled(
    top.map((u) => fetchUserInfo(u.userId, token))
  );

  const users = top.map((u, i) => {
    const info = infoResults[i].status === "fulfilled" ? infoResults[i].value : null;
    return { ...u, info };
  });

  return NextResponse.json({ users, scanned: maxId });
}
