import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token mangler" }, { status: 400 });

    const db = getDb(); await initDb();
    const result = await db.execute({
      sql: "SELECT ev.*, u.email FROM email_verifications ev JOIN users u ON u.id = ev.user_id WHERE ev.token = ? AND ev.used = 0",
      args: [token],
    });

    if (result.rows.length === 0)
      return NextResponse.json({ error: "Ugyldigt eller udløbet bekræftelseslink" }, { status: 400 });

    const verification = result.rows[0];
    if (new Date(verification.expires_at as string) < new Date())
      return NextResponse.json({ error: "Bekræftelseslinket er udløbet" }, { status: 400 });

    await db.execute({ sql: "UPDATE users SET is_verified = 1 WHERE id = ?", args: [verification.user_id] });
    await db.execute({ sql: "UPDATE email_verifications SET used = 1 WHERE token = ?", args: [token] });

    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
