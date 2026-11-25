# Hosted portfolio release

Verified on 25 November 2026. The public Vercel deployment is READY in browse mode. [Live storefront](https://veyravelune-commerce.vercel.app/) · [Public repository](https://github.com/MoizAi8/veyravelune-commerce)

| Item | Verified result |
|---|---|
| Deployed source | [009d3d8425906573e6c7bcf9c7dfc16312370a2f](https://github.com/MoizAi8/veyravelune-commerce/commit/009d3d8425906573e6c7bcf9c7dfc16312370a2f). Vercel metadata and the production alias identify this build. |
| Hosting | Vercel Hobby in iad1, Next.js preset, Node 24.x, `npm ci`, `npm run build` |
| Source audit | Gitleaks 8.30.1 scanned all four original commits without finding secrets. The public history starts with the verified application tree and a GitHub no-reply address because the local history contains personal commit metadata. Commerce screenshots were checked for synthetic fixture data. |
| Assets | Local CC0 models, original editorial images and the two font license notices were checked. Both notices resolve on the live site. [Asset register](ASSET_REGISTER.csv) |
| Database | Neon Free in iad1. Prisma migration current. Repeat seed preserved stock for all 22 variants across 20 products and six categories. Live health returned HTTP 200. |
| Visitor access | Public HTTPS storefront, catalog, search, wishlist and cart quotes. The public order endpoint returns `503 DEMO_UNAVAILABLE`. |
| Private admin | Owner provisioned. Hosted sign-in, authorized private API access, secure session attributes and sign-out verified. |
| Protected checkout | A separate unpromoted Vercel candidate required Vercel SSO. One synthetic order verified database pricing, idempotency, owner-only receipt, inventory decrement and movement. The fixture was removed and stock was restored. |

## Hosted browser verification

All eight groups passed on the public production URL. Desktop Edge exercised the six chapters in both scroll directions, real WebGL, the local meshes and textures, and skip navigation. Checked typo-tolerant search, catalog and product navigation, image optimization, persistent wishlist, cart quotes, SEO, auth protections and HTTPS redirection. A 390 px touch-emulated viewport verified the still fallback, search and layout. The instrumented desktop navigation logged zero console errors or unsuccessful same-origin assets.

[Public browser evidence](evidence/release/hosted-smoke.json) · [Database evidence](evidence/release/hosted-database.json) · [Private admin evidence](evidence/release/hosted-authentication.json) · [Protected checkout evidence](evidence/release/hosted-checkout.json)

[Live arrival](evidence/release/hosted-arrival.webp) · [Live sofa](evidence/release/hosted-sofa.webp) · [Live bedroom](evidence/release/hosted-sanctuary.webp) · [Desktop search](evidence/release/hosted-search.webp) · [Mobile search](evidence/release/hosted-mobile-search.webp) · [Cinematic clip from the verified local build](evidence/release/royal-realm.webm)

## Release boundary

The portfolio shows a working catalog and simulated commerce in a controlled environment. Public checkout requires replenished or isolated inventory before it can be enabled. Neon Free can scale to zero after five idle minutes, so the database may need to wake on an initial request. Mobile coverage is browser emulation. Commercial payments, fulfillment, production recovery drills and commercial load verification remain outside this release. [Deployment runbook](DEPLOYMENT.md) · [Known limitations](KNOWN_LIMITATIONS.md)
