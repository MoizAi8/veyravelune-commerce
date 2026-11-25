import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { searchScore } from "@/features/catalog/search";
import { categories } from "@/features/catalog/collection";
import { z } from "zod";

const amount = z.string().regex(/^\d{1,6}$/).transform((value) => Number(value) * 100).optional();
export const catalogQuery = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(categories.map(({ slug }) => slug)).optional(),
  material: z.string().trim().max(40).optional(),
  min: amount, max: amount,
  sort: z.enum(["curated", "price-asc", "price-desc", "name"]).default("curated"),
  page: z.string().regex(/^[1-9]\d{0,2}$/).transform(Number).optional().default(1),
}).refine(({ min, max }) => min === undefined || max === undefined || min <= max);
export const productDetails = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { path: true, alt: true } },
  variants: { where: { active: true }, orderBy: [{ priceCents: "asc" }, { sku: "asc" }],
    select: { id: true, sku: true, finish: true, priceCents: true, stock: true } },
} satisfies Prisma.ProductInclude;
export type CatalogProduct = Prisma.ProductGetPayload<{ include: typeof productDetails }>;
export async function catalog(prisma: PrismaClient, input: z.output<typeof catalogQuery>) {
  const bounds = { gte: input.min, lte: input.max };
  const where: Prisma.ProductWhereInput = {
    active: true,
    category: input.category ? { slug: input.category } : undefined,
    material: input.material ? { equals: input.material, mode: "insensitive" } : undefined,
    variants: { some: { active: true, priceCents: bounds } },
  };
  const include = { ...productDetails, variants: { ...productDetails.variants, where: { active: true, priceCents: bounds } } };
  const pageSize = 8;
  if (input.q || input.sort === "price-asc" || input.sort === "price-desc") {
    // The public catalog is deliberately small. Sort by the lowest eligible variant.
    const all = await prisma.product.findMany({ where, include, orderBy: { slug: "asc" } });
    const sign = input.sort === "price-asc" ? 1 : -1;
    const ranked = all.map(item => ({ item, score: input.q ? searchScore(item, input.q) : 1 })).filter(row => row.score > 0);
    ranked.sort((a,b) => {
      if(input.sort.startsWith("price-")) return sign * (a.item.variants[0].priceCents - b.item.variants[0].priceCents);
      if(input.sort === "name") return a.item.title.localeCompare(b.item.title);
      return b.score-a.score;
    });
    return { items: ranked.slice((input.page - 1) * pageSize, input.page * pageSize).map(row=>row.item), total: ranked.length, page: input.page, pageSize };
  }
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({ where, include, skip: (input.page - 1) * pageSize, take: pageSize,
      orderBy: input.sort === "name" ? [{ title: "asc" }, { slug: "asc" }] : [{ featured: "desc" }, { slug: "asc" }] }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page: input.page, pageSize };
}
export async function product(prisma: PrismaClient, slug: string) {
  return prisma.product.findFirst({ where: { slug, active: true, variants: { some: { active: true } } }, include: productDetails });
}
export async function related(prisma: PrismaClient, item: CatalogProduct) {
  return prisma.product.findMany({ where: { active: true, categoryId: item.categoryId,
    id: { not: item.id }, variants: { some: { active: true } } }, include: productDetails, orderBy: { slug: "asc" }, take: 3 });
}
