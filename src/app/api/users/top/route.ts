import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { syncIfStale, hasData, getSyncState } from "@/lib/sync";

const API_BASE_URL = process.env.API_BASE_URL ?? "";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  userName: string;
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

    const pool = getPool();
    await pool.query(
      `INSERT INTO users ("userId", "firstName", "lastName", email, "avatarUrl", "userName", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT ("userId") DO UPDATE SET
         "firstName"=$2, "lastName"=$3, email=$4,
         "avatarUrl"=$5, "userName"=$6, "updatedAt"=$7`,
      [userId, info.firstName, info.lastName, info.email, info.avatarUrl, info.userName, new Date().toISOString()]
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

  // Block on first load (empty DB), background otherwise
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const pool = getPool();

  // Build aggregate query with optional date filter
  const conditions: string[] = [];
  const params: string[] = [];
  let idx = 1;
  if (from) { conditions.push(`"createdAt" >= $${idx++}`); params.push(from); }
  if (to)   { conditions.push(`"createdAt" <= $${idx++}`); params.push(to); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT
       "userId",
       SUM("totalTokens")::int      AS "totalTokens",
       SUM("promptTokens")::int     AS "totalPromptTokens",
       SUM("completionTokens")::int AS "totalCompletionTokens",
       SUM("totalCostUsd")          AS "totalCostUsd",
       COUNT(*)::int                AS "requestCount"
     FROM history_entries
     ${where}
     GROUP BY "userId"
     ORDER BY "totalTokens" DESC
     LIMIT 100`,
    params
  );

  // Get user info: DB cache first, fallback to API
  let token: string | null = null;
  try { token = await getAdminToken(); } catch { /* skip */ }

  const users = await Promise.all(
    rows.map(async (row) => {
      const cached = await pool.query(
        `SELECT "firstName","lastName",email,"avatarUrl","userName" FROM users WHERE "userId"=$1`,
        [row.userId]
      );

      let info: UserInfo | null = cached.rows[0] ?? null;

      if (!info && token) {
        info = await fetchAndCacheUserInfo(row.userId, token);
      }

      return { ...row, info };
    })
  );

  const syncState = await getSyncState();

  return NextResponse.json({
    users,
    totalRecords: syncState.totalRecords,
    lastSyncAt: syncState.lastSyncAt,
    syncStatus: syncState.status,
  });
}
