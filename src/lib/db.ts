import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH ?? "./data/lumi.db";

// Ensure directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("synchronous = NORMAL");

  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS history_entries (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      sessionId TEXT,
      model TEXT,
      promptTokens INTEGER DEFAULT 0,
      completionTokens INTEGER DEFAULT 0,
      totalTokens INTEGER DEFAULT 0,
      totalCostUsd REAL DEFAULT 0,
      createdAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_history_userId ON history_entries(userId);
    CREATE INDEX IF NOT EXISTS idx_history_createdAt ON history_entries(createdAt);

    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      avatarUrl TEXT,
      userName TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      lastSyncAt TEXT,
      totalRecords INTEGER DEFAULT 0,
      status TEXT DEFAULT 'idle'
    );

    INSERT OR IGNORE INTO sync_state (id, status) VALUES (1, 'idle');
  `);
}
