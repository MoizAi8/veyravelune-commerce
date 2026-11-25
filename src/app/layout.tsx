import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VEYRAVELUNE_PORTFOLIO_ORIGIN || "http://127.0.0.1:3000"),
  alternates: { canonical: "./" },
  openGraph: { siteName: "VEYRAVELUNE", type: "website", images: [{url:"/images/editorial/vestibule.webp",alt:"The Royal Realm entrance hall"}] },
  title: { default: "VEYRAVELUNE — Objects worthy of a realm", template: "%s | VEYRAVELUNE" },
  description: "A fictional interiors atelier for sculptural seating, lighting, tables and objects.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
