# Test results · 25 November 2026

| Final execution | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Vitest unit, npm run test | 6 | 0 | 0 |
| Isolated PostgreSQL integration, npm run test:integration | 26 | 0 | 0 |
| Playwright against isolated production server, npm run test:e2e with PLAYWRIGHT_CHANNEL=msedge | 31 | 0 | 0 |
| Seeded local production matrix, node scripts/verify-release.mjs | 155 | 0 | 0 |
| **Total** | **218** | **0** | **0** |

The optimization checkpoint reran the full suite. The focused film and unavailable-WebGL run also passed 2 of 2. The first post-change matrix passed 154 of 155. Firefox aborted the cart navigation when its page was reused immediately after Next's product transition. The runner now starts each independent browser scenario on a fresh page.

Counts are test cases in the final runs. A case may contain multiple assertions. Earlier runs, manual visual review, measurements, build and audit commands are excluded. The 31 Playwright cases comprise 23 API/validation contracts, three search workflows and five established storefront workflows. The 26 database cases include 22 targeted search cases. Search coverage also includes live catalog and cross-browser checks in the matrix. Tests cover ordinary punctuation, length limits, literal rendering by React, unavailable records and rejected inputs. No offensive testing was performed.

The production matrix recorded 20 product pages, 20 image sets, 30 catalog checks, 8 API validation cases, 4 access checks, 9 axe page scans, 24 viewport checks, 6 film chapters, 9 motion checks, 12 model checks, 12 browser checks and 1 runtime error check. Case names and outcomes are recorded individually. [Machine-readable results](evidence/release/matrix.json)

## Execution history

- Pre-change baseline passed 6 unit, 4 integration and 5 browser tests.
- First targeted search browser run passed 2 of 3. The test sampled thumbnail width before decode. It now waits for successful decode and still checks positive pixel width. The repeat passed all 3.
- First production matrix passed 136 of 153. Nine axe checks required an explicit browser context, and eight assertions selected both the search and bag dialogs. Corrected the harness.
- Second matrix passed 145 of 153 and identified an actual focus-return failure with a populated input. Corrected dismissal. Added reload-at-chapter and traversal pacing checks. Final matrix passed 155 of 155.
- npm run lint, npm run typecheck, npm run build and npm audit each exited 0. Node 24.15.0, npm 11.14.1, local PostgreSQL and Edge were used. Playwright supplied the other three browsers.
- Production snapshots and film pacing are separate evidence. Device sizes are 2560×1440, 1920×1080, 1440×900, 1366×768, 1280×800, 768×1024, 390×844 and 360×640. Mobile devices were emulated. Private confirmation and admin actions used disposable accounts and orders in the isolated test database.

## Reproduction

Run database migrations and seed the local demo per README. Set a separate, migrated TEST_DATABASE_URL ending in _test. Install the browser binaries with `npx playwright install chromium firefox webkit`. Run the four npm verification commands above, integration tests, and the Playwright suite with Edge. After a production build, run `node scripts/verify-release.mjs` against the seeded local data with the public origin unset. The matrix starts and closes a temporary loopback server. The development server can remain on port 3000.
