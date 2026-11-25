# Art direction — Royal fantasy, modern restraint
Brand: VEYRAVELUNE. Tagline: Objects worthy of a realm. Mood: a moonlit royal atelier, antique brass, velvet, sculptural silhouettes, theatrical shadows and luminous highlights. Not medieval cosplay or a generic black/gold template. Design original typography-led compositions and realistic product scale.

## Tokens
| Token | Hex | Usage |
|---|---|---|
| obsidian | #0B0D10 | Main dark background |
| midnight | #14181C | Elevated surface |
| parchment | #F4EBDD | Light editorial canvas / text on dark |
| champagne | #D6B678 | Primary accent / dark CTA text background |
| antique brass | #927044 | Decorative borders only unless contrast tested |
| emerald | #173C34 | Collection accents |
| oxblood | #592936 | Editorial accents |
| muted text | #B9B2A6 | Secondary dark text |
| ink | #201B18 | Text on light |
Use semantic tokens for status, focus, hover and disabled. Verify contrast in context (WCAG AA targets: 4.5:1 body, 3:1 large text and relevant UI). No color-only status.

Typography: Cormorant Garamond or an equivalently licensed high-contrast serif for display; Manrope for UI/body. Use next/font or licensed local subset, fallback fonts. Desktop hero clamp(3rem,8vw,8rem); h2 2–4rem; body 16–18px; metadata 12–14px with adequate contrast. Max paragraph width ~65ch. Use uppercase sparingly, custom wordmark lettering as text initially.

Layout: 12-column desktop grid, 6 tablet, 4 mobile; 8px spacing system; gutters 16/24/48px; max content 1440px; hero full bleed. Product media 4:5 or square, consistent crops; hero 16:9 desktop and portrait mobile. Prefer straight or subtly rounded 4–12px edges, hairline brass borders, no excessive glassmorphism. CTA champagne fill/ink text or outlined dark variant; 44px target where possible. Focus outlines clearly visible.

## Page composition
Home: thin header, visible Shop CTA and bag count; cinematic sequence with overlaid DOM headings; editorial collections with asymmetric imagery; curated products; craftsmanship feature; final CTA and footer. Shop: restrained filter rail, mobile filter sheet, consistent product grid; product detail: large gallery and sticky details only where space allows; cart and checkout: calm parchment surfaces, legible totals, minimal animation. Admin: clean utilitarian dark/light interface, no heavy 3D. Keep demo disclaimer visible at checkout and in footer.

States: loading skeletons with layout reserved, descriptive error/retry, zero results reset action, unavailable variant disabled with explanation, confirmed order only after server success. Avoid fabricated customer testimonials or discount urgency.
