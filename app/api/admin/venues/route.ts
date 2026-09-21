import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const db = getDb(); await initDb();
    const result = await db.execute(`
      SELECT v.*, COUNT(e.id) as entry_count
      FROM venues v LEFT JOIN entries e ON e.venue_id = v.id
      GROUP BY v.id ORDER BY v.city, v.name COLLATE NOCASE
    `);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id, is_featured } = await req.json();
    if (id === undefined) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    await db.execute({
      sql: "UPDATE venues SET is_featured = ? WHERE id = ?",
      args: [is_featured ? 1 : 0, id],
    });
    const updated = await db.execute({ sql: "SELECT * FROM venues WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true, venue: { ...updated.rows[0] } });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
