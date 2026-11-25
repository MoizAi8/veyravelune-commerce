# Non-negotiable Do's & Don'ts
| Do | Do not |
|---|---|
| Design an original editorial experience: sculptural objects, asymmetric composition, disciplined whitespace, consistent art direction | Use generic SaaS card grids on the homepage, rainbow gradients, gold on every surface, stock dashboard aesthetics or clone another brand |
| Make each motion sequence meaningful and reversible with scroll; use one timeline owner per property | Scroll-jack, trap keyboard users, stack conflicting animation libraries or force a long intro |
| Provide a static hero before WebGL; allow skip and reduced motion | Block the store on model downloads, run canvases offscreen or hide essential copy in canvas |
| Keep products visually accurate across gallery, model and variant | Represent a generic model as the exact product or use broken image links |
| Use original or licensed assets; document credits and redistribution permission | Scrape competitor images, hotlink unreliable URLs, publish unlicensed GLBs/fonts |
| Use semantic landmarks, focus management, visible labels, keyboard support and contrast | Disable zoom, hide focus, make hover the only interaction, place text over unreadable scenes |
| Build every visible CTA with a real destination or meaningful action | Leave dead controls, href=# placeholders, fake success toasts, lorem ipsum, fake reviews or counters |
| Persist products, variants, inventory and orders in PostgreSQL; use transaction-safe stock updates | Trust prices or admin roles sent by the browser, oversell stock, silently simulate persistence |
| Validate and authorize all server mutations; use least privilege and rate limiting where needed | Expose secrets, raw DB errors, private orders, unrestricted admin writes or demo admin passwords publicly |
| Clearly label simulated payment and fulfillment; use test-only provider keys if enabled | Accept real card numbers yourself, switch to live payment, mark a redirect as payment proof |
| Reuse components, strict TS, semantic naming, clean module boundaries | Use any indiscriminately, ts-ignore, duplicate business logic, premature microservices or dependency bloat |
| Pin verified compatible versions and commit lockfile when permitted | Install with --force/--legacy-peer-deps to hide conflicts; invent versions |
| Test on mobile, keyboard, reduced motion, no WebGL, slow network, DB errors | Claim 60fps, 100 tests, accessibility compliance or production readiness without evidence |
| Preserve existing working code and record decisions in PROGRESS | Rebuild unrelated pages, delete user work, perform destructive git commands or expose credentials |
| Finish core journey before optional features | Spend the entire day on a shader while checkout fails, or promise unsupported features |
