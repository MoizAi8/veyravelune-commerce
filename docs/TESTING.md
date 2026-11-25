# Test and release gates
Use actual assertions, not count-padding. Target meaningful coverage; no fixed test count requirement. Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:integration`, `npm run test:e2e`, `npm run build` after defining scripts. Record exact commands/exit codes/skips in PROGRESS. Integration uses disposable DB with migrated schema; never production. Mock external providers only in unit tests and distinguish from sandbox verification.

| Area | Required cases |
|---|---|
| Unit | currency formatting/integer totals; quantity bounds; shipping/discount rules; Zod malformed input; allowed state transitions; cart merge/persistence; motion progress mapping |
| Integration | seeded product queries, filters/sort/pagination; quote ignores client price; inactive SKU rejects; successful order persists items and inventory movement; insufficient stock rolls back; parallel checkout cannot oversell; duplicate key creates one order; conflicting key rejects; admin role denied; order owner isolation; invalid origin/CSRF; stock adjustment audit |
| E2E | home CTA→catalog→filter→detail→variant→cart→reload→checkout→confirmation; wishlist; empty/error states; admin login and order/stock review with private test user; non-admin blocked; direct route refresh |
| Visual | 360/390, 768, 1024, 1440px; no clipping/overflow, no missing assets, correct object framing, scroll forward/back, no layout shift from canvas, mobile menu and dialogs |
| Accessibility | keyboard nav, skip link, focus return/trap, screen-reader form labels/errors, contrast, reduced motion, axe scan of key pages; automated pass not full WCAG certification |
| Resilience | no WebGL, context loss, slow/offline model loading, JS errors, DB unavailable, duplicate clicks, network failure, refresh mid-flow |
| Security | no public secrets, no raw DB error, negative/huge quantities, auth bypass, cross-user order access, rate limit/abuse checks, dependency review |
| P1 Stripe | signed invalid/valid event, duplicate event, payment cancel/expire, reservation release exactly once, test sandbox end-to-end; no live mode |

Performance target: LCP <=2.5s, CLS <=0.1, INP <=200ms (field targets; lab proxy only when no field data); mobile Lighthouse performance >=80, desktop >=90 as stretch targets, accessibility >=95 automated. Record environment/network/device and measured values; no invented scores. Hero animation target smooth 30–60fps on tested capable hardware, not guaranteed; fall back on weak GPU. No critical console errors in verified flows. Test Chrome and at least one additional browser where available; note physical device tests not performed if absent.

Release: P0 journey passes, access and stock tests pass, fallback works, asset licenses verified, build clean, public demo safeguards configured. Otherwise mark NO-GO or private-only with blockers. Record screenshots and evidence, not just checkmarks.
