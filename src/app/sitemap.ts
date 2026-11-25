import type { MetadataRoute } from "next";
import { db } from "@/server/database";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.VEYRAVELUNE_PORTFOLIO_ORIGIN;
  if (!origin) return [];
  const paths = ["", "/shop", "/about", "/contact", "/policies"];
  const products = await db().product.findMany({ where: { active: true, variants: { some: { active: true } } }, select: { slug: true } });
  return [...paths, ...products.map(({ slug }) => "/product/" + slug)].map((path) => ({ url: new URL(path || "/", origin).href }));
}
