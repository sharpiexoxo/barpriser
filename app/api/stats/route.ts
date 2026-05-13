import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getDb();
    const summary = await db.execute(`
      SELECT COUNT(*) as total_entries, COUNT(DISTINCT venue_id) as total_venues,
             ROUND(AVG(price_dkk)) as overall_avg, ROUND(MIN(price_dkk)) as overall_min,
             ROUND(MAX(price_dkk)) as overall_max
      FROM entries
    `);
    const byCategory = await db.execute(`
      SELECT category, COUNT(*) as count, ROUND(AVG(price_dkk)) as avg_price
      FROM entries WHERE category IS NOT NULL AND category != ''
      GROUP BY category ORDER BY count DESC
    `);
    const byVenue = await db.execute(`
      SELECT v.id, v.name, v.location, COUNT(e.id) as count,
             ROUND(AVG(e.price_dkk)) as avg_price, ROUND(MIN(e.price_dkk)) as min_price,
             ROUND(MAX(e.price_dkk)) as max_price
      FROM venues v JOIN entries e ON e.venue_id = v.id
      GROUP BY v.id ORDER BY avg_price ASC
    `);
    return NextResponse.json({
      ...summary.rows[0],
      by_category: byCategory.rows.map((r) => ({ ...r })),
      by_venue: byVenue.rows.map((r) => ({ ...r })),
    });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
