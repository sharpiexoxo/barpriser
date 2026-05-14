import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set.");
  _client = createClient({ url, authToken });
  return _client;
}

let _initialized = false;

export async function initDb(): Promise<void> {
  if (_initialized) return;
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    drink TEXT NOT NULL,
    category TEXT,
    price_dkk REAL NOT NULL,
    notes TEXT,
    photo_path TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_venue ON entries(venue_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_cat ON entries(category)`);
  _initialized = true;
}

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
