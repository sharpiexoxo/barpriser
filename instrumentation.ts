export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDb } = await import("./lib/db");
    const db = getDb();
    await db.batch([
      `CREATE TABLE IF NOT EXISTS venues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
        drink TEXT NOT NULL,
        category TEXT,
        price_dkk REAL NOT NULL,
        notes TEXT,
        photo_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_entries_venue ON entries(venue_id)`,
      `CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_entries_cat ON entries(category)`,
    ], "write");
  }
}
