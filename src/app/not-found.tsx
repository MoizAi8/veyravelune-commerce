import Link from "next/link";
export default function NotFound() {
  return <section className="shell page-space"><p className="eyebrow">Page unavailable</p><h1>Beyond the atelier</h1><p>This page or order could not be found.</p><Link href="/shop" className="button">Explore the collection</Link></section>;
}
