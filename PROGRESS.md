# Progress / handoff
Updated: 2026-11-25. Status: PHASE 2 VERIFIED LOCALLY. PREVIEW RUNNING. PUBLIC RELEASE DEFERRED.
- Completed: working brand name screening, requirements, stack plan, design and motion storyboard, security, data/API contracts, QA, deployment and folder placeholders.
- Foundation: inspected nested root (no Git metadata), installed the pinned stack and npm lockfile, added strict TypeScript, security headers, Prisma schema and SQL migration. Node 24.15.0, npm 11.14.1, PostgreSQL 17.10, Next 16.4.6, React 19.3.1, Prisma 7.10.1, Auth.js 4.24.15 and R3F 9.8.2.
- Verified `npm install`, `prisma generate`, `npm run db:migrate` and `npm run db:seed` (exit 0); direct SQL verified 16 products. PostgreSQL cluster and random credentials are local and ignored. The Windows sandbox could not initialize the PostgreSQL cluster or start tsx; the approved normal Windows account resolved both. Initial typecheck found the overloaded scrypt type issue; switched to an explicitly typed callback and will rerun.
- Next: verify admin authorization, order idempotency and concurrency on isolated PostgreSQL, then complete the visual and browser gates.

## Commerce checkpoint

- Added database-driven catalog, product details, stock-aware quote, guest session and unguessable confirmation, idempotent transactional orders, stock movements and restricted Auth.js administration service/API. Storefront cart, checkout and wishlist use persisted browser state and revalidate on the server.
- Isolated migration and `npm run test:integration` passed (4 cases), covering current price, inactive variants, duplicate concurrent keys, competing stock, ownership, admin stock audit, and order transition rules. `npm run test` passed the first 3 contract cases. Browser-level admin and CSRF coverage pending.

## Storefront and motion checkpoint

- Replaced the scaffold with the Nocturne editorial, local generated posters and catalog art, self-hosted fonts, responsive collection layout, product galleries, cart drawer and parchment checkout. Added the opt-in GSAP scroll study with actual Three.js sofa/vase meshes and poster fallback. Mobile and reduced-motion paths skip mounting the canvas.
- Recorded 18 original WebP images, stylized geometry, the brand mark and both SIL OFL fonts in [docs/ASSET_REGISTER.csv](docs/ASSET_REGISTER.csv). Desktop and mobile hero and all 16 catalog crops were reviewed in Edge or as local image files. The two editorial WebP files are 93,578 and 52,170 bytes. Repeat seeding returned 16 products and 18 product-image records.
- The first production build passed. The first complete browser run passed the responsive/axe, WebGL reverse/context-loss and unavailable-WebGL cases. The commerce case reached non-admin denial and exposed a test locator conflict with Next.js's route announcer. Scoped the assertion to the actual error message and reran the gate.
- Added the P0 editorial pages, demo contact, metadata and private admin/catalog controls. Pinned patched transitive Effect and Vitest versions after audit findings. Full `npm audit` then found zero known vulnerabilities. PostgreSQL tests still log an upstream pg 9 deprecation from Prisma 7's transaction adapter on pg 8.23.1.

## MVP verification before Phase 2

| Command | Observed result |
|---|---|
| `npm run lint` | Exit 0 with no diagnostics |
| `npm run typecheck` | Exit 0 |
| `npm run test` | Exit 0, 4 unit cases |
| `npm run test:integration` | Exit 0, 4 cases against migrated PostgreSQL 17.10 |
| `npm run build` | Exit 0, production bundle and type checking |
| `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run test:e2e` | Exit 0, 4 browser cases against the production build and isolated database |
| `npm audit` | Exit 0, zero known vulnerabilities reported |
| `npm run db:admin` | Exit 0 with a randomly generated disposable administrator that was verified and removed |

- The browser suite verified the full order journey, variant selection, quote retry after a simulated connection failure, reload persistence, confirmation ownership, cross-origin denial, admin authentication and non-admin denial, authorized order updates, and an audited stock adjustment.
- Edge checks passed at 360, 390, 768, 1024 and 1440 pixels. The suite passed keyboard focus checks, mobile filter dialog navigation, axe WCAG 2 A/AA-tagged scans on home, shop and checkout, forward/reverse WebGL animation, responsive canvas teardown and remount, WebGL context loss, reduced motion and disabled WebGL.
- A production-server smoke run with an unreachable PostgreSQL endpoint returned the homepage with an editorial fallback and a sanitized 503 from the catalog API.
- The first desktop lab pass traced CLS of about 0.265 to the route-level loading screen. The homepage now streams featured products below the immediately rendered hero with reserved card space. The WebGL remount path also holds the poster until the new canvas is ready.
- Final local Edge lab, three fresh browser contexts per profile, production build and one local PostgreSQL instance. Desktop at 1440 × 900 had median LCP 140 ms, first cold-server LCP 464 ms, and CLS 0.00255. Simulated mobile at 390 × 844, 4× CPU slowdown, 150 ms latency and 1.6 Mb/s downstream, had median LCP 972 ms and CLS 0.00092. The 3D canvas was absent on every initial load. This run measured lab LCP and CLS. Field metrics, INP, Lighthouse, a second browser engine and physical-device performance remain unmeasured.
- Final evidence is in [docs/PORTFOLIO.md](docs/PORTFOLIO.md#local-portfolio-captures). The [asset register](docs/ASSET_REGISTER.csv) and [art generation prompts](docs/ASSETS.md#original-artwork-production) document provenance. Alternate finishes use lead-finish illustrations with an on-page disclosure. The canvas uses original stylized geometry.
- Initialized local Git on `main`. Verified Git ignores local credentials, DB files, caches, generated files and test artifacts. No commits or remotes were created. The GitHub Actions workflow is defined locally and has had no hosted run.

## Continue from here

- From the nested repository run `npm run dev`, then open `http://127.0.0.1:3000`. The workspace-local PostgreSQL cluster uses port 55438 and completed development and test migrations. If it is stopped, restart from the repository with `& 'C:/Program Files/PostgreSQL/17/bin/pg_ctl.exe' -D "$PWD/.local-db/data" -l "$PWD/.local-db/server.log" -o '-p 55438 -h 127.0.0.1' -w start`. Use [README.md](README.md) for private admin provisioning and portable setup.
- For a fresh acceptance run, execute `npm run build`, then set `PLAYWRIGHT_CHANNEL=msedge` and run `npm run test:e2e`. Set `PORTFOLIO_SCREENSHOTS=1` to recreate captures under `test-results/portfolio/`.
- Hosted release requires authorization, a separate demo database, HTTPS, public write and retention configuration, and live smoke verification. Customer accounts, synchronized wishlists, Stripe sandbox, managed coupons, reporting, additional scenes and final product-specific 3D assets are deferred.

## Phase 2 recovery and implementation

- The pre-redesign MVP is recoverable at Git commit `e5dda88`. The Phase 2 redesign is saved in the working tree. Development and PostgreSQL previews use ports 3000 and 55438.
- Supported desktop devices open the four-chapter Nocturne film in WebGL by default. GSAP drives the sofa rotation, vessel movement, chandelier and changing light, then dissolves into the salon editorial. The smaller-screen, reduced-motion and WebGL fallback paths use still chapters. The redesigned catalog, product, saved, cart, checkout, confirmation, about and contact pages use the existing commerce services, schema and authorization.
- Three adapted CC0 Poly Haven GLBs and a local HDR are registered with their authors and sources. The live assets interpret the fictional catalog designs. The salon and illumination artwork and asset prompts are documented in [ASSETS.md](docs/ASSETS.md#phase-2-film-assets). The five required viewport sizes, film chapters and shopping views are archived in the [Phase 2 capture index](docs/PORTFOLIO.md#phase-2-browser-captures).
- Before the pause, lint, typecheck, build, 5 unit and 4 PostgreSQL integration tests passed. One Edge run passed all 5 cases. A later run selected Merlot during the Emerald purchase and passed 4 of 5 cases. Fixture teardown also failed because it only deleted orders for one finish. The trace was recovered to `.local-db/phase2-prior-commerce-trace.zip`. It shows the wishlist check returned without a click while the rendered SKU and submitted order remained Merlot.
- On resumption, isolated the product and wishlist radio groups by component instance and gated purchase controls on persisted bag hydration. The E2E test now verifies the initial wishlist finish and selected SKU before adding to bag. Its teardown tracks order dependencies across every fixture variant. The identified orphan fixture was removed from the isolated test database.
- The pre-pause local production lab recorded median LCP 448 ms desktop and 1,352 ms simulated mobile across three runs per profile after reserving the loading viewport. Corresponding CLS was approximately 0.000028 and 0.000105. These are local lab readings. Field metrics, INP and physical-device metrics remain unmeasured.

### Resumed verification and next steps

| Command or check | Observed result |
|---|---|
| `npm run lint`, `npm run typecheck`, `npm run build` | Exit 0 each |
| `npm run test`, `npm run test:integration` | Exit 0, 5 unit and 4 PostgreSQL integration cases |
| `npm run test:e2e -- --grep 'home to filtered detail' --repeat-each=3` | Exit 0, 3 of 3 with Edge |
| `npm run test:e2e` | Exit 0, all 5 with Edge and the production bundle |
| `node scripts/capture-phase2.mjs docs/screenshots/phase2` against local production | Exit 0, 26 refreshed viewport and route captures on AMD Radeon R7 200 via ANGLE D3D11 |

- Reviewed the film states and layout captures at 1920 × 1080, 1440 × 900, 1280 × 800, 768 × 1024 and 390 × 844. The capture checks passed for visible image decoding, overflow, desktop model downloads and zero model downloads at the two smaller viewports. The first capture run against development stopped on an upstream Prisma/pg deprecation relayed into the browser console by Next.js. The production capture completed without browser rendering errors. The server-side deprecation remains.
- The browser suite verified the selected finish through mobile checkout, private confirmation, authorized order updates and stock history. It also verified keyboard navigation and automated accessibility scans, four film chapters in both scroll directions, context loss, unavailable WebGL and the sample contact form.
- The development server is running at `http://127.0.0.1:3000/`. The homepage returned HTTP 200 and `/api/health` returned `ok`. If the preview stops, run `npm run dev` in the repository. To reproduce screenshots, start a production preview with `npm run start -- --port 3102`, set `$env:VEYRAVELUNE_PREVIEW_URL='http://127.0.0.1:3102'` in a second shell and run the capture command above.
- Phase 2 changes remain in the working tree. Manual art review is the next step. Exact catalog-matching meshes, other browser engines, physical mobile devices and hosted release verification remain open.

## Session log template
Date / commit (if any):
Phase and files changed:
Commands and exit codes:
Tests passed/failed/skipped (actual):
Assets/provenance:
Decisions and deviations:
Blockers:
Next exact action:

## Royal Realm reconstruction — 2026-11-25

Milestone 1 — checkpoint c9ecc11. Examined three reference sites in Edge and the previous homepage at three scroll positions. Added verified CC0 bed, chair and side table, with matching rendered product stills. Camera score and findings are in docs/CREATIVE_REFERENCE_ANALYSIS.md.

Milestones 2–5 — six connected chapters running. First Edge proof revealed a clipped sofa arm, a front-on bed concealing the linen, and a band under the pinned scene. Corrected scale, angle and sticky viewport height. Added editorial collection index, bedroom, material library, shoppable salon and new catalog entries. First full regression passed in Edge (5/5), local unit (5/5) and database (4/4).

### Final verification

- The introductory film uses one demand-rendered R3F canvas, local PBR models, a GSAP ScrollTrigger and six normalized chapter stops. The architectural entrance and final salon are original still compositions. The four intervening product chapters use actual meshes. Rendering reduces pixel density during movement. Bedroom and supplementary gallery models load as their chapters approach. Smaller viewports and reduced motion use static editorial chapters.
- Four new demo products use the existing category, product, image, variant and inventory schema. Direct checks of all six local catalog filters returned 5 seating, 5 tables, 4 lighting, 4 décor, 1 bedroom and 1 dining product. A visual inspection uncovered an outdated category allowlist. The validator now derives it from the shared category data. Production browser checks verified the Alcove bed and Convive dining table in both 390px and 1440px catalog views.
- Final commands all exited 0: npm run lint, npm run typecheck, npm run build, npm run test (6/6), npm run test:integration (4/4), npm run test:e2e with PLAYWRIGHT_CHANNEL=msedge (5/5, 58.1s). Coverage includes private order confirmation, admin updates, stock, saved pieces, mobile checkout, keyboard and axe checks, reversible chapters, resize and WebGL failure. One concurrent lint invocation raced Playwright recreating test-results and failed during directory enumeration. Running lint separately passed.
- The [browser capture index](docs/PORTFOLIO.md#royal-realm-reconstruction) includes all six beats, five viewport sizes, Act II spreads and a sampled animated WebP. The capture script also exercised skip navigation, direct product navigation, back and reload. The production capture completed without unhandled page errors, failed same-origin HTTP responses or detected horizontal overflow. Opening-only LCP ranged from 172 to 2436 ms and CLS from 0.000083 to 0.02385 across single local Edge samples, one per viewport. Both smaller viewports made zero model requests. These observations do not measure field responsiveness or continuous frame rate.
- Gates A–G passed local implementation and visual checks. Gate H passed the purchase, stock, access-control and shopping regressions. Gate I passed Edge desktop, simulated mobile, keyboard, automated accessibility, reduced-motion and fallback checks. Gate J evidence and gate K asset register are present. Final visual and asset-quality acceptance belongs to the user. Physical-device, other browser engine and field testing remain open. The known server-side Prisma/pg concurrent-query deprecation remains.
- The development preview remains at http://127.0.0.1:3000/. Review the entrance, sofa and bedroom first, then use Skip to Collections and open Bedroom or Dining. For a fresh checkout, install the locked dependencies, configure local environment and database as in README, run npm run db:migrate and npm run db:seed, then npm run dev. Reconstruction is saved in the working tree above c9ecc11. No public deployment.

## Final feature and release review — 2026-11-25

Baseline checkpoint 316e4c1 preserves the reviewed Royal Realm. Node 24.15.0, npm 11.14.1 and local PostgreSQL health verified. Baseline passed 6 unit, 4 integration and 5 Edge browser tests. Production samples were recorded before changing model load timing.

Global search now shares the catalog service and shop query URL. The panel supports keyboard focus, recent terms, suggested departments, request cancellation, live pricing and typo-tolerant ranking. Added isolated database fixtures, browser tests and defensive API checks. The first thumbnail assertion ran before decoding completed. The corrected test waits for the actual image to decode. A later populated-input check exposed Escape clearing the field without dismissing the dialog, now handled explicitly. The admin patch schema also applied create defaults to omitted publication flags. The fix preserves private and featured flags on partial edits.

Final regression passed **218/218** with zero failures or skips (6 unit, 26 PostgreSQL, 31 Playwright and 155 release-matrix cases). Lint, typecheck, production build and npm audit completed successfully. The audit returned zero advisories. All eight viewport sizes and four requested browser families ran. No public deployment was performed. The current changes are in the working tree above 316e4c1. Production QA servers were temporary. The normal development preview remains on port 3000.

Opening resource transfer fell 30.5%; the cold film probe still recorded one 701 ms frame interval. Local functional gates passed. Public deployment remains conditional on user approval and target infrastructure; sustained cold-scroll smoothness remains open. Full gate decisions, diagnostic failures, screenshots, performance readings and remaining gaps are in [QA_REPORT.md](docs/QA_REPORT.md) and its linked reports. Next action: review the header search and initial film locally, then apply the documented host prerequisites only after approval.

## Optimization and Vercel handoff — 2026-11-25

- Reproduced the former 700.6 ms interval as 717.3 ms near first sofa visibility on the Radeon R7 200. The original first reveal triggered first-use studio environment and material setup. The optimized build resolves the studio environment with the sofa, prepares materials via Three.js compileAsync ahead of visibility and keeps visited models mounted for reverse traversal. Frame sampling cannot isolate the exact cost of each GPU driver stage.
- Comparable three-context production probes measured a cold maximum of 266.9 ms after the change. First-run p95 moved from 33.3 ms to 16.8 ms. Warm p95 stayed at 16.8 ms. The remaining first-use hitch is recorded in [PERFORMANCE_REPORT.md](docs/PERFORMANCE_REPORT.md).
- Targeted cinematic and fallback tests passed 2/2. Final unit, isolated PostgreSQL, Playwright and production matrix runs passed 6/6, 26/26, 31/31 and 155/155. Lint, typecheck, build and dependency audit exited 0. The first full matrix passed 154/155 after a Firefox navigation collided with the prior client-side transition. Independent browser scenarios now use fresh pages. The repeat passed 155/155.
- Rehearsed deploy migration, repeat seeding with preserved stock, owner provisioning and production startup on a disposable local PostgreSQL 17 database. Verified 11 HTTP 200 endpoints covering search, SEO, auth and assets, plus admin redirect and anonymous API denial. The first scratch seed invocation lacked npm's local binary path; the corrected environment rehearsal passed. The fresh scratch database was removed after verification. [Smoke evidence](docs/evidence/release/deployment-smoke.json).
- Vercel Hobby with Node 24 and Neon Free is the prepared target. The [deployment runbook](docs/DEPLOYMENT.md) specifies pooled runtime and direct migration URLs, auth origin, demo controls and hosted acceptance steps. Public deployment and remote Git setup await owner approval. The local storefront remains at http://127.0.0.1:3000/.

- Recorded a 9.83-second, 960 × 600 WebM from real production browser frames. Verified decoded playback through all six chapters. The original Playwright recording produced blank frames on this machine and was replaced with the verified clip. [Cinematic clip](docs/evidence/release/royal-realm.webm).

## Public GitHub release and live verification — 2026-11-25

- Verified the clean original f67a467 checkpoint. Gitleaks 8.30.1 scanned all four original commits and the public snapshots without finding secrets. The public history preserves the verified app tree under a GitHub no-reply address, keeping the personal author metadata in the original local history. Checked synthetic admin/order images and bundled the two font notices.
- Published https://github.com/MoizAi8/veyravelune-commerce and deployed public commit 009d3d8425906573e6c7bcf9c7dfc16312370a2f to https://veyravelune-commerce.vercel.app/ in browse mode. Vercel Hobby Node 24.x ran npm ci and npm run build in iad1. The production alias and recorded source SHA were verified.
- Provisioned Neon Free in the same region. Migration status current. Two seeds preserved stock for 22 active variants across 20 products and six categories. Verified both direct migration and pooled runtime connectivity.
- Passed eight groups of public hosted checks and private owner authentication. The protected Vercel candidate passed one hosted synthetic checkout, an idempotent retry, owner-only confirmation and inventory movement verification. Restored stock and removed only that fixture. Public order creation remained disabled before and after the check.
- See [Hosted release evidence](docs/HOSTED_RELEASE.md) for screenshots and redacted results. The public domain stays in browse mode until stock replenishment or isolation protects shared demo inventory.
