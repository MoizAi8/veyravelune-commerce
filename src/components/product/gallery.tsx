"use client";
import Image from "next/image";
import { useRef, useState } from "react";

export function Gallery({ images }: { images: { path: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[index];
  if (!current) return <div className="piece-photo" />;
  return <div className="gallery">
    <button type="button" className="gallery-main" aria-label="Enlarge product image" onClick={() => dialog.current?.showModal()}>
      <Image src={current.path} alt={current.alt} fill sizes="(max-width: 750px) 100vw, 56vw" preload={index === 0} />
      <span>Enlarge image</span>
    </button>
    {images.length > 1 && <div className="thumbs">{images.map((row, i) => <button key={row.path + ":" + i} onClick={() => setIndex(i)} aria-label={row.alt} aria-pressed={i === index}>
      <Image src={row.path} alt="" width={72} height={72} />
    </button>)}</div>}
    <dialog ref={dialog} className="image-dialog" aria-label="Enlarged product image">
      <button className="button outline" type="button" onClick={() => dialog.current?.close()}>Close image</button>
      <Image src={current.path} alt={current.alt} width={720} height={720} />
    </dialog>
  </div>;
}
