# VEYRAVELUNE — repository operating instructions
This repository starts as a planning pack, not an implemented app. Read START_HERE.md, DOs_AND_DONTs.md, docs/PRD.md, docs/STACK.md, docs/DESIGN_SYSTEM.md, docs/MOTION_STORYBOARD.md, docs/ARCHITECTURE.md, docs/SECURITY.md, docs/TESTING.md and docs/TASKS.md before editing. Read PROGRESS.md at every session start. Refer to the other docs as needed; do not paste all documents into every response.

## Mission
Build an original, cinematic, royal-fantasy furniture storefront with a real database-backed shopping lifecycle and a restricted administration interface. Portfolio demonstration only; no live charges or real fulfillment. Design fidelity and functional truth outrank feature count. Target one working day for P0, P1 only after gates pass; do not claim the full scope is possible in eight hours.

## Workflow
1. Inspect files, git status, installed Node/npm and official package compatibility. Preserve all planning docs. Initialize Next.js in a temporary sibling if the CLI rejects the nonempty root; merge generated application files without overwriting docs. Never delete user files or .git. Ask only for genuinely required credentials or destructive actions.
2. Implement phases in docs/TASKS.md; keep work in small coherent changes. Establish build and database first, then one vertical purchase flow, then cinematic storefront and polish. Run targeted tests at each phase and final gates. Commit only if user permits or requests commits; never push or deploy to external services without authorization.
3. Record changes, commands, real exit codes, failed/skipped tests, asset provenance and next steps in PROGRESS.md. Mark a feature DONE only with evidence. If time or model quota runs short, leave the app buildable and explicitly defer P1/P2. Do not silently replace real features with mocks.
4. Use strict TS, server-only secrets, schema-validated inputs and server-authoritative prices/stock. Keep server components default; isolate client animation islands. No unsafe type escapes or disabling lint/tests to pass. No hidden admin bypass.
5. Follow asset, motion, accessibility and performance budgets. Never fabricate product photography licenses, payment receipts, reviews, Lighthouse scores or deployment links. No copied brand layouts. Clearly label synthetic/demo content.
6. End each session with compact summary: implemented, evidence, unresolved blockers, exact continuation command. Do not repeatedly regenerate completed sections.

## Priority and conflict resolution
Security and correctness > accessibility and usable commerce > P0 visual experience > P1 enhancements. Explicit user instructions may change scope but never fake evidence. Keep docs synchronized if decisions change. DOs_AND_DONTs.md contains detailed project standards.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
