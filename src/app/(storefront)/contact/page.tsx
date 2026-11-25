import Image from "next/image";
import { ContactForm } from "@/components/checkout/contact";
export const metadata = { title: "Contact" };

export default function Contact() {
  return <section className="shell contact-editorial">
    <div className="contact-copy">
      <header className="page-heading"><p className="eyebrow">Atelier correspondence</p><h1>Contact</h1><p>Try a sample inquiry about materials, dimensions or demo orders. The demo validates your inquiry without sending a message.</p></header>
      <ContactForm />
    </div>
    <figure><Image src="/images/editorial/vestibule.webp" alt="Bronze stair and amber oculus at the house entrance" fill loading="eager" sizes="(max-width: 800px) 100vw, 48vw" /></figure>
  </section>;
}
