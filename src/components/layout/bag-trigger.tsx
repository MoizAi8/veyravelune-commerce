"use client";
import { useRef, useState } from "react";
import { Bag } from "@/components/checkout/bag";
import { useBag } from "@/store/bag";
import { useBagReady } from "./bag-hydrator";

export function BagTrigger({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const drawer = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const ready = useBagReady();
  const count = useBag((state) => state.items.reduce((sum, row) => sum + row.quantity, 0));
  function show() {
    setOpen(true);
    drawer.current?.showModal();
  }
  return <>
    <button type="button" className="nav-bag" onClick={show}>Bag <span aria-label={(ready ? count : 0) + " items"}>{ready ? count : 0}</span></button>
    <dialog ref={drawer} className="bag-drawer" aria-labelledby="drawer-title" onClose={() => setOpen(false)}>
      <div className="drawer-head"><h2 id="drawer-title">Your bag</h2><button className="text-link" onClick={() => drawer.current?.close()} type="button">Close</button></div>
      {open && <div onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) drawer.current?.close(); }}><Bag compact checkoutEnabled={checkoutEnabled} /></div>}
    </dialog>
  </>;
}
