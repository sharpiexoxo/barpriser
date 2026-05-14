import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { entry_id, reason, details } = await req.json();
    if (!entry_id || !reason)
      return NextResponse.json({ error: "entry_id and reason required" }, { status: 400 });

    const db = getDb();
    await initDb();

    // Check entry exists
    const entry = await db.execute({ sql: "SELECT id FROM entries WHERE id = ?", args: [entry_id] });
    if (entry.rows.length === 0)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    // Prevent duplicate reports from same user
    const userId = (session.user as { id?: string }).id;
    const existing = await db.execute({
      sql: "SELECT id FROM reports WHERE entry_id = ? AND user_id = ?",
      args: [entry_id, userId ?? null],
    });
    if (existing.rows.length > 0)
      return NextResponse.json({ error: "You already reported this entry" }, { status: 400 });

    await db.execute({
      sql: "INSERT INTO reports (entry_id, user_id, reason, details) VALUES (?, ?, ?, ?)",
      args: [entry_id, userId ?? null, reason, details ?? null],
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const db = getDb();
    await initDb();

    const reports = await db.execute(`
      SELECT r.*, e.drink, e.price_dkk, v.name as venue_name, u.name as reporter_name
      FROM reports r
      JOIN entries e ON e.id = r.entry_id
      JOIN venues v ON v.id = e.venue_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.resolved = 0
      ORDER BY r.created_at DESC
    `);

    return NextResponse.json(reports.rows.map((r) => ({ ...r })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
