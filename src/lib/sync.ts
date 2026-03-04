import { getDb } from "./db";
import { getAdminToken } from "./auth";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const PAGE_SIZE = 1000;
const MAX_RECORDS = 50000;
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

let syncPromise: Promise<void> | null = null;

export interface SyncState {
  lastSyncAt: string | null;
  totalRecords: number;
  status: string;
}

export function getSyncState(): SyncState {
  const db = getDb();
  const row = db
    .prepare("SELECT lastSyncAt, totalRecords, status FROM sync_state WHERE id = 1")
    .get() as SyncState | undefined;
  return row ?? { lastSyncAt: null, totalRecords: 0, status: "idle" };
}

function isStale(): boolean {
  const state = getSyncState();
  if (!state.lastSyncAt) return true;
  return Date.now() - new Date(state.lastSyncAt).getTime() > STALE_THRESHOLD_MS;
}

export function hasData(): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) as count FROM history_entries")
    .get() as { count: number };
  return row.count > 0;
}

async function doSync(): Promise<void> {
  const db = getDb();

  db.prepare("UPDATE sync_state SET status = 'syncing' WHERE id = 1").run();

  try {
    const token = await getAdminToken();

    const insert = db.prepare(`
      INSERT OR REPLACE INTO history_entries
        (id, userId, sessionId, model, promptTokens, completionTokens, totalTokens, totalCostUsd, createdAt)
      VALUES
        (@id, @userId, @sessionId, @model, @promptTokens, @completionTokens, @totalTokens, @totalCostUsd, @createdAt)
    `);

    const insertMany = db.transaction((entries: Array<Record<string, unknown>>) => {
      for (const e of entries) insert.run(e);
    });

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
      if (offset === 0) console.log("[sync] First response:", JSON.stringify(json).slice(0, 400));
      const data = json?.data;
      total = data?.total ?? 0;
      const entries: Array<Record<string, unknown>> = data?.entries ?? [];

      if (entries.length === 0) break;

      const rows = entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        sessionId: e.sessionId ?? null,
        model: e.model ?? null,
        promptTokens: e.promptTokens ?? 0,
        completionTokens: e.completionTokens ?? 0,
        totalTokens: e.totalTokens ?? 0,
        totalCostUsd: e.totalCostUsd ?? 0,
        createdAt: e.createdAt ?? null,
      }));

      insertMany(rows);
      fetched += entries.length;
      offset += PAGE_SIZE;
    } while (fetched < total && fetched < MAX_RECORDS);

    db.prepare(
      "UPDATE sync_state SET lastSyncAt = ?, totalRecords = ?, status = 'idle' WHERE id = 1"
    ).run(new Date().toISOString(), total);

    console.log(`[sync] Done. total=${total}, fetched=${fetched}`);
  } catch (err) {
    console.error("[sync] Error:", err);
    db.prepare("UPDATE sync_state SET status = 'error' WHERE id = 1").run();
    throw err;
  }
}

/**
 * Trigger sync if data is stale.
 * - blocking=true: await completion (used when DB is empty)
 * - blocking=false: fire-and-forget (returns immediately)
 */
export async function syncIfStale(blocking = false): Promise<void> {
  if (!isStale()) return;

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
