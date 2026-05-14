import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb, initDb } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const db = getDb();
        await initDb();
        const result = await db.execute({
          sql: "SELECT * FROM users WHERE email = ?",
          args: [credentials.email.toLowerCase()],
        });
        const user = result.rows[0];
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password as string);
        if (!valid) return null;
        return { id: String(user.id), email: user.email as string, name: user.name as string };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
};
