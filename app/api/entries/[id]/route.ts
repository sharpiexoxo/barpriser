import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const existing = await db.execute({ sql: "SELECT id FROM entries WHERE id = ?", args: [params.id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.execute({ sql: "DELETE FROM entries WHERE id = ?", args: [params.id] });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
