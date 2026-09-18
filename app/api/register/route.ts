import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !name || !password) return NextResponse.json({ error: "Alle felter er påkrævet" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Adgangskoden skal være mindst 6 tegn" }, { status: 400 });
    const db = getDb(); await initDb();
    const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email.toLowerCase()] });
    if (existing.rows.length > 0) return NextResponse.json({ error: "E-mail er allerede registreret" }, { status: 400 });
    const hashed = await bcrypt.hash(password, 12);
    await db.execute({ sql: "INSERT INTO users (email, name, password) VALUES (?, ?, ?)", args: [email.toLowerCase(), name.trim(), hashed] });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
