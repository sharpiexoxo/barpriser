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

  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'aarhus',
    location TEXT,
    is_featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    drink TEXT NOT NULL,
    category TEXT,
    price_dkk REAL NOT NULL,
    notes TEXT,
    photo_path TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Auto-migrations for existing databases
  try { await db.execute(`ALTER TABLE venues ADD COLUMN city TEXT NOT NULL DEFAULT 'aarhus'`); } catch {}
  try { await db.execute(`ALTER TABLE venues ADD COLUMN is_featured INTEGER DEFAULT 0`); } catch {}
  try { await db.execute(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`); } catch {}

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_venue   ON entries(venue_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_entries_cat     ON entries(category)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_venues_city     ON venues(city)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_venues_featured ON venues(is_featured)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_reports_entry   ON reports(entry_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_resets_token    ON password_resets(token)`);

  _initialized = true;
}

export interface Venue {
  id: number; name: string; city: string; location: string | null;
  is_featured: number; created_at: string;
  entry_count?: number; avg_price?: number | null;
}
export interface Entry {
  id: number; venue_id: number; user_id: number | null; drink: string;
  category: string | null; price_dkk: number; notes: string | null;
  photo_path: string | null; created_at: string;
  venue_name?: string; venue_location?: string | null; venue_city?: string;
  user_name?: string | null; report_count?: number;
}
export interface Stats {
  total_entries: number; total_venues: number;
  overall_avg: number | null; overall_min: number | null; overall_max: number | null;
  by_category: { category: string; count: number; avg_price: number }[];
  by_venue: { id: number; name: string; city: string; location: string | null;
    count: number; avg_price: number; min_price: number; max_price: number }[];
}
