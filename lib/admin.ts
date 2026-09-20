import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getDb } from "./db";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const db = getDb();
  const user = await db.execute({
    sql: "SELECT is_admin FROM users WHERE id = ?",
    args: [(session.user as any).id],
  });
  if (!user.rows[0] || !user.rows[0].is_admin) return null;
  return session;
}
