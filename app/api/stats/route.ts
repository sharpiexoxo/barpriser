import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const db = getDb(); await initDb();
    const cityWhere = city ? "WHERE v.city = ?" : "";
    const cityAnd   = city ? "AND v.city = ?"   : "";
    const args      = city ? [city]              : [];
    const summary = await db.execute({ sql: `SELECT COUNT(*) as total_entries, COUNT(DISTINCT e.venue_id) as total_venues, ROUND(AVG(e.price_dkk)) as overall_avg, ROUND(MIN(e.price_dkk)) as overall_min, ROUND(MAX(e.price_dkk)) as overall_max FROM entries e JOIN venues v ON v.id = e.venue_id ${cityWhere}`, args });
    const byCategory = await db.execute({ sql: `SELECT e.category, COUNT(*) as count, ROUND(AVG(e.price_dkk)) as avg_price FROM entries e JOIN venues v ON v.id = e.venue_id WHERE e.category IS NOT NULL AND e.category != '' ${cityAnd} GROUP BY e.category ORDER BY count DESC`, args });
    const byVenue = await db.execute({ sql: `SELECT v.id, v.name, v.city, v.location, COUNT(e.id) as count, ROUND(AVG(e.price_dkk)) as avg_price, ROUND(MIN(e.price_dkk)) as min_price, ROUND(MAX(e.price_dkk)) as max_price FROM venues v JOIN entries e ON e.venue_id = v.id ${cityWhere} GROUP BY v.id ORDER BY avg_price ASC`, args });
    return NextResponse.json({ ...summary.rows[0], by_category: byCategory.rows.map(r => ({ ...r })), by_venue: byVenue.rows.map(r => ({ ...r })) });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
