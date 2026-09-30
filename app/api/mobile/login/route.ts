import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, initDb } from "@/lib/db";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "E-mail og adgangskode påkrævet" }, { status: 400 });
    const db = getDb(); await initDb();
    const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email.toLowerCase()] });
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: "Forkert e-mail eller adgangskode" }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) return NextResponse.json({ error: "Forkert e-mail eller adgangskode" }, { status: 401 });
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "secret");
    const token = await new SignJWT({ id: String(user.id), email: user.email, name: user.name })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);
    return NextResponse.json({ token, user: { id: String(user.id), email: user.email as string, name: user.name as string } });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
