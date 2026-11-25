"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { categories } from "@/features/catalog/collection";
import { money } from "@/lib/money";
import "./catalog-search.css";

type Hit = { slug:string; title:string; category:string; image:string | null; material:string; finish:string; multiplePrices:boolean; priceCents:number };
type Results = {term:string; items:Hit[]; total:number; failed:boolean};
const historyKey = "veyravelune.recent-searches";
function recentTerms(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(historyKey) || "[]");
    return Array.isArray(saved) ? saved.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= 80).slice(0,5) : [];
  } catch { return []; }
}

export function CatalogSearch() {
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [recent,setRecent] = useState<string[]>([]);
  const [result,setResult] = useState<Results | null>(null);
  const [attempt,setAttempt] = useState(0);
  const term = query.trim();
  const current = result?.term === term ? result : null;
  useEffect(() => {
    if (!open || !term) return;
    const cancel = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/products?view=suggestions&q="+encodeURIComponent(term), {signal:cancel.signal});
        if (!response.ok) throw new Error("Search unavailable");
        const body: Pick<Results,"items"|"total"> = await response.json();
        if (!cancel.signal.aborted) setResult({...body,term,failed:false});
      } catch {
        if (!cancel.signal.aborted) setResult({term,items:[],total:0,failed:true});
      }
    },220);
    return () => {clearTimeout(timer);cancel.abort();};
  },[open,term,attempt]);

  function remember() {
    if (!term) return;
    const next = [term,...recentTerms().filter(s=>s.toLowerCase()!==term.toLowerCase())].slice(0,5);
    try { localStorage.setItem(historyKey,JSON.stringify(next)); } catch { /* Storage can be disabled. */ }
  }
  function close() { dialog.current?.close(); }
  function choose(value:string) {setQuery(value);setResult(null);field.current?.focus();}
  return <>
    <button ref={trigger} type="button" className="search-trigger" aria-label="Search products" aria-haspopup="dialog" onClick={()=>{
      setQuery("");setResult(null);setRecent(recentTerms());setOpen(true);dialog.current?.showModal();field.current?.focus();
    }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg></button>
    <dialog className="catalog-search" ref={dialog} aria-labelledby="catalog-search-title" onKeyDown={event=>{if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();}}}
      onClose={()=>{setOpen(false);trigger.current?.focus({preventScroll:true});}}>
      <div className="search-shell"><header><p className="eyebrow">The collection index</p><button type="button" className="text-link" onClick={close}>Close search</button></header>
      <h2 id="catalog-search-title">Find a <em>piece.</em></h2>
      <form role="search" action="/shop" onSubmit={e=>{e.preventDefault();remember();close();router.push(term?"/shop?q="+encodeURIComponent(term):"/shop");}}>
        <label className="sr-only" htmlFor="house-query">Search the catalogue</label>
        <input id="house-query" name="q" type="search" maxLength={80} ref={field} autoComplete="off" placeholder="Name, material or finish" value={query} onChange={e=>choose(e.target.value)} />
        <button type="submit" aria-label="View full search results">Search ↗</button>
      </form>
      {!term ? <div className="search-sections">{recent.length>0 && <section><h3>Recent searches</h3><div>{recent.map(s=><button key={s} type="button" onClick={()=>choose(s)}>{s}</button>)}</div></section>}
        <section><h3>Explore collections</h3><div>{categories.map(c=><Link key={c.slug} href={"/shop?category="+c.slug} onClick={close}>{c.name}</Link>)}</div></section></div> :
        <><p className="search-status" role="status">{!current?"Searching the catalogue…":current.failed?"Search is temporarily unavailable.":current.total===0?"No pieces found. Try another name, material or finish.":current.total+" "+(current.total===1?"piece":"pieces")+" found"}</p>
        {current?.failed && <button className="text-link" onClick={()=>{setResult(null);setAttempt(a=>a+1);}}>Try again</button>}
        {current && current.items.length>0 && <><ul>{current.items.map(item=><li key={item.slug}><Link href={"/product/"+item.slug} onClick={()=>{remember();close();}}>
          {item.image && <Image src={item.image} width={68} height={76} alt="" />}
          <span><small>{item.category}</small><strong>{item.title}</strong><small>{[...new Set([item.material,item.finish])].join(" · ")}</small></span><span>{item.multiplePrices ? "From " : ""}{money(item.priceCents)}</span>
        </Link></li>)}</ul><Link className="text-link" href={"/shop?q="+encodeURIComponent(term)} onClick={()=>{remember();close();}}>View all results</Link></>}
        </>}
      </div>
    </dialog>
  </>;
}
