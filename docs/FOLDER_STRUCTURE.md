# Folder structure
The initial ZIP includes empty `.gitkeep` directories. They are not functioning routes. Generate actual page.tsx, route.ts, package.json, tsconfig, Next config and Prisma config during Phase 0. Remove unused optional directories after implementation if desired. Keep root docs intact. Route groups do not change URLs. Do not create duplicate root route pages.

```text
veyravelune-commerce/
  AGENTS.md, DOs_AND_DONTs.md, START_HERE.md, MASTER_PROMPT.md
  CONTINUE_PROMPT.md, PROGRESS.md, README.md, .env.example, .gitignore
  docs/                     specifications, asset register
  src/app/(storefront)/     public pages, product/[slug], order-confirmation/[reference]
  src/app/admin/            restricted administration
  src/app/api/              validated server endpoints
  src/components/           layout, ui, home, three, motion, product, checkout, admin
  src/features/             catalog, cart, orders
  src/server/               services, repositories, auth, DB client (to create)
  src/lib/, src/store/      shared utilities and local state
  prisma/migrations/        schema and seed to create
  public/                   images, models, textures, fonts
  tests/                    unit, integration, e2e
  .github/workflows/        CI to create
```
