import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { getDb, initDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 registrations per IP per hour
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json({ error: "For mange forsøg — prøv igen om en time" }, { status: 429 });
    }

    const { email, name, password } = await req.json();
    if (!email || !name || !password)
      return NextResponse.json({ error: "Alle felter er påkrævet" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Adgangskoden skal være mindst 6 tegn" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Ugyldig e-mailadresse" }, { status: 400 });

    const db = getDb(); await initDb();
    const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email.toLowerCase()] });
    if (existing.rows.length > 0)
      return NextResponse.json({ error: "E-mail er allerede registreret" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.execute({
      sql: "INSERT INTO users (email, name, password, is_verified) VALUES (?, ?, ?, 0)",
      args: [email.toLowerCase(), name.trim(), hashed],
    });
    const userId = result.lastInsertRowid!;

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    await db.execute({
      sql: "INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)",
      args: [userId, token, expiresAt],
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    // Send verification email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "BarPriser <noreply@barpriser.dk>",
        to: email.toLowerCase(),
        subject: "Bekræft din e-mail — BarPriser",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1A1714; margin-bottom: 8px;">Velkommen til BarPriser, ${name.trim()}!</h2>
            <p style="color: #4A4540;">Tak for at du oprettede en konto. Klik på knappen nedenfor for at bekræfte din e-mailadresse.</p>
            <p style="color: #4A4540;">Linket udløber om 24 timer.</p>
            <a href="${verifyUrl}"
               style="display: inline-block; background: #C94E2A; color: white; padding: 14px 28px;
                      border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 15px;">
              Bekræft e-mail
            </a>
            <p style="color: #8A837C; font-size: 13px; margin-top: 24px;">
              Hvis du ikke har oprettet en konto på BarPriser, kan du roligt ignorere denne e-mail.
            </p>
            <hr style="border: none; border-top: 1px solid #E8E0D8; margin: 24px 0;" />
            <p style="color: #8A837C; font-size: 12px;">BarPriser · Fælles drikkevarepriser i Danmark</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, requiresVerification: true }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
