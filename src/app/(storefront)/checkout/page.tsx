import Link from "next/link";
import { Bag } from "@/components/checkout/bag";
import { demoWritesAvailable } from "@/server/request";
export const metadata = { title: "Demo checkout", robots: { index: false } };
export const dynamic = "force-dynamic";
export default function Checkout() {
  return <div className="transaction-page"><div className="shell page-space"><Link href="/cart" className="text-link">Return to bag</Link><header className="page-heading"><p className="eyebrow">Guest order</p><h1>Demo checkout</h1><p>Demo delivery is $45 for orders below $2,000 and free at $2,000 or above. Demo tax is $0.</p></header><Bag checkout checkoutEnabled={process.env.COMMERCE_MODE === "demo" && demoWritesAvailable()} /></div></div>;
}
