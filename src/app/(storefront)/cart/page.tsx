import { Bag } from "@/components/checkout/bag";
import { demoWritesAvailable } from "@/server/request";
export const metadata = { title: "Your bag" };
export const dynamic = "force-dynamic";
export default function Cart() {
  return <div className="transaction-page"><div className="shell page-space"><header className="page-heading"><p className="eyebrow">Your selection</p><h1>Your bag</h1></header><Bag checkoutEnabled={process.env.COMMERCE_MODE === "demo" && demoWritesAvailable()} /></div></div>;
}
