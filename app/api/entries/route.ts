import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const venueId  = searchParams.get("venue_id");
    const category = searchParams.get("category");
    const limit    = parseInt(searchParams.get("limit")  || "100");
    const offset   = parseInt(searchParams.get("offset") || "0");
    const conditions: string[] = [];
    const args: (string | number)[] = [];
    if (venueId)  { conditions.push("e.venue_id = ?"); args.push(venueId); }
    if (category) { conditions.push("e.category = ?"); args.push(category); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT e.*, v.name as venue_name, v.location as venue_location
            FROM entries e JOIN venues v ON v.id = e.venue_id
            ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });
    return NextResponse.json(result.rows.map((r) => ({ ...r })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const venueId  = formData.get("venue_id") as string;
    const drink    = (formData.get("drink") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const priceRaw = formData.get("price_dkk") as string;
    const notes    = (formData.get("notes") as string)?.trim();
    const photo    = formData.get("photo") as File | null;
    if (!venueId) return NextResponse.json({ error: "venue_id required" }, { status: 400 });
    if (!drink)   return NextResponse.json({ error: "drink required" }, { status: 400 });
    const price = parseFloat(priceRaw);
    if (isNaN(price)) return NextResponse.json({ error: "valid price_dkk required" }, { status: 400 });
    const db = getDb();
    const venueCheck = await db.execute({ sql: "SELECT id FROM venues WHERE id = ?", args: [venueId] });
    if (venueCheck.rows.length === 0) return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    let photoPath: string | null = null;
    if (photo && ALLOWED.has(photo.type)) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
      if (cloudName && uploadPreset) {
        try {
          const fd = new FormData();
          fd.append("file", photo);
          fd.append("upload_preset", uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
          if (res.ok) photoPath = (await res.json()).secure_url;
        } catch {}
      }
    }
    const result = await db.execute({
      sql: "INSERT INTO entries (venue_id, drink, category, price_dkk, notes, photo_path) VALUES (?,?,?,?,?,?)",
      args: [venueId, drink, category || null, price, notes || null, photoPath],
    });
    const entry = await db.execute({
      sql: `SELECT e.*, v.name as venue_name, v.location as venue_location
            FROM entries e JOIN venues v ON v.id = e.venue_id WHERE e.id = ?`,
      args: [result.lastInsertRowid!],
    });
    return NextResponse.json({ ...entry.rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
