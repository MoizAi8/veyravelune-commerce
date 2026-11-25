# Product requirements
VEYRAVELUNE — Objects worthy of a realm. Fictional high-end furniture, lighting and decor shop. English, USD, fictional stock; no live fulfillment. Visitors, signed-in shoppers (P1), admin.

## P0 — portfolio release gate
- Home: cinematic sofa/vase story with accessible static fallback; header navigation, collections, editorial features, product cards, footer; clear demo notice.
- Catalog: minimum 16 seeded products across seating, tables, lighting, decor; consistent images, descriptions, dimensions, materials, finish variants, SKU, stock and prices. Search, category/material/price filters, sorting, pagination, empty/error states, URL-backed filters.
- Product detail: gallery, zoom, selected variant price/stock, quantity, add to bag, wishlist, related items. 3D view for hero items only when matching asset exists. Gallery fallback for others.
- Cart/drawer: add/remove/update quantity, reload persistence, stock warnings, server quote, subtotal, demo shipping/tax/discount and total. No false checkout availability.
- Wishlist: local persistence, remove and add to cart.
- Guest checkout: accessible validation, fictional/sample contact/shipping fields, server recalculation, explicit demo confirmation, transactionally persist order and decrement inventory once. No payment/card entry. Confirmation accessible only by owner session/unguessable guest token; use no-store responses.
- Admin: authenticated, authorized product/variant CRUD, stock adjustment, order list and status updates; admin read/write routes protected. Public portfolio may show read-only demo screenshots if admin is not safely provisioned. No public shared write credentials.
- About, contact (validated demo contact with no promised delivery; avoid collecting real PII), delivery/returns/privacy demo notices, 404/error/loading states. SEO metadata, sitemap, accessible responsiveness.

## P1 — after P0 passes
Customer sign-in/account and own order history; synchronized wishlist; comparison; recently viewed; room/collection landing pages; quick view; coupons managed in admin; dashboard aggregates; Stripe sandbox hosted checkout and signed webhook workflow; chandelier and room reveal; richer 3D details. Implement only if time/credentials permit; otherwise do not display unimplemented links. Avoid email or newsletter promises without integration.

## P2 — future, explicitly excluded from launch guarantee
Real payments, tax engine, fulfillment, inventory warehouses, refunds, real newsletter, reviews moderation, multi-currency, AR room placement, CMS, fraud tooling, full search service. These require additional security, provider and legal review.

## Acceptance
A new visitor can find an item, choose a variant, add it, reload, get a server quote, place a clearly simulated order, see a confirmation, and an authorized admin can see the corresponding order and stock change. A second concurrent request cannot oversell. With disabled WebGL or reduced motion, the same journey remains possible. No placeholder buttons or false claims.
