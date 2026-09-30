import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
    const token = auth.slice(7);
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "secret");
    const { payload } = await jwtVerify(token, secret);
    const db = getDb(); await initDb();
    const result = await db.execute({ sql: "SELECT id, name, email, is_admin FROM users WHERE id = ?", args: [payload.id as string] });
    if (!result.rows[0]) return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
    return NextResponse.json({ ...result.rows[0] });
  } catch (e) { return NextResponse.json({ error: "Ugyldig token" }, { status: 401 }); }
}
