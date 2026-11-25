import NextAuth from "next-auth";
import { options } from "@/server/auth/admin";
import { requireOrigin, route } from "@/server/request";

const auth = NextAuth(options);
type Context = { params: Promise<{ nextauth: string[] }> };
export async function GET(request: Request, context: Context) {
  return auth(request, { params: await context.params });
}
export async function POST(request: Request, context: Context) {
  return route(async () => {
    // Auth.js validates the CSRF token in addition to the host origin.
    requireOrigin(request);
    return auth(request, { params: await context.params });
  });
}
