import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checks = {
    turso_url_set: !!process.env.TURSO_DATABASE_URL,
    turso_token_set: !!process.env.TURSO_AUTH_TOKEN,
    cloudinary_set: !!process.env.CLOUDINARY_CLOUD_NAME,
    db_connected: false,
    error: null as string | null,
  };
  try {
    const db = getDb();
    await db.execute("SELECT 1");
    checks.db_connected = true;
  } catch (e) {
    checks.error = String(e);
  }
  return NextResponse.json(checks, { status: checks.db_connected ? 200 : 500 });
}
