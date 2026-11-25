import { config } from "dotenv";
import { categories, pieces } from "../src/features/catalog/collection";
import { createDatabase } from "../src/server/db";
config({ path: [".env.local", ".env"], quiet: true });
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL before seeding.");
const prisma = createDatabase(url);

async function seed() {
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
  }
  for (const [slug, title, category, material, dimensions, description, finish, priceCents] of pieces) {
    const sku = slug.toUpperCase();
    const product = await prisma.product.upsert({
      where: { slug }, update: {}, create: {
        slug, title, material, dimensions, description,
        category: { connect: { slug: category } },
        featured: ["regent", "vesper", "aurel", "umbra"].includes(slug),
        images: { create: { path: "/images/products/" + slug + ".webp", alt: title + " in " + finish } },
        variants: { create: [
          { sku: sku + "-01", finish, priceCents, stock: 12 },
          ...(["regent", "umbra"].includes(slug)
            ? [{ sku: sku + "-02", finish: slug === "regent" ? "Merlot" : "Bone", priceCents: priceCents + 2000, stock: 8 }]
            : []),
        ] },
      },
    });
    if (slug === "regent" || slug === "umbra") {
      await prisma.productImage.upsert({
        where: { productId_sortOrder: { productId: product.id, sortOrder: 1 } },
        update: {},
        create: { productId: product.id, sortOrder: 1, path: "/images/editorial/" + (slug === "regent" ? "arrival" : "umbra") + ".webp",
          alt: slug === "regent" ? "Emerald Regent Sofa in a moonlit limestone chamber" : "Black Umbra Vessel on a stone plinth" },
      });
    }
  }
}
seed().finally(() => prisma.$disconnect());
