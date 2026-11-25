"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { listAdminProducts } from "@/server/services/administration";

type Product = Awaited<ReturnType<typeof listAdminProducts>>[number];
type Category = { id: string; name: string };
function MutationForm({ endpoint, method = "POST", read, children, label, clear }: {
  endpoint: string; method?: "POST" | "PATCH"; read: (data: FormData) => unknown; children: ReactNode; label: string; clear?: boolean;
}) {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean }>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    pending.current = true; setBusy(true); setStatus(undefined);
    try {
      await api(endpoint, method, read(new FormData(form)));
      if (clear) form.reset();
      setStatus({ text: "Changes saved.", error: false });
      router.refresh();
    } catch (error) { setStatus({ text: error instanceof Error ? error.message : "Changes could not be saved.", error: true }); }
    finally { pending.current = false; setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}>{children}
    <button className="button" disabled={busy}>{busy ? "Saving…" : label}</button>
    {status && <p role={status.error ? "alert" : "status"}>{status.text}</p>}
  </form>;
}

function VariantInputs({ variant }: { variant?: Product["variants"][number] }) {
  return <>
    <label>SKU<input name="sku" defaultValue={variant?.sku} required maxLength={32} pattern="[A-Z0-9][A-Z0-9\-]{1,31}" /></label>
    <label>Finish<input name="finish" defaultValue={variant?.finish} required maxLength={60} /></label>
    <label>Price in cents<input name="priceCents" type="number" min={0} max={10000000} defaultValue={variant?.priceCents} required /></label>
    <label className="check"><input type="checkbox" name="variantActive" defaultChecked={variant?.active ?? true} /> Active variant</label>
  </>;
}
function variantData(data: FormData) {
  return { sku: data.get("sku"), finish: data.get("finish"), priceCents: Number(data.get("priceCents")), active: data.has("variantActive") };
}

export function ProductEditor({ product, categories }: { product?: Product; categories: Category[] }) {
  const path = "/api/admin/products" + (product ? "/" + product.id : "");
  const image = product?.images[0];
  return <>
    <MutationForm endpoint={path} method={product ? "PATCH" : "POST"} label={product ? "Save piece" : "Create piece"} clear={!product} read={(data) => ({
      slug: data.get("slug"), title: data.get("title"), categoryId: data.get("categoryId"), material: data.get("material"),
      dimensions: data.get("dimensions"), description: data.get("description"), active: data.has("active"),
      featured: data.has("featured"), images: [{ path: data.get("image"), alt: data.get("alt") }, ...(product?.images.slice(1) ?? [])],
      ...(product ? {} : { variants: [{ ...variantData(data), stock: Number(data.get("stock")) }] }),
    })}>
      <div className="form-stack admin-panel-grid">
        <label>Title<input name="title" required minLength={2} maxLength={100} defaultValue={product?.title} /></label>
        <label>URL slug<input name="slug" required maxLength={80} defaultValue={product?.slug} /></label>
        <label>Category<select name="categoryId" defaultValue={product?.categoryId}>{categories.map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
        <label>Material<input name="material" required maxLength={70} defaultValue={product?.material} /></label>
        <label>Dimensions<input name="dimensions" required maxLength={80} defaultValue={product?.dimensions} /></label>
        <label>Image path<input name="image" required placeholder="/images/products/regent.webp" defaultValue={image?.path} /></label>
        <label>Image description<input name="alt" required maxLength={150} defaultValue={image?.alt} /></label>
      </div>
      <label>Description<textarea name="description" required minLength={8} maxLength={1000} defaultValue={product?.description} /></label>
      <label className="check"><input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> Active piece</label>
      <label className="check"><input name="featured" type="checkbox" defaultChecked={product?.featured} /> Featured piece</label>
      {!product && <><VariantInputs /><label>Opening stock<input name="stock" type="number" min={0} max={10000} required defaultValue={0} /></label></>}
    </MutationForm>
    {product && <>
      {product.variants.map((variant) => <details key={variant.id} className="admin-record"><summary>{variant.sku} · {variant.finish} · Stock {variant.stock}</summary>
        <div className="admin-inline">
          <MutationForm endpoint={path} method="PATCH" label="Save variant" read={(data) => ({ variants: [{ id: variant.id, ...variantData(data) }] })}><VariantInputs variant={variant} /></MutationForm>
          <MutationForm endpoint="/api/admin/inventory" label="Adjust stock" clear read={(data) => ({ variantId: variant.id, delta: Number(data.get("delta")), reason: data.get("reason") })}>
            <label>Stock change<input name="delta" type="number" min={-10000} max={10000} required /></label>
            <label>Adjustment reason<input name="reason" minLength={3} maxLength={160} required /></label>
          </MutationForm>
        </div>
      </details>)}
      <details className="admin-record"><summary>Add a variant</summary>
        <MutationForm endpoint={path} method="PATCH" label="Create variant" clear read={(data) => ({ variants: [variantData(data)] })}><VariantInputs /></MutationForm>
      </details>
    </>}
  </>;
}
export function AdvanceOrder({ id, next }: { id: string; next: string }) {
  return <MutationForm endpoint={"/api/admin/orders/" + id} method="PATCH" label={next === "PROCESSING" ? "Mark processing" : "Mark completed"} read={() => ({ status: next })}>{null}</MutationForm>;
}
