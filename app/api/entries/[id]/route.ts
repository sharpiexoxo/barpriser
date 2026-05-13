import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  await initDb();

  const existing = await db.execute({
    sql: "SELECT id FROM entries WHERE id = ?",
    args: [params.id],
  });
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.execute({
    sql: "DELETE FROM entries WHERE id = ?",
    args: [params.id],
  });

  return NextResponse.json({ ok: true });
}
