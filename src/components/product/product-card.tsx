import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/money";
import type { CatalogProduct } from "@/server/services/catalog";

export function ProductCard({ item }: { item: Pick<CatalogProduct, "slug" | "title" | "images" | "variants" | "category"> }) {
  const photo = item.images[0];
  return <article className="product-card">
    <Link href={"/product/" + item.slug}>
      <div className="piece-photo">
        {photo && <Image src={photo.path} alt={photo.alt} fill sizes="(max-width: 600px) 49vw, (max-width: 1000px) 33vw, 25vw" />}
        <span className="piece-reveal" aria-hidden="true">View piece</span>
      </div>
      <div className="piece-meta"><p>{item.category.name}</p><h3>{item.title}</h3>
        {item.variants.length > 0 && <span>{item.variants.length > 1 ? "From " : ""}{money(item.variants[0].priceCents)}</span>}</div>
    </Link>
  </article>;
}
