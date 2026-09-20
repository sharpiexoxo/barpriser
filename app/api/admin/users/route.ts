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
    const result = await db.execute(`SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC`);
    return NextResponse.json(result.rows.map(r => ({ ...r })));
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Ingen adgang" }, { status: 403 });
    const { id, is_admin } = await req.json();
    if (!id) return NextResponse.json({ error: "id påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    await db.execute({ sql: "UPDATE users SET is_admin = ? WHERE id = ?", args: [is_admin ? 1 : 0, id] });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
