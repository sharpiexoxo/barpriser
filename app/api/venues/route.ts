import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const db = getDb();
    await initDb();
    const result = city
      ? await db.execute({
          sql: `SELECT v.*, COUNT(e.id) as entry_count, ROUND(AVG(e.price_dkk)) as avg_price
                FROM venues v LEFT JOIN entries e ON e.venue_id = v.id
                WHERE v.city = ? GROUP BY v.id ORDER BY v.name COLLATE NOCASE`,
          args: [city],
        })
      : await db.execute(`
          SELECT v.*, COUNT(e.id) as entry_count, ROUND(AVG(e.price_dkk)) as avg_price
          FROM venues v LEFT JOIN entries e ON e.venue_id = v.id
          GROUP BY v.id ORDER BY v.name COLLATE NOCASE`);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });

    const { name, city, location } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Stedets navn er påkrævet" }, { status: 400 });
    if (!city?.trim()) return NextResponse.json({ error: "By er påkrævet" }, { status: 400 });

    const db = getDb();
    await initDb();

    // Try to add city column if it doesn't exist yet
    try {
      await db.execute(`ALTER TABLE venues ADD COLUMN city TEXT NOT NULL DEFAULT 'aarhus'`);
    } catch {
      // Column already exists — ignore
    }

    const result = await db.execute({
      sql: "INSERT INTO venues (name, city, location) VALUES (?, ?, ?)",
      args: [name.trim(), city.trim(), location?.trim() ?? null],
    });
    const row = await db.execute({
      sql: "SELECT * FROM venues WHERE id = ?",
      args: [result.lastInsertRowid!],
    });
    return NextResponse.json({ ...row.rows[0], entry_count: 0, avg_price: null }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
