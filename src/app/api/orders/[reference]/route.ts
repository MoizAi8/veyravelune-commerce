import { NextResponse } from "next/server";
import { guestOwner } from "@/server/auth/guest";
import { db } from "@/server/database";
import { privateHeaders, route } from "@/server/request";
import { ownerOrder } from "@/server/services/commerce";
import { Failure } from "@/server/services/failure";
export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  return route(async () => {
    const { reference } = await params;
    const owner = await guestOwner();
    const summary = owner && /^VL-[a-f0-9]{32}$/.test(reference) && await ownerOrder(db(), owner, reference);
    if (!summary) throw new Failure(404, "NOT_FOUND", "This order is unavailable.");
    return NextResponse.json(summary, { headers: privateHeaders });
  });
}
