import { Saved } from "@/components/product/saved";
export const metadata = { title: "Saved pieces" };
export default function Wishlist() {
  return <div className="shell page-space saved-editorial"><header className="page-heading"><p className="eyebrow">Your private edit</p><h1>Saved pieces</h1><p>Keep a shortlist of pieces on this device.</p></header><Saved /></div>;
}
