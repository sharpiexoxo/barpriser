import { createClient } from "@libsql/client";

// Works both locally (file:) and on Vercel (libsql:// Turso URL)
export function getDb() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:barpriser.db";
  const authToken = process.env.TURSO_AUTH_TOKEN; // undefined is fine for local file

  return createClient({ url, authToken });
}

export async function initDb() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS venues (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      location   TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id   INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      drink      TEXT NOT NULL,
      category   TEXT,
      price_dkk  REAL NOT NULL,
      notes      TEXT,
      photo_path TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_entries_venue   ON entries(venue_id);
    CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_cat     ON entries(category);
  `);
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Venue {
  id: number;
  name: string;
  location: string | null;
  created_at: string;
  entry_count?: number;
  avg_price?: number | null;
}

export interface Entry {
  id: number;
  venue_id: number;
  drink: string;
  category: string | null;
  price_dkk: number;
  notes: string | null;
  photo_path: string | null;
  created_at: string;
  venue_name?: string;
  venue_location?: string | null;
}

export interface Stats {
  total_entries: number;
  total_venues: number;
  overall_avg: number | null;
  overall_min: number | null;
  overall_max: number | null;
  by_category: { category: string; count: number; avg_price: number }[];
  by_venue: {
    id: number;
    name: string;
    location: string | null;
    count: number;
    avg_price: number;
    min_price: number;
    max_price: number;
  }[];
}
