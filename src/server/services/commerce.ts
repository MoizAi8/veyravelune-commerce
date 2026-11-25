import { createHash, randomBytes } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { totalsFor, type CartItem, type OrderInput } from "@/features/orders/contracts";
import { Failure } from "./failure";

type Connection = Prisma.TransactionClient | PrismaClient;
const orderSelection = {
  reference: true, status: true, paymentStatus: true, destination: true, createdAt: true,
  subtotalCents: true, shippingCents: true, taxCents: true, discountCents: true, totalCents: true,
  items: { select: { sku: true, title: true, finish: true, unitPriceCents: true, quantity: true, lineTotalCents: true } },
} satisfies Prisma.OrderSelect;

export async function quote(client: Connection, items: CartItem[]) {
  const variants = await client.variant.findMany({
    where: { id: { in: items.map((item) => item.variantId) }, active: true, product: { active: true } },
    select: { id: true, sku: true, finish: true, priceCents: true, stock: true,
      product: { select: { title: true, slug: true } } },
  });
  const lookup = new Map(variants.map((variant) => [variant.id, variant]));
  const lines = items.map(({ variantId, quantity }) => {
    const variant = lookup.get(variantId);
    if (!variant) return { variantId, quantity, title: "Unavailable piece", slug: null, finish: null, sku: null,
      stock: 0, available: false, unitPriceCents: 0, lineTotalCents: 0 };
    return { variantId, quantity, title: variant.product.title, slug: variant.product.slug,
      finish: variant.finish, sku: variant.sku, stock: variant.stock, available: variant.stock >= quantity,
      unitPriceCents: variant.priceCents, lineTotalCents: variant.priceCents * quantity };
  });
  return { lines, available: lines.every((line) => line.available), ...totalsFor(lines.reduce((sum, line) => sum + line.lineTotalCents, 0)) };
}

export async function ownerOrder(client: Connection, ownerHash: string, reference: string) {
  return client.order.findFirst({ where: { ownerHash, reference }, select: orderSelection });
}

export async function placeOrder(prisma: PrismaClient, ownerHash: string, input: OrderInput) {
  const items = [...input.items].sort((a, b) => a.variantId.localeCompare(b.variantId));
  const fingerprint = createHash("sha256").update(JSON.stringify([items, input.destination])).digest("hex");
  const unique = { ownerHash_idempotencyKey: { ownerHash, idempotencyKey: input.idempotencyKey } };
  return prisma.$transaction(async (tx) => {
    // Serialize identical keys before reading the order, including overlapping retries.
    const lock = createHash("sha256").update(ownerHash + ":" + input.idempotencyKey).digest().readBigInt64BE();
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock})`;
    const previous = await tx.order.findUnique({ where: unique, select: { ...orderSelection, fingerprint: true } });
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw new Failure(409, "KEY_REUSED", "This order key already belongs to a different order.");
      return { order: await tx.order.findUniqueOrThrow({ where: unique, select: orderSelection }), created: false };
    }

    // Lock product rows first to serialize with catalog edits, then variant rows in ID order.
    const parents = await tx.variant.findMany({ where: { id: { in: items.map((item) => item.variantId) } }, select: { productId: true } });
    for (const id of [...new Set(parents.map((variant) => variant.productId))].sort()) {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${id}::uuid FOR SHARE`;
    }
    for (const item of items) {
      await tx.$queryRaw`SELECT id FROM "Variant" WHERE id = ${item.variantId}::uuid FOR UPDATE`;
    }
    const priced = await quote(tx, items);
    if (!priced.available) throw new Failure(409, "STOCK_CHANGED", "Stock changed. Review the pieces in your bag.");
    const order = await tx.order.create({
      data: {
        reference: "VL-" + randomBytes(16).toString("hex"),
        ownerHash, idempotencyKey: input.idempotencyKey, fingerprint, destination: input.destination,
        ...totalsFor(priced.subtotalCents),
        items: { create: priced.lines.map((line) => ({
          variantId: line.variantId, sku: line.sku!, title: line.title, finish: line.finish!,
          quantity: line.quantity, unitPriceCents: line.unitPriceCents, lineTotalCents: line.lineTotalCents,
        })) },
      },
      select: { ...orderSelection, id: true },
    });
    for (const item of items) {
      const changed = await tx.variant.updateMany({ where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } } });
      if (changed.count !== 1) throw new Failure(409, "STOCK_CHANGED", "Stock changed. Review the pieces in your bag.");
      await tx.inventoryMovement.create({ data: { variantId: item.variantId, orderId: order.id, delta: -item.quantity, reason: "Demo order" } });
    }
    return { order: await tx.order.findUniqueOrThrow({ where: unique, select: orderSelection }), created: true };
  }, { isolationLevel: "ReadCommitted" });
}
