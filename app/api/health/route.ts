import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, unknown> = {
    turso_url_set: !!process.env.TURSO_DATABASE_URL,
    turso_token_set: !!process.env.TURSO_AUTH_TOKEN,
    cloudinary_set: !!process.env.CLOUDINARY_CLOUD_NAME,
    db_connected: false,
    tables_ready: false,
    error: null,
  };
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    checks.db_connected = true;
    await initDb();
    checks.tables_ready = true;
  } catch (e) {
    checks.error = String(e);
  }
  return NextResponse.json(checks, { status: checks.tables_ready ? 200 : 500 });
}
