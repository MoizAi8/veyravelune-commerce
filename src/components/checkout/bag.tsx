"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { destinations } from "@/features/orders/contracts";
import { api } from "@/lib/api";
import { money } from "@/lib/money";
import { useBag } from "@/store/bag";
import { useBagReady } from "@/components/layout/bag-hydrator";
import type { quote } from "@/server/services/commerce";

type Quote = Awaited<ReturnType<typeof quote>>;
export function Totals({ quote }: { quote: Pick<Quote, "subtotalCents" | "shippingCents" | "taxCents" | "discountCents" | "totalCents"> }) {
  return <dl className="totals">
    <div><dt>Subtotal</dt><dd>{money(quote.subtotalCents)}</dd></div>
    <div><dt>Demo delivery</dt><dd>{money(quote.shippingCents)}</dd></div>
    <div><dt>Demo tax</dt><dd>{money(quote.taxCents)}</dd></div>
    <div><dt>Discount</dt><dd>{money(quote.discountCents)}</dd></div>
    <div><dt>Total</dt><dd>{money(quote.totalCents)}</dd></div>
  </dl>;
}

export function Bag({ checkout = false, checkoutEnabled = true, compact = false }: { checkout?: boolean; checkoutEnabled?: boolean; compact?: boolean }) {
  const items = useBag((state) => state.items);
  const setQuantity = useBag((state) => state.setQuantity);
  const clear = useBag((state) => state.clear);
  const attempt = useBag((state) => state.attempt);
  const ready = useBagReady();
  const router = useRouter();
  const [priced, setPriced] = useState<{ key: string; data: Quote }>();
  const [failure, setFailure] = useState<{ key: string; message: string }>();
  const [orderError, setOrderError] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const signature = JSON.stringify(items);
  const quoteKey = signature + ":" + revision;

  useEffect(() => {
    if (!ready || !items.length) return;
    const controller = new AbortController();
    api<Quote>("/api/cart/quote", "POST", { items }, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setPriced({ key: quoteKey, data }); })
      .catch((error: Error) => { if (!controller.signal.aborted) setFailure({ key: quoteKey, message: error.message }); });
    return () => controller.abort();
  }, [ready, items, quoteKey]);

  const current = priced?.key === quoteKey ? priced.data : undefined;
  const error = failure?.key === quoteKey ? failure.message : "";
  async function place(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current?.available || sending.current || !checkoutEnabled) return;
    const form = new FormData(event.currentTarget);
    const destination = form.get("destination");
    sending.current = true;
    setBusy(true);
    setOrderError("");
    try {
      const { reference } = await api<{ reference: string }>("/api/orders", "POST", {
        items, destination, demoConfirmed: form.get("confirm") === "on",
        idempotencyKey: attempt(JSON.stringify([items, destination])),
      });
      router.replace("/order-confirmation/" + reference);
      clear();
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Your order could not be placed.");
      setRevision((value) => value + 1);
      sending.current = false;
      setBusy(false);
    }
  }

  if (!ready) return <p role="status">Opening your bag…</p>;
  if (!items.length) return <div className="bag-empty"><p>{busy ? "Opening your confirmation…" : "Your bag is empty."}</p>{!busy && <Link className="text-link" href="/shop">Explore the collection</Link>}</div>;
  if (error) return <div><p role="alert">{error}</p><button className="button outline" onClick={() => setRevision((value) => value + 1)}>Refresh quote</button></div>;
  if (!current) return <p role="status">Checking availability and pricing…</p>;

  return <div className={compact ? "bag-layout compact" : "bag-layout"}>
    <ul className="bag-lines">
      {current.lines.map((line) => <li key={line.variantId}>
        <div><strong>{line.slug ? <Link href={"/product/" + line.slug}>{line.title}</Link> : line.title}</strong>
          <p>{line.finish} {checkout ? "· Qty " + line.quantity : ""}</p>{!line.available && <p role="status">{line.stock ? "Only " + line.stock + " available." : "Unavailable."}</p>}</div>
        {!checkout && <label className="bag-quantity">Qty <select aria-label={"Quantity for " + line.title} value={line.quantity}
          onChange={(event) => setQuantity(line.variantId, Number(event.target.value))}>
          {Array.from({ length: Math.max(line.quantity, Math.min(8, line.stock)) }, (_, index) => <option key={index + 1} disabled={index + 1 > line.stock}>{index + 1}</option>)}
        </select></label>}
        <div>{money(line.lineTotalCents)}{!checkout && <button type="button" className="text-link" aria-label={"Remove " + line.title} onClick={() => setQuantity(line.variantId, 0)}>Remove</button>}</div>
      </li>)}
    </ul>
    <section className="summary" aria-label="Order summary"><h2>Order summary</h2><Totals quote={current} />
      {checkout ? <form className="form-stack" onSubmit={place}>
        <p>This is a fictional order. Use the sample recipient and one of the fictional destinations below.</p>
        <label>Sample recipient<input value="Atelier Guest" readOnly /></label>
        <label>Fictional destination<select name="destination" defaultValue={destinations[0]}>{destinations.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
        <label className="check"><input type="checkbox" name="confirm" required /> I understand this demo creates no charge or delivery.</label>
        {orderError && <p role="alert">{orderError}</p>}
        {!current.available && <Link href="/cart" className="text-link">Review your bag</Link>}
        {!checkoutEnabled && <p>Demo checkout is currently disabled.</p>}
        <button className="button" disabled={busy || !current.available || !checkoutEnabled}>{busy ? "Placing demo order…" : "Place demo order"}</button>
      </form> : current.available && checkoutEnabled ? <Link className="button" href={compact ? "/cart" : "/checkout"}>{compact ? "View full bag" : "Continue to demo checkout"}</Link>
        : <p>{checkoutEnabled ? "Update unavailable pieces to continue." : "Demo checkout is currently disabled."}</p>}
    </section>
  </div>;
}
