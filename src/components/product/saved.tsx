"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useBag } from "@/store/bag";
import { useBagReady } from "@/components/layout/bag-hydrator";
import { ProductCard } from "./product-card";
import { ProductActions, SaveButton } from "./product-actions";
import type { CatalogProduct } from "@/server/services/catalog";

function SavedPiece({ slug }: { slug: string }) {
  const [item, setItem] = useState<CatalogProduct | null>();
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products/" + encodeURIComponent(slug), { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error();
        return (await res.json()).item as CatalogProduct;
      }).then((item) => { if (!controller.signal.aborted) { setItem(item); setError(false); } })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [slug, retry]);
  if (error) return <div><p role="alert">Unable to load this saved piece.</p><button className="text-link" onClick={() => setRetry((n) => n + 1)}>Retry</button> <SaveButton slug={slug} /></div>;
  if (item === undefined) return <p role="status">Loading saved piece…</p>;
  if (!item) return <div><p>This piece is unavailable.</p><SaveButton slug={slug} /></div>;
  return <div className="saved-piece"><ProductCard item={item} /><ProductActions slug={slug} variants={item.variants} /></div>;
}
export function Saved() {
  const saved = useBag((state) => state.saved);
  const ready = useBagReady();
  if (!ready) return <p role="status">Opening your saved pieces…</p>;
  if (!saved.length) return <div className="saved-empty"><p>You haven’t saved any pieces yet.</p><Link href="/shop" className="text-link">Explore the collection</Link></div>;
  return <div className="product-grid">{saved.map((slug) => <SavedPiece key={slug} slug={slug} />)}</div>;
}
