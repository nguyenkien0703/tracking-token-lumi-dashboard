import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://lumi:lumipass@localhost:5432/lumi";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  _pool = new Pool({ connectionString: DATABASE_URL });
  return _pool;
}

export async function initSchema(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS history_entries (
      id TEXT PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "sessionId" TEXT,
      model TEXT,
      "promptTokens" INTEGER DEFAULT 0,
      "completionTokens" INTEGER DEFAULT 0,
      "totalTokens" INTEGER DEFAULT 0,
      "totalCostUsd" DOUBLE PRECISION DEFAULT 0,
      "createdAt" TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_history_userId ON history_entries("userId");
    CREATE INDEX IF NOT EXISTS idx_history_createdAt ON history_entries("createdAt");

    CREATE TABLE IF NOT EXISTS users (
      "userId" INTEGER PRIMARY KEY,
      "firstName" TEXT,
      "lastName" TEXT,
      email TEXT,
      "avatarUrl" TEXT,
      "userName" TEXT,
      "updatedAt" TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      "lastSyncAt" TEXT,
      "totalRecords" INTEGER DEFAULT 0,
      status TEXT DEFAULT 'idle'
    );

    INSERT INTO sync_state (id, status)
    VALUES (1, 'idle')
    ON CONFLICT (id) DO NOTHING;
  `);
}
