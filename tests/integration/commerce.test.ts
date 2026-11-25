import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase } from "@/server/db";
import { catalog, catalogQuery } from "@/server/services/catalog";
import { ownerOrder, placeOrder, quote } from "@/server/services/commerce";
import { adjustStock, createProduct, newProduct, patchProduct, updateOrder, updateProduct } from "@/server/services/administration";
import { orderSchema } from "@/features/orders/contracts";

config({ path: [".env.local", ".env"], quiet: true });
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test") || url === process.env.DATABASE_URL) {
  throw new Error("Set TEST_DATABASE_URL to a dedicated database whose name ends in _test.");
}
const db = createDatabase(url);
const run = randomUUID();
let variantId: string;
let categoryId: string;
let actorId: string;
let productId: string;
const input = (quantity: number, idempotencyKey: string = randomUUID()) => orderSchema.parse({
  items: [{ variantId, quantity, priceCents: 1 }], idempotencyKey, destination: "Mooncourt", demoConfirmed: true,
});
beforeAll(async () => {
  const category = await db.category.create({ data: { name: "Integration", slug: run, description: "Fixture", image: "/fixture" } });
  categoryId = category.id;
  const user = await db.user.create({ data: { email: run + "@example.invalid", passwordHash: "disabled-fixture", role: "ADMIN" } });
  actorId = user.id;
  const item = await db.product.create({ data: { slug: run, title: "Regent Integration " + run,
    description: "Integration fixture", material: "Velvet", dimensions: "Test", categoryId,
    variants: { create: { sku: run, finish: "Emerald", priceCents: 25900, stock: 4 } } }, include: { variants: true } });
  variantId = item.variants[0].id;
  productId = item.id;
});
afterAll(async () => {
  if (categoryId) {
    const variants = await db.variant.findMany({ where: { product: { categoryId } }, select: { id: true } });
    const ids = variants.map(({ id }) => id);
    await db.inventoryMovement.deleteMany({ where: { variantId: { in: ids } } });
    await db.orderItem.deleteMany({ where: { variantId: { in: ids } } });
    await db.order.deleteMany({ where: { ownerHash: { startsWith: run } } });
    await db.variant.deleteMany({ where: { id: { in: ids } } });
    await db.product.deleteMany({ where: { categoryId } });
    await db.category.delete({ where: { id: categoryId } });
  }
  if (actorId) await db.user.delete({ where: { id: actorId } });
  await db.$disconnect();
});
describe.sequential("PostgreSQL commerce and inventory", () => {
  it("filters, sorts and paginates the catalog; prices stripped browser values at database prices", async () => {
    const result = await catalog(db, catalogQuery.parse({ q: run, material: "velvet", min: "200", max: "260", sort: "price-asc" }));
    expect(result.total).toBe(1);
    expect((await catalog(db, catalogQuery.parse({ q: run, page: "2" }))).items).toHaveLength(0);
    expect((await quote(db, input(1).items)).subtotalCents).toBe(25900);
    await db.variant.update({ where: { id: variantId }, data: { active: false } });
    expect((await quote(db, input(1).items)).available).toBe(false);
    await db.variant.update({ where: { id: variantId }, data: { active: true } });
  });
  it("deduplicates simultaneous requests and scopes the confirmation to the owner", async () => {
    const order = input(2);
    const [a, b] = await Promise.all([placeOrder(db, run, order), placeOrder(db, run, order)]);
    expect(a.order.reference).toBe(b.order.reference);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
    expect(a.order.items[0]).toMatchObject({ quantity: 2, unitPriceCents: 25900 });
    expect(await ownerOrder(db, run + "-different", a.order.reference)).toBeNull();
    expect(await ownerOrder(db, run, a.order.reference)).toMatchObject({ paymentStatus: "DEMO_CONFIRMED" });
    await expect(placeOrder(db, run, input(1, order.idempotencyKey))).rejects.toMatchObject({ code: "KEY_REUSED" });
    expect((await db.variant.findUniqueOrThrow({ where: { id: variantId } })).stock).toBe(2);
  });
  it("allows one stock contender and records only committed inventory movements", async () => {
    const results = await Promise.allSettled([placeOrder(db, run + "-a", input(2)), placeOrder(db, run + "-b", input(2))]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.find((result) => result.status === "rejected")).toMatchObject({ reason: { code: "STOCK_CHANGED" } });
    expect((await db.variant.findUniqueOrThrow({ where: { id: variantId } })).stock).toBe(0);
    expect(await db.inventoryMovement.count({ where: { variantId, delta: -2 } })).toBe(2);
    expect(await db.order.count({ where: { ownerHash: { startsWith: run } } })).toBe(2);
  });
  it("audits admin stock changes, soft disables catalog entries and validates order status", async () => {
    expect(await adjustStock(db, actorId, { variantId, delta: 3, reason: "Fixture restock" })).toMatchObject({ stock: 3 });
    expect(await db.inventoryMovement.count({ where: { variantId, actorId, delta: 3 } })).toBe(1);
    await expect(adjustStock(db, actorId, { variantId, delta: -4, reason: "Fixture adjustment" })).rejects.toMatchObject({ code: "INVENTORY_REJECTED" });
    const order = await db.order.findFirstOrThrow({ where: { ownerHash: run } });
    await expect(updateOrder(db, order.id, { status: "COMPLETED" })).rejects.toMatchObject({ code: "STATUS_REJECTED" });
    await expect(updateOrder(db, order.id, { status: "PROCESSING" })).resolves.toMatchObject({ status: "PROCESSING" });
    await updateProduct(db, productId, { active: false });
    expect((await quote(db, input(1).items)).available).toBe(false);
    await db.product.update({where:{id:productId},data:{featured:true}});
    await updateProduct(db, productId, patchProduct.parse({title:"Revised private study"}));
    expect(await db.product.findUniqueOrThrow({where:{id:productId}})).toMatchObject({active:false,featured:true});
    const created = await createProduct(db, actorId, newProduct.parse({
      slug: "provisioned-" + run, title: "Provisioned", categoryId, material: "Brass", dimensions: "10 cm", description: "Original fixture",
      images: [{ path: "/images/products/regent.webp", alt: "Fixture image" }],
      variants: [{ sku: "TEST-" + run.slice(0, 8).toUpperCase(), finish: "Brass", priceCents: 100, stock: 2 }],
    }));
    expect(await db.product.findUnique({ where: { id: created.id } })).toMatchObject({ title: "Provisioned" });
  });
});
