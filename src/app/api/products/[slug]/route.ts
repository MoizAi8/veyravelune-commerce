import { NextResponse } from "next/server";
import { db } from "@/server/database";
import { route } from "@/server/request";
import { product, related } from "@/server/services/catalog";
import { Failure } from "@/server/services/failure";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return route(async () => {
    const item = await product(db(), (await params).slug);
    if (!item) throw new Failure(404, "NOT_FOUND", "This piece is unavailable.");
    return NextResponse.json({ item, related: await related(db(), item) });
  });
}
