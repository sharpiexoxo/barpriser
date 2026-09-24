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
      SELECT e.*, v.name as venue_name, v.city as venue_city, u.name as user_name
      FROM entries e
      JOIN venues v ON v.id = e.venue_id
      LEFT JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC
      LIMIT 200
    `);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id, drink, category, price_dkk, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();

    const fields: string[] = [];
    const args: (string | number | null)[] = [];
    if (drink     !== undefined) { fields.push("drink = ?");     args.push(drink); }
    if (category  !== undefined) { fields.push("category = ?");  args.push(category ?? null); }
    if (price_dkk !== undefined) { fields.push("price_dkk = ?"); args.push(Number(price_dkk)); }
    if (notes     !== undefined) { fields.push("notes = ?");     args.push(notes ?? null); }
    if (!fields.length) return NextResponse.json({ error: "Ingen felter at opdatere" }, { status: 400 });

    args.push(id);
    await db.execute({ sql: `UPDATE entries SET ${fields.join(", ")} WHERE id = ?`, args });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    await db.execute({ sql: "DELETE FROM entries WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
