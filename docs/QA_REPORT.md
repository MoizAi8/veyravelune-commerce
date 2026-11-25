# Portfolio release review · 25 November 2026

The local production build serves the reviewed Royal Realm and the new global search. The final regression set passed 218 of 218 automated cases. The local storefront is ready for portfolio review. The public deployment is verified in browse mode. [Hosted release evidence](HOSTED_RELEASE.md)

| Gate | Result | Scope of evidence |
|---|---|---|
| Global search | PASS | Header dialog, thumbnails, focus, Escape, history, errors, retry and bookmarkable shop results |
| Search relevance and database accuracy | PASS | Isolated fixtures and all 20 seeded products. Exact titles precede description-only matches |
| Storefront functionality | PASS | Public pages, six category filters, product routes, real prices and images |
| Existing cinematic animations | PASS | Six chapter controls, forward and reverse traversal, jumps, reload and release to collections |
| Existing 3D rendering | PASS | Six real meshes, local PBR assets and hardware Edge rendering. Entrance and final salon are photographic plates |
| Responsive design | PASS | Eight specified desktop/tablet/phone viewport sizes. Touch emulation on smaller screens |
| Cart and wishlist | PASS | Variant selection, saved items, hydration, persistence and navigation |
| Demo checkout | PASS | Server-calculated totals, order creation and private confirmation |
| Inventory consistency | PASS | Isolated parallel orders, idempotency, insufficient stock and movement audit |
| Administrative functionality | PASS | Authorized sign-in, product, order and stock workflows, partial update regression |
| Backend and API reliability | PASS | Valid and invalid requests, status codes, rate-limit implementation review, database integration and health |
| Security | PASS | Scoped local defensive checks and dependency audit. Hosting controls require separate validation |
| Accessibility | PASS | Keyboard, native modal, focus return, reduced motion, nine page scans and a search-dialog axe scan |
| Performance | FAIL for consistent cold-scroll smoothness | Opening transfer decreased 30.5%. Material preparation reduced the observed worst first-traversal interval from 717.3 ms to 266.9 ms. Warm replay p95 was 16.8 ms |
| Production build | PASS | Build, startup, database health and local production browser checks |
| Deployment readiness | PASS for browse-mode portfolio release | Vercel production, Neon migration, repeat seed and public smoke verified. Public order creation is disabled |

## Findings and resolutions

| Severity | Finding | Resolution |
|---|---|---|
| High | The admin partial-update schema supplied create defaults for omitted publication flags. Editing an unpublished product could republish it, or remove its featured status | Separated optional patch flags from create defaults, including variant activation. Verified an edit preserves an unpublished featured product in PostgreSQL |
| Medium | Existing shop search omitted finishes and categories and offered no global entry point | Shared catalog ranking now covers title, description, material, active finishes and department names. Both the live panel and shop use this ranking |
| Medium | Escape in a populated search field could clear the text while leaving the panel open | Handle Escape in the dialog and explicitly restore focus to the trigger. Verified at all eight sizes |
| Medium | Opening fetched the vase and chandelier before their scenes | Moved requests to preceding chapters. Verified all three original GLB requests at the relevant milestones |
| Low | Material filters could list the material of an active product with no public variant | Use the same active-variant eligibility rule for filter options |
| Low | Page-specific canonical links and social preview artwork were absent | Added metadata base, relative canonical and Open Graph defaults. Verified product canonical paths and rendered Open Graph tags |
| Low, open | Prisma's pg adapter can emit a concurrent-query deprecation warning | Traced through the adapter and Prisma query interpreter. Record for a compatible dependency update before pg 9 |
| Medium, open | Long first-use frame on the older test GPU | Prepared against the final environment before revealing objects. A smaller first-use hitch remains. Field data, GPU timers and additional hardware remain outstanding |

## Visual review

Inspected actual Edge captures of the bronze entrance, rotating sofa, vessel, bed, lighting gallery and salon. The objects remained visible against the existing lighting and chapter typography. Inspected the search panel at desktop and phone sizes, including product photographs, pricing and the close control. The eight viewport checks also measured panel and document overflow. Search, fallback and navigation smoke tests ran with Chromium, Edge, Firefox and WebKit.

[Desktop search](evidence/release/search-1440.webp) · [Phone search](evidence/release/search-360.webp) · [Sofa](evidence/release/chapter-sofa.webp) · [Bedroom](evidence/release/chapter-bed.webp) · [All evidence](evidence/release/) · [Test results](TEST_RESULTS.md) · [Performance](PERFORMANCE_REPORT.md) · [Security](SECURITY_AUDIT.md) · [Limitations](KNOWN_LIMITATIONS.md)
