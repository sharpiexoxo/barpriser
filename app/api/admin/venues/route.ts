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
    const { id, is_featured, name, city, location } = await req.json();
    if (!id) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();

    // Build dynamic update
    const fields: string[] = [];
    const args: (string | number | null)[] = [];
    if (is_featured !== undefined) { fields.push("is_featured = ?"); args.push(is_featured ? 1 : 0); }
    if (name      !== undefined)   { fields.push("name = ?");        args.push(name); }
    if (city      !== undefined)   { fields.push("city = ?");        args.push(city); }
    if (location  !== undefined)   { fields.push("location = ?");    args.push(location ?? null); }
    if (!fields.length) return NextResponse.json({ error: "Ingen felter at opdatere" }, { status: 400 });

    args.push(id);
    await db.execute({ sql: `UPDATE venues SET ${fields.join(", ")} WHERE id = ?`, args });
    const updated = await db.execute({ sql: "SELECT * FROM venues WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true, venue: { ...updated.rows[0] } });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    await db.execute({ sql: "DELETE FROM venues WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
