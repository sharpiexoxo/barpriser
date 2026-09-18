import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "Token og adgangskode er påkrævet" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Adgangskoden skal være mindst 6 tegn" }, { status: 400 });
    const db = getDb(); await initDb();
    const result = await db.execute({ sql: "SELECT pr.*, u.email FROM password_resets pr JOIN users u ON u.id = pr.user_id WHERE pr.token = ? AND pr.used = 0", args: [token] });
    if (result.rows.length === 0) return NextResponse.json({ error: "Ugyldigt eller udløbet nulstillingslink" }, { status: 400 });
    const reset = result.rows[0];
    if (new Date(reset.expires_at as string) < new Date()) return NextResponse.json({ error: "Nulstillingslinket er udløbet" }, { status: 400 });
    const hashed = await bcrypt.hash(password, 12);
    await db.execute({ sql: "UPDATE users SET password = ? WHERE id = ?", args: [hashed, reset.user_id] });
    await db.execute({ sql: "UPDATE password_resets SET used = 1 WHERE token = ?", args: [token] });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
