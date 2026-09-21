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
      SELECT r.*, e.drink, e.price_dkk, v.name as venue_name, v.city as venue_city,
             u.name as reporter_name
      FROM reports r
      JOIN entries e ON e.id = r.entry_id
      JOIN venues v ON v.id = e.venue_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.resolved = 0
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id, action } = await req.json();
    const db = getDb(); await initDb();
    if (action === "resolve") {
      await db.execute({ sql: "UPDATE reports SET resolved = 1 WHERE id = ?", args: [id] });
    } else if (action === "delete_entry") {
      const report = await db.execute({ sql: "SELECT entry_id FROM reports WHERE id = ?", args: [id] });
      if (report.rows[0]) {
        await db.execute({ sql: "DELETE FROM entries WHERE id = ?", args: [report.rows[0].entry_id] });
        await db.execute({ sql: "UPDATE reports SET resolved = 1 WHERE id = ?", args: [id] });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
