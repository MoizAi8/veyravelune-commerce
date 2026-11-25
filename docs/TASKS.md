# Phased delivery checklist
Target P0 in 8–12 focused hours if tooling/assets cooperate; full P1 may need several extra days. Timeboxes are guidance, not commitments. Keep buildable checkpoints.

## Phase 0 — foundation (45–60 min)
- [ ] Inspect folder, runtime and compatibility; scaffold Next, install required packages only; configure lint/type/test scripts.
- [ ] Database connection, schema migration, deterministic seed; establish auth/admin authorization path.
- [ ] Baseline build and test scripts; record exact versions and commands.
## Phase 1 — real commerce vertical slice (2–3 h)
- [ ] Catalog and detail from DB; cart/wishlist persistence and quote; checkout transaction, confirmation, restricted admin stock/order access.
- [ ] Validate price tampering, stock races, guest ownership, duplicate requests and admin authorization against isolated DB.
## Phase 2 — art direction and 3D (2–3 h)
- [ ] Tokens, original wordmark, header/footer, editorial homepage; acquire/produce licensed sofa/vase assets and record provenance.
- [ ] Poster-first 3D sequence, scroll transitions, mobile/reduced-motion/no-WebGL fallback. Test reverse scroll, resize, context loss.
- [ ] Polish catalog, detail, checkout, loading/error states. No dead controls.
## Phase 3 — remaining P0 (1–2 h)
- [ ] Search/filter/sort, wishlist, admin product CRUD, about/contact/demo policy, metadata, responsive QA.
- [ ] Verify public demo protection; remove unavailable features from UI.
## Phase 4 — verification and handoff (1.5–2 h)
- [ ] Run lint, typecheck, unit, integration, E2E, build, accessibility and performance checks; capture actual results.
- [ ] Document deployment/env/migrations, portfolio screenshots, feature status; deploy only with permission and credentials. Recheck live purchase path if deployed.
## Phase 5 — optional P1
- [ ] Customer accounts/history; coupons, dashboard, compare/quick view, richer scenes, Stripe test-only. Implement individually only after P0 gates pass.

If behind schedule: keep real checkout and core sofa/vase experience; cut optional scenes, accounts, Stripe, comparison, analytics and secondary embellishments before compromising security or accessibility. If assets unavailable, report stylized/poster fallback explicitly.
