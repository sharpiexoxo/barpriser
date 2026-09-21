import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getDb(); await initDb();
    const result = await db.execute(`
      SELECT v.*, COUNT(e.id) as entry_count
      FROM venues v LEFT JOIN entries e ON e.venue_id = v.id
      WHERE v.is_featured = 1
      GROUP BY v.id ORDER BY v.city, v.name COLLATE NOCASE
    `);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
