import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const PAGE_SIZE = 1000;
const MAX_PAGES = 20; // up to 20,000 records

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  userName: string;
}

interface AggregatedUser {
  userId: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  requestCount: number;
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

async function fetchHistoryPage(
  token: string,
  from: string,
  to: string,
  limit: number,
  offset: number
): Promise<{ entries: Array<{ userId: number; promptTokens: number; completionTokens: number; totalTokens: number; totalCostUsd: number }>; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await fetch(`${API_BASE_URL}/api/v1/normal-mode/costs/history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { entries: [], total: 0 };
  const json = await res.json();
  const data = json?.data;
  return {
    entries: data?.entries ?? [],
    total: data?.total ?? 0,
  };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";

  let token: string;
  try {
    token = await getAdminToken();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }

  // Strategy 1: Fetch all history records (no userId filter) and group by userId
  // This finds ALL users regardless of their ID
  const aggregated = new Map<number, AggregatedUser>();
  let totalRecords = 0;
  let fetchedRecords = 0;

  // First page — get total
  const firstPage = await fetchHistoryPage(token, from, to, PAGE_SIZE, 0);
  totalRecords = firstPage.total;

  for (const e of firstPage.entries) {
    const uid = e.userId;
    if (!uid) continue;
    const existing = aggregated.get(uid) ?? { userId: uid, totalTokens: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalCostUsd: 0, requestCount: 0 };
    existing.totalTokens += e.totalTokens ?? 0;
    existing.totalPromptTokens += e.promptTokens ?? 0;
    existing.totalCompletionTokens += e.completionTokens ?? 0;
    existing.totalCostUsd += e.totalCostUsd ?? 0;
    existing.requestCount += 1;
    aggregated.set(uid, existing);
  }
  fetchedRecords += firstPage.entries.length;

  // If history API works (returns records without userId), paginate through all
  if (totalRecords > PAGE_SIZE) {
    const remainingPages = Math.min(Math.ceil((totalRecords - PAGE_SIZE) / PAGE_SIZE), MAX_PAGES - 1);
    const pagePromises: Promise<void>[] = [];

    for (let page = 1; page <= remainingPages; page++) {
      const offset = page * PAGE_SIZE;
      pagePromises.push(
        fetchHistoryPage(token, from, to, PAGE_SIZE, offset).then((result) => {
          for (const e of result.entries) {
            const uid = e.userId;
            if (!uid) continue;
            const existing = aggregated.get(uid) ?? { userId: uid, totalTokens: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalCostUsd: 0, requestCount: 0 };
            existing.totalTokens += e.totalTokens ?? 0;
            existing.totalPromptTokens += e.promptTokens ?? 0;
            existing.totalCompletionTokens += e.completionTokens ?? 0;
            existing.totalCostUsd += e.totalCostUsd ?? 0;
            existing.requestCount += 1;
            aggregated.set(uid, existing);
          }
          fetchedRecords += result.entries.length;
        })
      );
    }
    await Promise.all(pagePromises);
  }

  // Sort by totalTokens descending, take top 100
  const sorted = Array.from(aggregated.values())
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .slice(0, 100);

  // Fetch user info in parallel for top users
  const infoResults = await Promise.allSettled(
    sorted.map((u) => fetchUserInfo(u.userId, token))
  );

  const users = sorted.map((u, i) => {
    const info = infoResults[i].status === "fulfilled" ? infoResults[i].value : null;
    return { ...u, info };
  });

  return NextResponse.json({
    users,
    scanned: aggregated.size, // unique users found
    totalRecords,
    fetchedRecords,
  });
}
