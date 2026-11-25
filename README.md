# VEYRAVELUNE

A cinematic furniture storefront for a fictional interiors atelier. The six-chapter Royal Realm pairs architectural photography with live WebGL furniture studies. Guests can browse and search a real PostgreSQL catalog, save pieces, and place simulated orders. The private admin console manages products, variants, stock, and order status.

![The Sovereign Sofa chapter in the Royal Realm](docs/evidence/release/chapter-sofa.webp)

[Live portfolio demo](https://veyravelune-commerce.vercel.app/) · [Short homepage recording](docs/evidence/release/royal-realm.webm) · [Screenshot gallery](docs/PORTFOLIO.md#royal-realm-reconstruction) · [Live search screenshot](docs/evidence/release/search-1440.webp)

## Architecture

| Layer | Implementation |
|---|---|
| Storefront | Next.js App Router, React, TypeScript, responsive layouts, and a keyboard-accessible search panel |
| Film | Three.js, React Three Fiber, Drei, and GSAP. The demand-driven canvas prepares materials before reveal. Smaller screens and reduced-motion users see still chapters |
| Catalog | PostgreSQL and Prisma. The shop and live suggestions share the same search ranking, including title, descriptions, collections, materials, and finishes |
| Commerce | Stock-aware quotes, server-calculated totals, idempotent demo orders, transaction-protected inventory, and owner-scoped order confirmation |
| Admin | NextAuth v4 credentials provider, server-side role checks, and audited stock changes |

The shop supports shareable result URLs such as `/shop?q=regent`. The overlay keeps up to five recent terms in the browser. The cinema uses six local CC0 meshes and original editorial imagery. See the [asset register](docs/ASSET_REGISTER.csv) for sources and licenses.

## Run locally

Install Node.js 24, npm, and PostgreSQL 16 or later. Create a local database and a separate test database whose name ends in `_test`. Copy `.env.example` to `.env.local`. Set `DATABASE_URL`, `TEST_DATABASE_URL`, a random `AUTH_SECRET` of at least 32 characters, `AUTH_URL=http://127.0.0.1:3000`, and `COMMERCE_MODE=demo`.

```sh
npm ci
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [the local storefront](http://127.0.0.1:3000). Seed data contains fictional pieces and can be applied again without resetting changed stock or orders. Use one of the fictional destinations at checkout.

To provision an owner, set `DEMO_ADMIN_EMAIL` and a private `DEMO_ADMIN_PASSWORD` of 16–128 characters in the provisioning shell and run `npm run db:admin`. Remove the provisioning values after use and open [Atelier sign-in](http://127.0.0.1:3000/admin/sign-in).

## Verification

The final regression passed **218 of 218** cases. The release suite covers public catalog data and assets, search, eight viewport sizes, four browser families, the cinema, checkout, inventory, and the private admin flows. See [verified results](docs/TEST_RESULTS.md), [release gates](docs/QA_REPORT.md), and [performance evidence](docs/PERFORMANCE_REPORT.md).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
npm run test:e2e
```

Apply the migration to the isolated test database before running integration and browser tests. Point the migration shell at that database using `DIRECT_DATABASE_URL` or `DATABASE_URL`, then restore those values. The tests read `TEST_DATABASE_URL`. Install Playwright browsers with `npx playwright install chromium firefox webkit`. On Windows, `PLAYWRIGHT_CHANNEL=msedge` selects Edge for the main suite. The seeded catalog matrix runs with `node scripts/verify-release.mjs` against a local production build.

## Deploy and review

[Vercel and Neon deployment runbook](docs/DEPLOYMENT.md) · [Known limitations](docs/KNOWN_LIMITATIONS.md) · [Project handoff](PROGRESS.md)

The live demo runs in browse mode on Vercel Hobby with Neon Free. Visitors can explore the film and catalogue, save pieces, and obtain a cart quote. Public order creation is disabled to protect shared inventory. The initial desktop traversal can still hitch on older graphics hardware. Mobile release checks use emulated touch and viewports. [Hosted verification and screenshots](docs/HOSTED_RELEASE.md)
