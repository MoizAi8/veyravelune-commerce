# Start here — VEYRAVELUNE
A documentation-only development kit, created 25 November 2026. No application, dependencies, database, 3D assets or deployments are installed yet.

## Windows / Codex
1. Extract ZIP. Open the **veyravelune-commerce** directory itself (the one containing AGENTS.md) in VS Code or as a Codex local workspace. Example PowerShell from the parent folder: `cd .\veyravelune-commerce`; `code .`.
2. Install a supported Node LTS if missing (see STACK), check `node -v`, `npm -v`, `git --version`. Use one npm lockfile. Set up local PostgreSQL or a hosted development database. Do not enter secrets into prompts or commit them.
3. Open Codex in the same folder, start a fresh session, and paste the contents of MASTER_PROMPT.md. Approve appropriate filesystem/dependency operations. Codex should initialize the app and implement in this folder, not create a nested project. The initial folder map contains empty placeholders, not actual routes.
4. Copy `.env.example` to `.env.local` after scaffold and fill only what is needed. Prisma CLI may require explicit environment loading in its config or shell; use one documented mechanism. Never use production data. Run commands Codex verifies for the chosen versions.
5. Review PROGRESS.md after each phase. For a new model/session use CONTINUE_PROMPT.md. Push a private repo first if desired; publish only after checking secrets, licenses and demo safeguards.

## Reading order
AGENTS → DOs_AND_DONTs → PRD → STACK → DESIGN_SYSTEM → MOTION_STORYBOARD → ARCHITECTURE → DATA_MODEL → API_CONTRACT → SECURITY → ASSETS → TASKS → TESTING → DEPLOYMENT → PORTFOLIO.

## Name decision
AUREVIA is already used by furniture/interior sites (https://aureviainteriors.com/ and https://aureviaauthentic.com/). VEYRAVELUNE is a coined working name. Exact public web searches for "Veyravelune", "Veyravelune" furniture website and "veyravelune.com" returned no results on 2026-11-25. This does not establish domain availability, trademark clearance or absence from unindexed sites. Check registrar and relevant trademark registries before commercial use. For now it is a fictional portfolio brand, not an operating store.
