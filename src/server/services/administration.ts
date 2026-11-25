import type { PrismaClient } from "@/generated/prisma/client";
import { orderTransitions } from "@/features/orders/contracts";
import { Failure } from "./failure";
import { z } from "zod";

export const uuid = z.uuid();
const variant = z.object({ sku: z.string().regex(/^[A-Z0-9][A-Z0-9-]{1,31}$/), finish: z.string().trim().min(1).max(60),
  priceCents: z.number().int().min(0).max(10000000), active: z.boolean().default(true) });
const image = z.object({ path: z.string().regex(/^\/images\/(?:products|editorial)\/[a-z0-9-]+\.webp$/), alt: z.string().min(1).max(150) });
const productFields = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(8).max(1000), material: z.string().trim().min(1).max(70),
  dimensions: z.string().trim().min(1).max(80), categoryId: uuid, active: z.boolean().default(true),
  featured: z.boolean().default(false),
});
export const newProduct = productFields.extend({ images: z.array(image).min(1).max(5),
  variants: z.array(variant.extend({ stock: z.number().int().min(0).max(10000) })).min(1).max(8) });
export const patchProduct = productFields.partial().extend({ active: z.boolean().optional(), featured: z.boolean().optional(),
  images: z.array(image).min(1).max(5).optional(),
  variants: z.array(variant.extend({ id: uuid.optional(), active: z.boolean().optional() })).min(1).max(12).optional() });
export const adjustment = z.object({ variantId: uuid, delta: z.number().int().min(-10000).max(10000).refine((n) => n !== 0),
  reason: z.string().trim().min(3).max(160) });
export const orderChange = z.object({ status: z.enum(["PLACED", "PROCESSING", "COMPLETED"]) });
const missing = () => new Failure(404, "NOT_FOUND", "That record does not exist.");

export function listAdminProducts(prisma: PrismaClient, page: number) {
  return prisma.product.findMany({ orderBy: { title: "asc" }, skip: (page - 1) * 20, take: 20,
    include: { variants: { orderBy: { sku: "asc" } }, images: { orderBy: { sortOrder: "asc" } } } });
}
export function listAdminOrders(prisma: PrismaClient, page: number) {
  return prisma.order.findMany({ skip: (page - 1) * 20, take: 20, orderBy: { createdAt: "desc" },
    select: { id: true, reference: true, status: true, destination: true, totalCents: true, createdAt: true,
      items: { select: { title: true, quantity: true, sku: true } } } });
}
export async function createProduct(prisma: PrismaClient, actorId: string, input: z.output<typeof newProduct>) {
  const { variants, images, ...fields } = input;
  return prisma.$transaction(async (tx) => {
    const item = await tx.product.create({ data: { ...fields, images: { create: images.map((entry, sortOrder) => ({ ...entry, sortOrder })) },
      variants: { create: variants } }, include: { variants: true } });
    for (const row of item.variants) if (row.stock > 0) {
      await tx.inventoryMovement.create({ data: { variantId: row.id, actorId, delta: row.stock, reason: "Opening stock" } });
    }
    return { id: item.id };
  });
}
export async function updateProduct(prisma: PrismaClient, id: string, input: z.output<typeof patchProduct>) {
  const { images, variants, ...fields } = input;
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Product" WHERE id = ${id}::uuid FOR UPDATE`;
    if (!rows.length) throw missing();
    await tx.product.update({ where: { id }, data: fields });
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({ data: images.map((entry, sortOrder) => ({ ...entry, productId: id, sortOrder })) });
    }
    for (const entry of variants ?? []) {
      const { id: variantId, ...fields } = entry;
      if (!variantId) await tx.variant.create({ data: { ...fields, productId: id, stock: 0 } });
      else if (!(await tx.variant.updateMany({ where: { id: variantId, productId: id }, data: fields })).count) throw missing();
    }
    return { id };
  });
}
export async function adjustStock(prisma: PrismaClient, actorId: string, input: z.output<typeof adjustment>) {
  return prisma.$transaction(async (tx) => {
    const changed = await tx.variant.updateMany({ where: { id: input.variantId,
      stock: input.delta < 0 ? { gte: -input.delta } : { lte: 10000 - input.delta } },
      data: { stock: { increment: input.delta } } });
    if (!changed.count) throw new Failure(409, "INVENTORY_REJECTED", "The variant is unavailable or this adjustment exceeds stock limits.");
    await tx.inventoryMovement.create({ data: { ...input, actorId } });
    return tx.variant.findUniqueOrThrow({ where: { id: input.variantId }, select: { id: true, stock: true } });
  });
}
export async function updateOrder(prisma: PrismaClient, id: string, input: z.output<typeof orderChange>) {
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) throw missing();
  const allowed: readonly string[] = orderTransitions[order.status];
  if (!allowed.includes(input.status) || !(await prisma.order.updateMany({ where: { id, status: order.status },
    data: { status: input.status } })).count) throw new Failure(409, "STATUS_REJECTED", "That order transition is unavailable.");
  return { id, status: input.status };
}
