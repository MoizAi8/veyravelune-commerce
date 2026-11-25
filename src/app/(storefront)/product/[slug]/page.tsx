import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/server/database";
import { product, related } from "@/server/services/catalog";
import { Gallery } from "@/components/product/gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
export const dynamic = "force-dynamic";
const read = cache((slug: string) => product(db(), slug));
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await read((await params).slug);
  return item ? { title: item.title, description: item.description } : { title: "Piece unavailable" };
}
export default async function Product({ params }: Props) {
  const item = await read((await params).slug);
  if (!item) notFound();
  const companions = await related(db(), item);
  return <div className="shell page-space product-editorial">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/shop">Collection</Link><span aria-hidden="true">/</span><Link href={"/shop?category=" + item.category.slug}>{item.category.name}</Link></nav>
    <div className="product-detail">
      <Gallery images={item.images} />
      <section className="piece-detail-copy"><p className="eyebrow">{item.category.name}</p><h1>{item.title}</h1><p className="lede">{item.description}</p>
        <ProductActions slug={item.slug} variants={item.variants} />
        <dl className="specs"><div><dt>Material</dt><dd>{item.material}</dd></div><div><dt>Dimensions</dt><dd>{item.dimensions}</dd></div></dl>
        <p className="muted">{["alcove", "repose", "companion"].includes(item.slug) ? "Studio rendering of the house model in its catalog finish." : "Illustrated concept. Imagery shows the lead finish."}</p>
        {["regent", "umbra"].includes(item.slug) && <Link href={item.slug === "regent" ? "/#experience" : "/#objects"} className="text-link">{item.slug === "regent" ? "Watch the seating chapter" : "See the Umbra editorial"}</Link>}
      </section>
    </div>
    {companions.length > 0 && <section className="related"><h2>From the same collection</h2><div className="product-grid">{companions.map((row) => <ProductCard key={row.id} item={row} />)}</div></section>}
  </div>;
}
