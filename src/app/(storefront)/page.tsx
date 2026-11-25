import "@/components/home/house.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { SaveButton } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { categories } from "@/features/catalog/collection";
import { db } from "@/server/database";
import { productDetails } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default function Home() {
  return <>
    <Hero />
    <section className="house-intro">
      <p className="eyebrow">The house of Veyravelune</p>
      <h2>A room begins<br />with <em>one object.</em></h2>
      <div><p>A curve in walnut. The shoulder of a vessel. A line of light on stone. Our collections begin with the things you notice when a room grows quiet.</p><Link href="/about" className="text-link">Inside the atelier</Link></div>
    </section>
    <section id="collection" className="department-section" tabIndex={-1}>
      <div className="shell">
        <header className="department-heading">
          <div><p className="eyebrow">The collection index</p><h2>Furnish the<br /><em>extraordinary.</em></h2></div>
          <div><p>Six collections for rooms that come alive after dark. Begin with a silhouette, a surface, or a source of light.</p><Link href="/shop" className="text-link">View all pieces</Link></div>
        </header>
        <nav className="departments" aria-label="Shop by collection">
          {categories.map((category) => <Link className="department" key={category.slug} href={"/shop?category=" + category.slug}>
            <div className="department-photo"><Image src={category.slug === "seating" ? "/images/editorial/arrival.webp" : category.image} alt="" fill sizes="(max-width: 720px) 45vw, 25vw" /></div>
            <div><h3>{category.name}</h3><p>{category.description}</p></div>
          </Link>)}
        </nav>
      </div>
    </section>
    <section id="objects" className="object-feature object-editorial">
      <div className="object-photo"><Image src="/images/editorial/umbra.webp" alt="A black ceramic vessel with fine brass bands on a stone plinth" fill sizes="(max-width: 800px) 100vw, 62vw" /></div>
      <div className="object-text"><p className="eyebrow">A study in ceramic</p><h2>The shape<br />of <em>stillness.</em></h2>
        <p>The Umbra Vessel pairs a dark glaze with a trace of warm brass. Its rounded body narrows to a fine, open rim.</p>
        <Link href="/product/umbra" className="button outline">Discover the Umbra Vessel</Link></div>
    </section>
    <section className="sanctuary-spread">
      <div className="sanctuary-art"><Image src="/images/products/alcove.webp" alt="The Alcove bed in carved dark timber with ivory bedding" fill sizes="(max-width:720px) 100vw, 58vw" /></div>
      <div><p className="eyebrow">The bedroom collection</p><h2>Behind<br /><em>closed doors.</em></h2><p>Slender posts, open tracery and linen caught in the late light. Discover the Alcove bed.</p><Link href="/shop?category=bedroom" className="text-link">Enter the bedroom</Link></div>
    </section>
    <section className="material-study"><header><p className="eyebrow">Material library</p><h2>Under <em>the light.</em></h2></header><div>
      {([["regent","Velvet","A directional pile that shifts from emerald to shadow."],["convive","Marble","Dark veins cross the pale stone of the dining table."],["umbra","Ceramic","A dark glaze picks up a narrow band of light."]] as const).map(([slug,name,copy])=><Link key={slug} href={"/product/"+slug}><figure><Image src={"/images/products/"+slug+".webp"} alt="" fill sizes="(max-width:720px) 100vw, 34vw" /></figure><h3>{name}</h3><p>{copy}</p></Link>)}
    </div></section>
    <section className="collection-section signature-section">
      <div className="shell">
        <div className="editorial-heading"><div><p className="eyebrow">Signature furniture & curated objects</p><h2>The pieces we return to.</h2></div><Link href="/shop" className="text-link">Shop the collection</Link></div>
        <Suspense fallback={<div className="product-grid featured-grid" aria-busy="true" aria-label="Loading featured pieces">
          {categories.map((category) => <div className="feature-placeholder" aria-hidden="true" key={category.slug}><div className="piece-photo" /></div>)}
        </div>}><SignaturePieces /></Suspense>
      </div>
    </section>
    <section className="realm-editorial">
      <Image src="/images/editorial/realm.webp" alt="An emerald sofa beneath a chandelier in a moonlit limestone salon" fill sizes="100vw" />
      <nav className="room-notes" aria-label="Shop the salon"><Link href="/product/regent">01 · Sofa</Link><Link href="/product/vesper">02 · Table</Link><Link href="/product/umbra">03 · Vessel</Link></nav>
      <div className="realm-copy"><p className="eyebrow">Architectural interiors</p><h2>Rooms after <em>dark.</em></h2>
        <p>Velvet, glazed ceramic, dark timber and brass. Four materials that change as a room moves from daylight into shadow.</p>
        <Link href="/about" className="button outline">Read the atelier story</Link></div>
    </section>
    <div className="house-signoff"><span>VEYRAVELUNE</span><p>Extraordinary Objects. Exceptional Living.</p></div>
  </>;
}

async function SignaturePieces() {
  const featured = await loadFeatured();
  if (!featured) return <p role="status">The collection is temporarily unavailable. <Link href="/shop" className="text-link">Reload the collection</Link></p>;
  if (featured.length > 0) return <div className="product-grid featured-grid">{featured.map((piece) => <div key={piece.id}><ProductCard item={piece} /><SaveButton slug={piece.slug} /></div>)}</div>;
  return <p>No featured pieces are listed. <Link href="/shop" className="text-link">View the collection</Link></p>;
}

async function loadFeatured() {
  try {
    return await db().product.findMany({ where: { active: true, featured: true, variants: { some: { active: true } } },
      include: productDetails, orderBy: { slug: "desc" }, take: 4 });
  } catch {
    console.error("Signature collection unavailable");
    return null;
  }
}
