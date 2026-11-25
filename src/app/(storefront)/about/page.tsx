import Image from "next/image";
import Link from "next/link";
export const metadata = { title: "The Atelier" };

export default function About() {
  return <>
    <header className="realm-editorial about-cover">
      <Image src="/images/editorial/realm.webp" alt="The Nocturne salon under an antique chandelier" fill preload sizes="100vw" />
      <div className="realm-copy"><p className="eyebrow">The interiors atelier</p><h1>Rooms after <em>dark.</em></h1>
        <p>VEYRAVELUNE is a fictional interiors house inspired by the moment a room slips from daylight into shadow.</p></div>
    </header>
    <section className="atelier-story"><div className="shell about-layout">
      <div className="about-image"><Image src="/images/editorial/illumination.webp" alt="Warm light catching the cut glass of a chandelier" fill sizes="(max-width: 800px) 100vw, 55vw" /></div>
      <div className="atelier-story-copy"><p className="eyebrow">The Nocturne Collection</p><h2>Drawn from<br /><em>the long evening.</em></h2>
        <p>We started with the arc of a sofa and the shoulder of a vessel. The collection follows those curves through velvet, glazed ceramic, timber and brass.</p>
        <Link className="button" href="/shop">Explore the collection</Link></div>
    </div></section>
    <section id="image-credits" className="shell credit-panel">
      <p className="eyebrow">Image credits</p><h2>The film and the collection</h2>
      <p>The catalog uses generated concept artwork for fictional pieces. The film features an adapted sofa, vessel and chandelier by Fran Calvente, James Ray Cock and Kirill Sannikov, with a studio environment by Sergej Majboroda. The Alcove bed by Kirill Sannikov, lounge chair by Kuutti Siitonen and side table by James Ray Cock also appear in the film and their product photographs. These three photographs are studio renders of the licensed meshes.</p>
      <a className="text-link" href="https://polyhaven.com/license">Poly Haven asset license</a>
    </section>
  </>;
}
