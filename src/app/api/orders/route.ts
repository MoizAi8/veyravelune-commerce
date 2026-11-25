import { NextResponse } from "next/server";
import { orderSchema } from "@/features/orders/contracts";
import { guestOwner } from "@/server/auth/guest";
import { db } from "@/server/database";
import { jsonInput, privateHeaders, rateLimit, requireOrigin, route } from "@/server/request";
import { placeOrder } from "@/server/services/commerce";
import { Failure } from "@/server/services/failure";
export async function POST(request: Request) {
  return route(async () => {
    requireOrigin(request);
    if (process.env.COMMERCE_MODE !== "demo") throw new Failure(503, "DEMO_UNAVAILABLE", "Demo orders are disabled.");
    await rateLimit("checkout-global", "all", 30, 600);
    const owner = await guestOwner();
    if (!owner) throw new Failure(409, "SESSION_REQUIRED", "Refresh your bag before placing a demo order.");
    const input = await jsonInput(request, orderSchema);
    await rateLimit("checkout", owner, 6, 600);
    const result = await placeOrder(db(), owner, input);
    return NextResponse.json(result.order, { headers: privateHeaders, status: result.created ? 201 : 200 });
  });
}
