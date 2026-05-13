import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();

  const existing = await db.execute({
    sql: "SELECT id FROM entries WHERE id = ?",
    args: [params.id],
  });
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Note: Cloudinary-hosted photos are not deleted here (would need Cloudinary API).
  // For a full implementation add: cloudinary.uploader.destroy(public_id)
  await db.execute({
    sql: "DELETE FROM entries WHERE id = ?",
    args: [params.id],
  });

  return NextResponse.json({ ok: true });
}
