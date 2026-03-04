import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { syncIfStale, hasData, getSyncState } from "@/lib/sync";

const API_BASE_URL = process.env.API_BASE_URL ?? "";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  userName: string;
}

interface CachedUser extends UserInfo {
  userId: number;
  updatedAt: string;
}

async function fetchAndCacheUserInfo(
  userId: number,
  token: string
): Promise<UserInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = Array.isArray(json) ? json[0] : json;
    if (!u) return null;

    const info: UserInfo = {
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? u.userName ?? "",
      avatarUrl: u.avatarUrl ?? null,
      userName: u.userName ?? "",
    };

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO users (userId, firstName, lastName, email, avatarUrl, userName, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      info.firstName,
      info.lastName,
      info.email,
      info.avatarUrl,
      info.userName,
      new Date().toISOString()
    );

    return info;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";

  // Block on first load (empty DB), otherwise background sync
  const dbEmpty = !hasData();
  await syncIfStale(dbEmpty);

  const db = getDb();

  // Aggregate from DB
  let query = `
    SELECT
      userId,
      SUM(totalTokens)      AS totalTokens,
      SUM(promptTokens)     AS totalPromptTokens,
      SUM(completionTokens) AS totalCompletionTokens,
      SUM(totalCostUsd)     AS totalCostUsd,
      COUNT(*)              AS requestCount
    FROM history_entries
  `;
  const params: string[] = [];
  const conditions: string[] = [];
  if (from) { conditions.push("createdAt >= ?"); params.push(from); }
  if (to)   { conditions.push("createdAt <= ?"); params.push(to); }
  if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;
  query += " GROUP BY userId ORDER BY totalTokens DESC LIMIT 100";

  const rows = db.prepare(query).all(...params) as Array<{
    userId: number;
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalCostUsd: number;
    requestCount: number;
  }>;

  // Get user info: DB cache first, fallback to API
  let token: string | null = null;
  try { token = await getAdminToken(); } catch { /* skip */ }

  const users = await Promise.all(
    rows.map(async (row) => {
      const cached = db
        .prepare("SELECT * FROM users WHERE userId = ?")
        .get(row.userId) as CachedUser | undefined;

      let info: UserInfo | null = cached
        ? {
            firstName: cached.firstName,
            lastName: cached.lastName,
            email: cached.email,
            avatarUrl: cached.avatarUrl,
            userName: cached.userName,
          }
        : null;

      if (!info && token) {
        info = await fetchAndCacheUserInfo(row.userId, token);
      }

      return { ...row, info };
    })
  );

  const syncState = getSyncState();

  return NextResponse.json({
    users,
    totalRecords: syncState.totalRecords,
    lastSyncAt: syncState.lastSyncAt,
    syncStatus: syncState.status,
  });
}
