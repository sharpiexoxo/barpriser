import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getDb();
    await initDb();
    const result = await db.execute(`
      SELECT v.*, COUNT(e.id) as entry_count, ROUND(AVG(e.price_dkk)) as avg_price
      FROM venues v LEFT JOIN entries e ON e.venue_id = v.id
      GROUP BY v.id ORDER BY v.name COLLATE NOCASE
    `);
    return NextResponse.json(result.rows.map((r) => ({ ...r })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name, location } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const db = getDb();
    await initDb();
    const result = await db.execute({
      sql: "INSERT INTO venues (name, location) VALUES (?, ?)",
      args: [name.trim(), location?.trim() ?? null],
    });
    const row = await db.execute({ sql: "SELECT * FROM venues WHERE id = ?", args: [result.lastInsertRowid!] });
    return NextResponse.json({ ...row.rows[0], entry_count: 0, avg_price: null }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
