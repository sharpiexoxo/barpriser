import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limit = rateLimit(`resend-verify:${ip}`, 3, 60 * 60 * 1000);
    if (!limit.ok) return NextResponse.json({ error: "For mange forsøg" }, { status: 429 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-mail påkrævet" }, { status: 400 });

    const db = getDb(); await initDb();
    const user = await db.execute({ sql: "SELECT id, name, is_verified FROM users WHERE email = ?", args: [email.toLowerCase()] });
    if (!user.rows[0]) return NextResponse.json({ ok: true }); // Don't reveal if email exists
    if (user.rows[0].is_verified) return NextResponse.json({ error: "E-mail er allerede bekræftet" }, { status: 400 });

    // Invalidate old tokens
    await db.execute({ sql: "UPDATE email_verifications SET used = 1 WHERE user_id = ? AND used = 0", args: [user.rows[0].id] });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.execute({ sql: "INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)", args: [user.rows[0].id, token, expiresAt] });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "BarPriser <noreply@barpriser.dk>",
        to: email.toLowerCase(),
        subject: "Bekræft din e-mail — BarPriser",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1A1714;">Bekræft din e-mail</h2>
            <p style="color: #4A4540;">Her er et nyt bekræftelseslink til din BarPriser-konto. Det udløber om 24 timer.</p>
            <a href="${verifyUrl}" style="display: inline-block; background: #C94E2A; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 15px;">
              Bekræft e-mail
            </a>
            <hr style="border: none; border-top: 1px solid #E8E0D8; margin: 24px 0;" />
            <p style="color: #8A837C; font-size: 12px;">BarPriser · Fælles drikkevarepriser i Danmark</p>
          </div>
        `,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
