// scripts/seed.js  — run with: node scripts/seed.js
// Reads TURSO_DATABASE_URL + TURSO_AUTH_TOKEN from .env.local if present

const fs = require("fs");
const path = require("path");

// Minimal .env.local parser
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}

const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:barpriser.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
      drink TEXT NOT NULL,
      category TEXT,
      price_dkk REAL NOT NULL,
      notes TEXT,
      photo_path TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const ins = (sql, args) => db.execute({ sql, args });

  const v1 = (await ins("INSERT INTO venues (name, location) VALUES (?,?)", ["Under Masken",        "Latin Quarter"])).lastInsertRowid;
  const v2 = (await ins("INSERT INTO venues (name, location) VALUES (?,?)", ["Karolines Køkken",    "Aboulevarden"])).lastInsertRowid;
  const v3 = (await ins("INSERT INTO venues (name, location) VALUES (?,?)", ["Sherlock Holmes Pub", "Frederiksgade"])).lastInsertRowid;
  const v4 = (await ins("INSERT INTO venues (name, location) VALUES (?,?)", ["Cafe Smagløs",        "Skolegade"])).lastInsertRowid;

  const e = (vid, drink, cat, price, notes = null) =>
    ins("INSERT INTO entries (venue_id,drink,category,price_dkk,notes) VALUES (?,?,?,?,?)",
        [vid, drink, cat, price, notes]);

  await e(v1, "Carlsberg 50cl",    "Beer (draft)",      65, "Happy hour before 18:00");
  await e(v1, "House red wine",    "Wine (glass)",      72);
  await e(v1, "Gin & Tonic",       "Cocktail",          98, "Hendricks");
  await e(v1, "Øl i bøtte 40cl",   "Beer (draft)",      55);

  await e(v2, "Negroni",           "Cocktail",         115);
  await e(v2, "Draft IPA 40cl",    "Beer (draft)",      78);
  await e(v2, "Aperol Spritz",     "Cocktail",         105);
  await e(v2, "Prosecco",          "Wine (glass)",      85);

  await e(v3, "Guinness pint",     "Beer (draft)",      85);
  await e(v3, "Whisky sour",       "Cocktail",          98);
  await e(v3, "Estrella 33cl",     "Beer (bottle/can)", 62);
  await e(v3, "Jameson shot",      "Shot",              45);

  await e(v4, "Tuborg 50cl",       "Beer (draft)",      60);
  await e(v4, "Red wine",          "Wine (glass)",      68);
  await e(v4, "Faxe Kondi (can)",  "Soft drink",        35);

  console.log("✓ Seeded 4 venues and 15 entries");
}

main().catch(console.error);
