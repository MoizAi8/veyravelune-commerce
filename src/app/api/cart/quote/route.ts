import { NextResponse } from "next/server";
import { quoteSchema } from "@/features/orders/contracts";
import { guestOwner } from "@/server/auth/guest";
import { db } from "@/server/database";
import { jsonInput, privateHeaders, rateLimit, requireOrigin, route } from "@/server/request";
import { quote } from "@/server/services/commerce";
export async function POST(request: Request) {
  return route(async () => {
    requireOrigin(request);
    const { items } = await jsonInput(request, quoteSchema);
    await rateLimit("quote-global", "all", 900, 60);
    const owner = await guestOwner(true);
    if (owner) await rateLimit("quote", owner, 45, 60);
    return NextResponse.json(await quote(db(), items), { headers: privateHeaders });
  });
}
