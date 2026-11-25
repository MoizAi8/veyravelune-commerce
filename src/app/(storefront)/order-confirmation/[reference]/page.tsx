import Link from "next/link";
import { notFound } from "next/navigation";
import { guestOwner } from "@/server/auth/guest";
import { db } from "@/server/database";
import { ownerOrder } from "@/server/services/commerce";
import { money } from "@/lib/money";
import { Totals } from "@/components/checkout/bag";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmation", robots: { index: false } };
export default async function Confirmation({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const owner = await guestOwner();
  const order = owner && /^VL-[a-f0-9]{32}$/.test(reference) && await ownerOrder(db(), owner, reference);
  if (!order) notFound();
  return <div className="transaction-page confirmation-page"><div className="shell page-space"><header className="page-heading"><p className="eyebrow">Demo confirmed</p>
    <h1>Your demo order is recorded.</h1><p>Reference <span className="order-reference">{order.reference}</span></p><p>This order creates no charge or delivery.</p></header>
    <div className="bag-layout"><ul className="bag-lines">{order.items.map((line) => <li key={line.sku}><div><strong>{line.title}</strong><p>{line.finish} · Qty {line.quantity}</p></div><span>{money(line.lineTotalCents)}</span></li>)}</ul>
      <div className="summary"><h2>Order summary</h2><p>Fictional destination · {order.destination}</p><Totals quote={order} /><Link className="button" href="/shop">Return to the collection</Link></div></div>
  </div></div>;
}
