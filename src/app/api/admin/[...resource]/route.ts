import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin";
import { db } from "@/server/database";
import { jsonInput, privateHeaders, requireOrigin, route } from "@/server/request";
import { adjustment, adjustStock, createProduct, listAdminOrders, listAdminProducts, newProduct, orderChange,
  patchProduct, updateOrder, updateProduct, uuid } from "@/server/services/administration";
import { Failure } from "@/server/services/failure";

type Context = { params: Promise<{ resource: string[] }> };
const respond = (data: unknown, status = 200) => NextResponse.json(data, { headers: privateHeaders, status });
const missing = () => new Failure(404, "NOT_FOUND", "That resource does not exist.");

export async function GET(request: Request, context: Context) {
  return route(async () => {
    await requireAdmin();
    const [resource, id] = (await context.params).resource;
    const page = Number(new URL(request.url).searchParams.get("page") || "1");
    if (!Number.isInteger(page) || page < 1 || page > 999) throw new Failure(400, "INVALID_PAGE", "Check the page number.");
    if (!id && resource === "products") return respond(await listAdminProducts(db(), page));
    if (!id && resource === "orders") return respond(await listAdminOrders(db(), page));
    throw missing();
  });
}
export async function POST(request: Request, context: Context) {
  return route(async () => {
    requireOrigin(request);
    const actor = await requireAdmin();
    const [resource, id] = (await context.params).resource;
    if (!id && resource === "products") return respond(await createProduct(db(), actor.id, await jsonInput(request, newProduct)), 201);
    if (!id && resource === "inventory") return respond(await adjustStock(db(), actor.id, await jsonInput(request, adjustment)));
    throw missing();
  });
}
export async function PATCH(request: Request, context: Context) {
  return route(async () => {
    requireOrigin(request);
    await requireAdmin();
    const [resource, id, extra] = (await context.params).resource;
    if (extra || !uuid.safeParse(id).success) throw missing();
    if (resource === "products") return respond(await updateProduct(db(), id, await jsonInput(request, patchProduct)));
    if (resource === "orders") return respond(await updateOrder(db(), id, await jsonInput(request, orderChange)));
    throw missing();
  });
}
