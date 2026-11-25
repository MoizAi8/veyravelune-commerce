"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/money";
import { useBag } from "@/store/bag";
import { useBagReady } from "@/components/layout/bag-hydrator";

type Variant = { id: string; sku: string; finish: string; priceCents: number; stock: number };
export function ProductActions({ slug, variants }: { slug: string; variants: Variant[] }) {
  const finishGroup = useId();
  const [selected, setSelected] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const add = useBag((state) => state.add);
  const ready = useBagReady();
  const variant = variants.find((row) => row.id === selected) ?? variants[0];
  if (!variant) return <p>This piece is unavailable.</p>;
  return <div className="product-actions">
    <p className="product-price">{money(variant.priceCents)}</p>
    <fieldset disabled={!ready}><legend>Finish</legend><div className="finishes">
      {variants.map((row) => <label key={row.id}><input type="radio" name={finishGroup} checked={row.id === variant.id}
        onChange={() => { setSelected(row.id); setQuantity(1); setStatus(""); }} /> <span>{row.finish}{row.stock === 0 ? " · Unavailable" : ""}</span></label>)}
    </div></fieldset>
    <p className="muted">SKU {variant.sku} · {variant.stock ? variant.stock + " available" : "Out of stock"}</p>
    <div className="buy-row"><label>Quantity <select value={quantity} disabled={!ready || !variant.stock}
      onChange={(event) => setQuantity(Number(event.target.value))}>
      {Array.from({ length: Math.max(1, Math.min(variant.stock, 8)) }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
    </select></label>
    <button className="button" type="button" disabled={!ready || !variant.stock} onClick={() => {
      setStatus(add({ variantId: variant.id, quantity }, variant.stock) ? "Added to your bag." : "Your bag has reached the limit for this piece.");
    }}>Add to bag</button></div>
    <p className="action-status" role="status">{status} {status === "Added to your bag." && <Link href="/cart">View bag</Link>}</p>
    <SaveButton slug={slug} />
  </div>;
}
export function SaveButton({ slug }: { slug: string }) {
  const ready = useBagReady();
  const saved = useBag((state) => state.saved.includes(slug));
  const toggle = useBag((state) => state.toggleSaved);
  return <button type="button" className="text-link" disabled={!ready} aria-pressed={saved} onClick={() => toggle(slug)}>{saved ? "Remove from saved pieces" : "Save this piece"}</button>;
}
