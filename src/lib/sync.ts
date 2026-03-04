import { getPool } from "./db";
import { getAdminToken } from "./auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const PAGE_SIZE = 1000;
const MAX_RECORDS = 50000;
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

let syncPromise: Promise<void> | null = null;

export interface SyncState {
  lastSyncAt: string | null;
  totalRecords: number;
  status: string;
}

export async function getSyncState(): Promise<SyncState> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT "lastSyncAt", "totalRecords", status FROM sync_state WHERE id = 1`
  );
  const row = res.rows[0];
  return row ?? { lastSyncAt: null, totalRecords: 0, status: "idle" };
}

async function isStale(): Promise<boolean> {
  const state = await getSyncState();
  if (!state.lastSyncAt) return true;
  return Date.now() - new Date(state.lastSyncAt).getTime() > STALE_THRESHOLD_MS;
}

export async function hasData(): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query(`SELECT COUNT(*)::int AS count FROM history_entries`);
  return (res.rows[0]?.count ?? 0) > 0;
}

async function doSync(): Promise<void> {
  const pool = getPool();

  await pool.query(`UPDATE sync_state SET status = 'syncing' WHERE id = 1`);

  try {
    const token = await getAdminToken();

    let offset = 0;
    let total = 0;
    let fetched = 0;

    do {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      const res = await fetch(
        `${API_BASE_URL}/api/v1/normal-mode/costs/history?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`[sync] API error ${res.status}:`, text.slice(0, 300));
        break;
      }

      const json = await res.json();
      const data = json?.data;
      total = data?.total ?? 0;
      const entries: Array<Record<string, unknown>> = data?.entries ?? [];

      if (entries.length === 0) break;

      // Batch upsert
      const values = entries.map((e) => [
        e.id,
        e.userId,
        e.sessionId ?? null,
        e.model ?? null,
        e.promptTokens ?? 0,
        e.completionTokens ?? 0,
        e.totalTokens ?? 0,
        e.totalCostUsd ?? 0,
        e.createdAt ?? null,
      ]);

      for (const row of values) {
        await pool.query(
          `INSERT INTO history_entries
             (id, "userId", "sessionId", model, "promptTokens", "completionTokens", "totalTokens", "totalCostUsd", "createdAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO UPDATE SET
             "userId"=$2, "sessionId"=$3, model=$4,
             "promptTokens"=$5, "completionTokens"=$6,
             "totalTokens"=$7, "totalCostUsd"=$8, "createdAt"=$9`,
          row
        );
      }

      fetched += entries.length;
      offset += PAGE_SIZE;
    } while (fetched < total && fetched < MAX_RECORDS);

    await pool.query(
      `UPDATE sync_state SET "lastSyncAt"=$1, "totalRecords"=$2, status='idle' WHERE id=1`,
      [new Date().toISOString(), total]
    );

    console.log(`[sync] Done. total=${total}, fetched=${fetched}`);
  } catch (err) {
    console.error("[sync] Error:", err);
    await pool.query(`UPDATE sync_state SET status='error' WHERE id=1`);
    throw err;
  }
}

/**
 * Trigger sync if data is stale.
 * - blocking=true: await completion (used when DB is empty)
 * - blocking=false: fire-and-forget
 */
export async function syncIfStale(blocking = false): Promise<void> {
  if (!(await isStale())) return;

  if (!syncPromise) {
    syncPromise = doSync().finally(() => {
      syncPromise = null;
    });
  }

  if (blocking) await syncPromise;
}

/** Force sync regardless of staleness (used by manual refresh) */
export async function forceSync(): Promise<void> {
  if (!syncPromise) {
    syncPromise = doSync().finally(() => {
      syncPromise = null;
    });
  }
  return syncPromise;
}
