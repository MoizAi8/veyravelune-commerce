import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { categories } from "@/features/catalog/collection";
import { db } from "@/server/database";
import { catalog, catalogQuery } from "@/server/services/catalog";
import { ProductCard } from "@/components/product/product-card";
import { MobileFilters } from "@/components/product/mobile-filters";
export const metadata: Metadata = { title: "The Collection" };
export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;
export default async function Shop({ searchParams }: { searchParams: Promise<Params> }) {
  const fields = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === "string" && value) fields.set(key, value);
  const parsed = catalogQuery.safeParse(Object.fromEntries(fields));
  const database = db();
  const [page, materials] = await Promise.all([
    parsed.success ? catalog(database, parsed.data) : null,
    database.product.findMany({ where: { active: true, variants: { some: { active: true } } }, select: { material: true }, distinct: ["material"], orderBy: { material: "asc" } }),
  ]);
  const materialFilter = fields.get("material") ?? "";
  const department = categories.find((category) => category.slug === fields.get("category"));
  const next = (index: number) => {
    const copy = new URLSearchParams(fields);
    copy.set("page", String(index));
    return "/shop?" + copy.toString();
  };
  const filterForm = <form className="catalog-filters form-stack" action="/shop" aria-label="Filter the collection">
        <label>Search<input type="search" name="q" maxLength={80} defaultValue={fields.get("q") ?? ""} placeholder="Name or material" /></label>
        <label>Category<select name="category" defaultValue={fields.get("category") ?? ""}><option value="">All categories</option>{categories.map((row) => <option key={row.slug} value={row.slug}>{row.name}</option>)}</select></label>
        <label>Material<select name="material" defaultValue={materialFilter}><option value="">All materials</option>
          {materialFilter && !materials.some((row) => row.material === materialFilter) && <option>{materialFilter}</option>}
          {materials.map(({ material }) => <option key={material}>{material}</option>)}</select></label>
        <div className="filter-prices"><label>Min. USD<input type="number" min="0" max="999999" name="min" defaultValue={fields.get("min") ?? ""} /></label>
          <label>Max. USD<input type="number" min="0" max="999999" name="max" defaultValue={fields.get("max") ?? ""} /></label></div>
        <label>Sort by<select name="sort" defaultValue={fields.get("sort") ?? "curated"}><option value="curated">Curated</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option><option value="name">Name</option></select></label>
        <button className="button">Apply filters</button><Link className="text-link" href="/shop">Reset filters</Link>
      </form>;
  return <div className="shell page-space catalogue-page">
    <header className={"catalogue-cover" + (department ? " catalogue-cover-category" : "")}>
      <div><p className="eyebrow">The Royal Realm collection index</p>
        <h1>{parsed.success && parsed.data.q ? "Results for “" + parsed.data.q + "”" : department ? department.name : "Pieces with presence."}</h1>
        <p>{department?.description ?? "Seating, tables, lighting and objects for the rooms you keep returning to."}</p>
      </div>
      <figure><Image src={department?.image ?? "/images/editorial/realm.webp"} alt="" fill loading="eager" sizes="(max-width: 720px) 100vw, 40vw" /></figure>
    </header>
    <nav className="catalogue-departments" aria-label="Collection departments">
      <Link href="/shop" aria-current={!department ? "page" : undefined}>All pieces</Link>
      {categories.map((category) => <Link key={category.slug} href={"/shop?category=" + category.slug} aria-current={department === category ? "page" : undefined}>{category.name}</Link>)}
    </nav>
    <div className="catalog-layout">
      <div className="desktop-filters">{filterForm}</div>
      <MobileFilters>{filterForm}</MobileFilters>
      <section aria-label="Collection results">
        <p className="eyebrow result-count">{page ? page.total + (page.total === 1 ? " piece" : " pieces") : "Filters need attention"}</p>
        {page?.items.length ? <div className="product-grid">{page.items.map((item) => <ProductCard key={item.id} item={item} />)}</div>
          : <div className="empty"><h2>{page ? "No pieces found" : "Check the selected filters"}</h2><Link href="/shop" className="text-link">View the complete collection</Link></div>}
        {page && (page.page > 1 || page.total > page.pageSize) && <nav className="pagination" aria-label="Collection pages">
          {page.page > 1 && <Link className="text-link" href={next(page.page - 1)}>Previous page</Link>}<span>Page {page.page}</span>
          {page.total > page.page * page.pageSize && <Link className="text-link" href={next(page.page + 1)}>Next page</Link>}
        </nav>}
      </section>
    </div>
  </div>;
}
