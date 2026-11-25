"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function MobileFilters({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const screen = window.matchMedia("(max-width: 720px)");
    const closeOnDesktop = () => { if (!screen.matches) panel.current?.close(); };
    screen.addEventListener("change", closeOnDesktop);
    return () => screen.removeEventListener("change", closeOnDesktop);
  }, []);

  return <div className="mobile-filters">
    <button className="button outline" type="button" onClick={() => panel.current?.showModal()}>Filter and sort</button>
    <dialog className="bag-drawer filter-drawer" ref={panel} aria-labelledby="mobile-filter-title">
      <div className="drawer-head">
        <h2 id="mobile-filter-title">Filter and sort</h2>
        <button className="text-link" type="button" onClick={() => panel.current?.close()}>Close filters</button>
      </div>
      {children}
    </dialog>
  </div>;
}
