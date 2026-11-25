import "server-only";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "../database";
import { rateLimit } from "../request";
import { Failure } from "../services/failure";
import { verifyPassword } from "./password";

if (process.env.AUTH_URL && !process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = process.env.AUTH_URL;

const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) });
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & { id?: string };
  }
}
export const options: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 4 },
  pages: { signIn: "/admin/sign-in" },
  callbacks: {
    session({ session, token }) {
      if (session.user) session.user.id = token.sub;
      return session;
    },
  },
  providers: [Credentials({
    name: "Atelier",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(input) {
      if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return null;
      const validated = credentials.safeParse(input);
      if (!validated.success) return null;
      const email = validated.data.email.toLowerCase();
      try {
        await rateLimit("admin-login-global", "all", 100, 900);
        await rateLimit("admin-login-account", email, 8, 900);
        const user = await db().user.findUnique({ where: { email } });
        if (!(await verifyPassword(validated.data.password, user?.passwordHash)) || user?.role !== "ADMIN") return null;
        return { id: user.id, email: user.email };
      } catch { return null; }
    },
  })],
  logger: { error(code) { console.error("Atelier authentication failed", code); } },
};

export async function adminUser() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return null;
  const id = z.uuid().safeParse((await getServerSession(options))?.user?.id);
  if (!id.success) return null;
  return db().user.findFirst({ where: { id: id.data, role: "ADMIN" }, select: { id: true, email: true } });
}
export async function requireAdmin() {
  const user = await adminUser();
  if (!user) throw new Failure(403, "ADMIN_REQUIRED", "Atelier administrator access is required.");
  return user;
}
