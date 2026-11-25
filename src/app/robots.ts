import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.VEYRAVELUNE_PORTFOLIO_ORIGIN;
  if (!origin) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cart", "/checkout", "/order-confirmation", "/wishlist"] }, sitemap: new URL("/sitemap.xml", origin).href };
}
