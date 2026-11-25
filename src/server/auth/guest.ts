import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { hash } from "@/server/request";
const guestCookie = "vl_guest";
const validGuest = /^[a-f0-9]{64}$/;

export async function guestOwner(create = false) {
  const jar = await cookies();
  const token = jar.get(guestCookie)?.value;
  if (token && validGuest.test(token)) return hash(token);
  if (!create) return null;
  const fresh = randomBytes(32).toString("hex");
  const secure = (process.env.AUTH_URL || process.env.NEXTAUTH_URL)?.startsWith("https:") ?? true;
  jar.set(guestCookie, fresh, { httpOnly: true, sameSite: "lax", secure, maxAge: 60 * 60 * 24 * 7, path: "/" });
  return hash(fresh);
}
