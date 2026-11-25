import Link from "next/link";
import { BagHydrator } from "@/components/layout/bag-hydrator";
import { CatalogSearch } from "@/components/layout/catalog-search";
import { BagTrigger } from "@/components/layout/bag-trigger";
import { StoreNavigation } from "@/components/layout/store-navigation";
import { demoWritesAvailable } from "@/server/request";
import "./storefront.css";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>
    <BagHydrator />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="masthead atelier-masthead">
      <Link href="/" className="wordmark"><span aria-hidden="true">✧</span> VEYRAVELUNE</Link>
      <StoreNavigation />
      <div className="nav-actions"><CatalogSearch /><Link href="/wishlist">Saved</Link><BagTrigger checkoutEnabled={process.env.COMMERCE_MODE === "demo" && demoWritesAvailable()} /></div>
    </header>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer atelier-footer">
      <div className="footer-intro"><p className="eyebrow">The Royal Realm</p><Link href="/" className="wordmark"><span aria-hidden="true">✧</span> VEYRAVELUNE</Link><p>Extraordinary Objects. Exceptional Living.</p></div>
      <div className="footer-links">
        <nav aria-label="Shop and service"><Link href="/shop">The collection</Link><Link href="/wishlist">Saved pieces</Link><Link href="/cart">Your bag</Link></nav>
        <nav aria-label="Atelier information"><Link href="/about">The Atelier</Link><Link href="/contact">Contact</Link><Link href="/policies">Delivery, returns & privacy</Link></nav>
      </div>
      <p className="footer-demo">A fictional interiors atelier. Demo orders create no charges or deliveries.</p>
    </footer>
  </>;
}
