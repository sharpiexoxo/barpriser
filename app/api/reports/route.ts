import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
    const { entry_id, reason, details } = await req.json();
    if (!entry_id || !reason) return NextResponse.json({ error: "entry_id og årsag er påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    const entry = await db.execute({ sql: "SELECT id FROM entries WHERE id = ?", args: [entry_id] });
    if (entry.rows.length === 0) return NextResponse.json({ error: "Pris ikke fundet" }, { status: 404 });
    const userId = (session.user as any).id;
    const existing = await db.execute({ sql: "SELECT id FROM reports WHERE entry_id = ? AND user_id = ?", args: [entry_id, userId] });
    if (existing.rows.length > 0) return NextResponse.json({ error: "Du har allerede rapporteret denne pris" }, { status: 400 });
    await db.execute({ sql: "INSERT INTO reports (entry_id, user_id, reason, details) VALUES (?, ?, ?, ?)", args: [entry_id, userId, reason, details ?? null] });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
