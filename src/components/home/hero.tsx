"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { chapterAt, chapterStops, choreography } from "@/components/motion/choreography";
import "./film.css";
import "./royal-realm.css";

const AtelierScene = dynamic(() => import("@/components/three/atelier-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger, useGSAP);

const motionQuery = "(min-width: 1000px) and (prefers-reduced-motion: no-preference)";
const chapters = [
  { name: "The Arrival", title: ["The Royal", "Realm."], description: "A journey through the architecture, objects and private rooms of Veyravelune.", image: "vestibule", object: "Enter the house", href: "/about" },
  { name: "The Sovereign Sofa", title: ["The Sovereign", "Sofa."], description: "A house study in emerald upholstery and carved timber, seen in the last light through the salon windows.", image: "arrival", object: "Discover seating", href: "/shop?category=seating" },
  { name: "The Royal Artifacts", title: ["Objects of", "distinction."], description: "An atelier interpretation of the Umbra vessel. Light traces its narrow mouth and the bands around its dark glaze.", image: "umbra", object: "Explore the Umbra Vessel", href: "/product/umbra" },
  { name: "The Private Sanctuary", title: ["The private", "sanctuary."], description: "Carved tracery frames a bed dressed in soft folds of ivory. A private chamber, held in the warmth of timber.", image: "alcove", object: "Discover bedroom", href: "/shop?category=bedroom" },
  { name: "The Illumination", title: ["A room", "set aglow."], description: "An amber pendant lights the Repose lounge chair and its Companion side table.", image: "illumination", object: "Discover lighting", href: "/shop?category=lighting" },
  { name: "Enter the Realm", title: ["Extraordinary Objects.", "Exceptional Living."], description: "Furnish a room for the hours you wish would last a little longer.", image: "realm", object: "Shop the collection", href: "/shop" },
] as const;

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const supportsMotion = () => window.matchMedia(motionQuery).matches;

class SceneBoundary extends Component<{ children: ReactNode; fallback: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.fallback(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function FilmCanvas({ progress, chapter, registerRenderer, fallback }: {
  progress: RefObject<number>; chapter: number; registerRenderer: (invalidate: () => void) => void; fallback: () => void;
}) {
  const [loaded, setLoaded] = useState(0);
  // Keep prepared models mounted when visitors scroll back into earlier chapters.
  const [furthestChapter, setFurthestChapter] = useState(chapter);
  if (chapter > furthestChapter) setFurthestChapter(chapter);
  const mark = useCallback((asset: number) => setLoaded((current) => current | (1 << asset)), []);
  const asset = [-1, 0, 1, 3, 2, -1][chapter];
  const rendered = asset < 0 || Boolean(loaded & (1 << asset));
  return <div className="hero-canvas" aria-hidden="true" data-rendered={rendered}>
    <Image className="film-salon" src="/images/editorial/salon-backplate.webp" alt="" fill sizes="100vw" />
    <Image className="film-chamber" src="/images/editorial/chamber.webp" alt="" fill sizes="100vw" />
    <div className="film-salon-warm" />
    <SceneBoundary fallback={fallback}>
      <AtelierScene chapter={furthestChapter} progress={progress} registerRenderer={registerRenderer} mark={mark} ready={Boolean(loaded & 1)} fallback={fallback} />
    </SceneBoundary>
  </div>;
}

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const draw = useRef<(() => void) | null>(null);
  const displayedChapter = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [permission, setPermission] = useState<"pending" | "available" | "unavailable">("pending");
  const [stills, setStills] = useState(false);
  const cinematic = useSyncExternalStore(subscribeMotion, supportsMotion, () => false);
  const active = cinematic && permission === "available" && !stills;
  const current = chapters[cinematic ? chapter : 0];
  const registerRenderer = useCallback((invalidate: () => void) => { draw.current = invalidate; }, []);
  const fallback = useCallback(() => { draw.current = null; setPermission("unavailable"); }, []);

  useEffect(() => {
    if (!cinematic || permission !== "pending") return;
    const task = requestAnimationFrame(() => {
      try {
        const probe = document.createElement("canvas").getContext("webgl2");
        if (!probe) { fallback(); return; }
        probe.getExtension("WEBGL_lose_context")?.loseContext();
        setPermission("available");
      } catch { fallback(); }
    });
    return () => cancelAnimationFrame(task);
  }, [cinematic, fallback, permission]);

  useGSAP(() => {
    if (!scope.current || !cinematic) return;
    const update = (value: number) => {
      const next = chapterAt(value);
      if (displayedChapter.current !== next) {
        displayedChapter.current = next;
        setChapter(next);
      }
      progress.current = value;
      viewport.current?.style.setProperty("--film-progress", String(value));
      const { veil, warmth, chamber } = choreography(value);
      viewport.current?.style.setProperty("--stage-veil", String(veil));
      viewport.current?.style.setProperty("--chamber", String(chamber));
      viewport.current?.style.setProperty("--film-warmth", String(warmth));
      if (!document.hidden) draw.current?.();
    };
    const trigger = ScrollTrigger.create({
      trigger: scope.current, start: "top top", end: "bottom bottom",
      onUpdate: ({ progress: value }) => update(value), onRefresh: ({ progress: value }) => update(value),
    });
    update(trigger.progress);
  }, { scope, dependencies: [cinematic], revertOnUpdate: true });

  function goTo(index: number) {
    const element = scope.current;
    if (!element) return;
    const start = window.scrollY + element.getBoundingClientRect().top;
    const distance = element.offsetHeight - window.innerHeight;
    window.scrollTo({ top: index ? start + distance * chapterStops[index] : 0, behavior: "smooth" });
  }

  return <>
    <section id="experience" ref={scope} className="film" data-chapter={cinematic ? chapter : 0} aria-label="The Royal Realm film">
      <div ref={viewport} className="film-viewport">
        <div className="film-poster" aria-hidden="true">
          <Image src="/images/editorial/vestibule.webp" alt="" fill preload sizes="(max-width: 720px) 150vw, 100vw" />
          {cinematic && chapters.slice(1).map((item, index) => (
            chapter >= index && <Image key={item.image} className="film-still" data-current={current.image === item.image}
              src={"/images/editorial/" + item.image + ".webp"} alt="" fill sizes="100vw" />
          ))}
        </div>
        {active && <FilmCanvas chapter={chapter} progress={progress} registerRenderer={registerRenderer} fallback={fallback} />}
        <div className="film-shade" aria-hidden="true" />
        <div className="film-border" aria-hidden="true"><span>✧</span><span>✧</span></div>
        <div className="film-content">
          <p className="film-collection"><span aria-hidden="true">✦</span> The House of Veyravelune</p>
          <div className="film-copy" key={current.name}>
            <h1 className="film-title">
              <span><span>{current.title[0]}</span></span>{" "}
              <span><em>{current.title[1]}</em></span>
            </h1>
            <p>{current.description}</p>
          </div>
          <div className="film-actions">
            <Link className="button film-cta" href="/shop" onPointerMove={(event) => {
              if (!cinematic || event.pointerType !== "mouse") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty("--magnet-x", ((event.clientX - bounds.left - bounds.width / 2) * 0.055) + "px");
              event.currentTarget.style.setProperty("--magnet-y", ((event.clientY - bounds.top - bounds.height / 2) * 0.13) + "px");
            }} onPointerLeave={(event) => {
              event.currentTarget.style.removeProperty("--magnet-x");
              event.currentTarget.style.removeProperty("--magnet-y");
            }}><span>Explore the collection</span></Link>
            {current.href !== "/shop" && <Link className="film-object text-link" href={current.href}>{current.object}</Link>}
          </div>
        </div>
        <div className="film-rail">
          <div className="film-chapter"><span aria-hidden="true">{["00","01","02","03","04","05"][cinematic ? chapter : 0]}</span><span>{current.name}</span></div>
          <nav className="film-navigation" aria-label="Film chapters">
            {chapters.map((item, index) => <button key={item.name} type="button" aria-label={item.name} aria-current={chapter === index ? "step" : undefined}
              onClick={() => goTo(index)}><span aria-hidden="true" /></button>)}
          </nav>
          <div className="film-controls">
            {permission === "available" && <button className="text-link" type="button" onClick={() => setStills((value) => !value)}>{stills ? "Play in 3D" : "View stills"}</button>}
            {permission === "unavailable" && <span className="film-fallback" role="status">3D unavailable · Showing stills</span>}
            <a href="#collection" className="text-link">Skip to Collections</a>
          </div>
        </div>
        <div className="film-progress" aria-hidden="true"><span /></div>
        <span className="film-scroll" aria-hidden="true">Scroll to explore</span>
      </div>
    </section>
    <div className="film-mobile-chapters">
      {chapters.slice(1).map((item) => <section key={item.image} className={"film-mobile-card film-mobile-" + item.image}>
        <div><Image src={"/images/editorial/" + item.image + ".webp"} alt="" fill sizes="(min-width: 760px) 52vw, 100vw" /></div>
        <header><p className="eyebrow">{item.name}</p><h2>{item.title[0]} <em>{item.title[1]}</em></h2><p>{item.description}</p><Link className="text-link" href={item.href}>{item.object}</Link></header>
      </section>)}
    </div>
  </>;
}
