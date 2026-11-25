# Final stack and compatibility policy
Use a modular full-stack TypeScript monolith; strong capabilities without unnecessary services. Select stable compatible patch versions during scaffold and record exact versions in PROGRESS and package-lock.json. Do not assume latest packages interoperate.

| Layer | Selected technology | Purpose / constraint |
|---|---|---|
| Runtime | Node.js 24 LTS, npm | Verify supported versions on host and CI; Node 22 LTS fallback if required by dependency matrix |
| Web | Next.js 16.x App Router + React 19 + strict TypeScript | SSR storefront, RSC, route handlers, admin; use stable supported patch |
| Styling | Tailwind CSS 4 + CSS variables + CSS modules where needed | Bespoke editorial system |
| Primitives | Radix UI / shadcn components selectively, Lucide | Accessible dialogs, menus, forms; no stock theme |
| 3D | Three.js + @react-three/fiber 9.x + compatible @react-three/drei | React 19 compatible renderer, glTF models, PBR lighting |
| Motion | GSAP 3 + ScrollTrigger + @gsap/react; Motion for UI | GSAP owns cinematic timeline; Motion owns separate UI elements |
| Forms | React Hook Form + Zod | Client usability, independent server validation |
| State | Zustand | Local cart/wishlist state only; server owns prices and inventory |
| Database | PostgreSQL 16+ (local Docker optional, hosted Neon or equivalent) | Durable commerce data |
| ORM | Prisma ORM 7.x + @prisma/adapter-pg + pg, compatible generated client | Pin mutually compatible 7.x packages; use documented Prisma config/migrations |
| Auth | Auth.js / next-auth compatible with chosen Next version | Server sessions, admin RBAC; use supported version and validate auth integration before proceeding; no improvised insecure fallback |
| Payments | Local demo checkout P0; Stripe hosted Checkout sandbox P1 | No live payments, no card data stored |
| Search | PostgreSQL query filters / indexes | No external search service required |
| Analytics | Admin DB aggregates + Recharts P1 | Real seeded/order data, no fake metrics |
| Assets | next/image, local WebP/AVIF, GLB with Meshopt/Draco/KTX2 only where justified | Poster-first, verified license |
| Quality | ESLint, Prettier, Vitest, Testing Library, Playwright, axe-core | Type check, unit/integration/browser/a11y |
| Delivery | GitHub Actions + Vercel + managed PostgreSQL | Verify provider terms, region, quotas and config; no guaranteed free hosting |

Avoid Redis, Celery, separate FastAPI/Nest services, Kubernetes and multiple package managers for this deadline. Optional email, object storage and rate-limit providers only if required and configured; otherwise keep disabled visibly. A separate backend is not required to implement genuine server-side business logic.

Official verification links: https://nextjs.org/docs/app ; https://r3f.docs.pmnd.rs/getting-started/installation ; https://gsap.com/docs/v3/Plugins/ScrollTrigger/ ; https://docs.prisma.io/docs/guides/v7/frameworks/nextjs ; https://authjs.dev/ ; https://docs.stripe.com/testing . Check chosen versions before installation.
