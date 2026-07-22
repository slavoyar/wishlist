import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

function resolveSqlitePath() {
  return process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'wishlist.db');
}

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

function createConnection() {
  const sqlitePath = resolveSqlitePath();
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const sqlite = new Database(sqlitePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return sqlite;
}

const sqlite = globalForDb.sqlite ?? createConnection();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });

export function ensureSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      notes TEXT,
      price REAL,
      currency TEXT DEFAULT 'RUB',
      status TEXT NOT NULL DEFAULT 'wanted',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}

ensureSchema();
