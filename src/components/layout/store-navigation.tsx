"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StoreNavigation() {
  const pathname = usePathname();
  return <nav className="main-nav" aria-label="Main navigation">
    <Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>Collection</Link>
    <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>The Atelier</Link>
    <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>Contact</Link>
  </nav>;
}
