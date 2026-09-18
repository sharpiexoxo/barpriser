import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-mail er påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    const result = await db.execute({ sql: "SELECT id, name FROM users WHERE email = ?", args: [email.toLowerCase()] });
    if (result.rows.length === 0) return NextResponse.json({ ok: true });
    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    await db.execute({ sql: "UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0", args: [user.id] });
    await db.execute({ sql: "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)", args: [user.id, token, expiresAt] });
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log("Password reset URL:", resetUrl);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
