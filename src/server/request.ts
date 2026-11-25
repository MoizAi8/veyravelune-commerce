import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { db } from "./database";
import { Failure } from "./services/failure";

export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const privateHeaders = { "Cache-Control": "private, no-store" };
function configuredOrigin() {
  const url = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  return url ? new URL(url).origin : null;
}
export function demoWritesAvailable() {
  const origin = configuredOrigin();
  if (!origin) return false;
  const { hostname, protocol } = new URL(origin);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  return isLoopback || (protocol === "https:" && process.env.VEYRAVELUNE_PORTFOLIO_ORIGIN === origin);
}
export function requireOrigin(request: Request) {
  const origin = configuredOrigin();
  if (!origin || request.headers.get("origin") !== origin) throw new Failure(403, "ORIGIN_REJECTED", "This request is not permitted.");
  if (!demoWritesAvailable()) {
    throw new Failure(503, "DEMO_UNAVAILABLE", "Demo writes are unavailable on this host.");
  }
}
export async function jsonInput<T>(request: Request, schema: ZodType<T>, limit = 16384) {
  if (!request.headers.get("content-type")?.match(/^application\/json(?:\s*;|$)/i)) {
    throw new Failure(415, "CONTENT_TYPE", "Submit JSON.");
  }
  if (!request.body) throw new Failure(400, "INVALID_INPUT", "Request body is missing.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let data = "";
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Failure(413, "BODY_LIMIT", "Request is too large."); }
    data += decoder.decode(value, { stream: true });
  }
  let input: unknown;
  try { input = JSON.parse(data + decoder.decode()); }
  catch { throw new Failure(400, "INVALID_INPUT", "Request body is invalid."); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Failure(400, "INVALID_INPUT", parsed.error.issues[0]?.message || "Check the submitted values.");
  return parsed.data;
}
export function route(action: () => Promise<Response>) {
  return action().catch((error: unknown) => {
    if (error instanceof Failure) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: privateHeaders });
    if (typeof error === "object" && error && "code" in error && (error.code === "P2002" || error.code === "P2003")) {
      return NextResponse.json({ error: { code: "RECORD_CONFLICT", message: "The slug or SKU already exists, or a referenced record is unavailable." } },
        { status: 409, headers: privateHeaders });
    }
    console.error("VEYRAVELUNE request failed", error instanceof Error ? error.name : "Unknown");
    return NextResponse.json({ error: { code: "UNAVAILABLE", message: "The atelier is temporarily unavailable. Try again shortly." } }, { status: 503, headers: privateHeaders });
  });
}

export async function rateLimit(scope: string, identity: string, max: number, seconds: number) {
  const bucket = scope + ":" + hash(identity);
  const [row] = await db().$queryRaw<{ hits: number }[]>`
    INSERT INTO "RateLimit" (bucket, hits, "expiresAt")
    VALUES (${bucket}, 1, NOW() + make_interval(secs => ${seconds}::double precision))
    ON CONFLICT (bucket) DO UPDATE SET
      hits = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN 1 ELSE LEAST("RateLimit".hits, ${max}::integer) + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= NOW() THEN EXCLUDED."expiresAt" ELSE "RateLimit"."expiresAt" END
    RETURNING hits`;
  if (row.hits > max) throw new Failure(429, "RATE_LIMIT", "Too many attempts. Try again later.");
}
