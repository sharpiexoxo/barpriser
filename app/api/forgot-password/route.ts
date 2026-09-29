import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "E-mail er påkrævet" }, { status: 400 });

    const db = getDb(); await initDb();
    const result = await db.execute({
      sql: "SELECT id, name FROM users WHERE email = ?",
      args: [email.toLowerCase()],
    });

    // Always return ok so we don't reveal whether the email exists
    if (result.rows.length === 0) return NextResponse.json({ ok: true });

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    await db.execute({
      sql: "UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0",
      args: [user.id],
    });
    await db.execute({
      sql: "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      args: [user.id, token, expiresAt],
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "BarPriser <noreply@barpriser.dk>",
      to: email.toLowerCase(),
      subject: "Nulstil din adgangskode — BarPriser",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1A1714; margin-bottom: 8px;">Nulstil din adgangskode</h2>
          <p style="color: #4A4540;">Hej ${user.name},</p>
          <p style="color: #4A4540;">Vi har modtaget en anmodning om at nulstille adgangskoden til din BarPriser-konto.</p>
          <p style="color: #4A4540;">Klik på knappen nedenfor for at vælge en ny adgangskode. Linket udløber om 1 time.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #C94E2A; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 15px;">
            Nulstil adgangskode
          </a>
          <p style="color: #8A837C; font-size: 13px; margin-top: 24px;">
            Hvis du ikke har anmodet om dette, kan du roligt ignorere denne e-mail. Dit kodeord forbliver uændret.
          </p>
          <hr style="border: none; border-top: 1px solid #E8E0D8; margin: 24px 0;" />
          <p style="color: #8A837C; font-size: 12px;">BarPriser · Fælles drikkevarepriser i Danmark</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
