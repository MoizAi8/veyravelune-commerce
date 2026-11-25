# Deploy a portfolio demo on Vercel and Neon

The public release runs in browse mode on Vercel Hobby with a dedicated Neon Free database. The deployment used a clean checkout of the audited public GitHub commit. [Live site](https://veyravelune-commerce.vercel.app/) · [Hosted release evidence](HOSTED_RELEASE.md)

Use Vercel Hobby for a personal, non-commercial portfolio and Neon Free for its disposable demo database. Choose a Neon compute region near the Vercel Functions region. Check both providers' plan limits and scale-to-zero behavior before enabling demo traffic. [Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) · [Neon plans](https://neon.com/docs/introduction/plans) · [Neon Prisma guide](https://neon.com/docs/guides/prisma)

## Environment

Set values through Vercel's environment settings or a trusted operator shell. GitHub, logs and screenshots should contain variable names only. Assign separate credentials and databases to production and any preview that needs data. [Vercel environment scopes](https://vercel.com/docs/environment-variables/managing-environment-variables)

| Variable | Scope and value |
|---|---|
| `DATABASE_URL` | Vercel server runtime. Use the Neon **pooled** PostgreSQL URL with TLS parameters copied from the Connect dialog. Keep the generated hostname, database name, role and SSL options. |
| `DIRECT_DATABASE_URL` | Trusted migration shell. Use the Neon **direct** URL. The Prisma config prefers it for migrations. |
| `AUTH_URL` | Exact HTTPS origin of the deployment, without a trailing path. The app maps this value to NextAuth v4's `NEXTAUTH_URL` when the latter is unset. If both are set, use the same origin. |
| `AUTH_SECRET` | Dedicated random server secret, at least 32 characters. Use a different secret for preview and production. |
| `COMMERCE_MODE` | Use `demo` for approved simulated checkout. Use `browse` to disable order creation while commissioning the site. |
| `VEYRAVELUNE_PORTFOLIO_ORIGIN` | Once approved, use the exact production HTTPS origin for SEO metadata, sitemap and the server's write allowlist. Leaving it empty blocks hosted writes and instructs robots to stay out. With it configured, same-origin quote/contact and authorized admin writes are available even in browse mode. |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | Provisioning shell only. Generate a unique password of 16–128 characters and remove both values from the shell after provisioning. |
| `TEST_DATABASE_URL` | Isolated local/CI database only. The name must end in `_test`. |

No OAuth or payment provider is required. Provision the administrator through the existing credentials flow. Demo checkout supports fictional destinations and creates simulated orders. Admin pages and order confirmation remain private.

## Deployment sequence

1. After owner approval, push the verified checkpoint to a GitHub repository and import it into Vercel. Use the **Next.js** preset, **Node 24.x**, `npm ci` for install and `npm run build` for build. Point the Vercel root at this application folder. Keep Next.js server rendering enabled.
2. Create an empty Neon project dedicated to the demo and copy its pooled/direct URLs. In a trusted shell set `DATABASE_URL` and `DIRECT_DATABASE_URL` to the new database. Existing shell variables take precedence over local dotenv files. Double-check that both URLs point to the intended hosted demo database before running:

   ```sh
   npm ci
   npx prisma generate
   npm run db:migrate
   npx prisma migrate status
   npm run db:seed
   ```

   Migration applies the checked-in schema. Seeding inserts missing demo entries without resetting existing stock or orders. Use the direct URL for seed or admin provisioning by setting the shell's `DATABASE_URL` to the direct URL if the pooled connection is unsuitable for those jobs. Keep migrations and seeding out of the Vercel build.
3. Set the Vercel environment values above and create an approved deployment. Start in browse mode. Check `/api/health`, `/shop?q=regetn`, a product detail, the image endpoint, a GLB request, the six film chapters and phone fallback, `/api/auth/providers`, and anonymous admin denial. Confirm the canonical URL, `robots.txt` and sitemap agree with the intended release origin.
4. Provision the private owner with `npm run db:admin`. Verify demo orders on a gated candidate with the public domain still in browse mode. Vercel Standard Protection restricts generated deployment URLs. A candidate built with `--prod --skip-domain` must show a Vercel sign-in challenge to an anonymous request before any order is placed. Keep public checkout disabled until shared demo stock has a replenishment or isolation mechanism. Confirm the HTTPS guest cookie carries Secure, HttpOnly and SameSite attributes.
5. Record the deployment URL and commit, migration status, smoke results and restore procedure. Keep a previous Vercel deployment available for application rollback. Verify database recovery separately and keep schema changes forward-compatible.

[Local fresh-database smoke evidence](evidence/release/deployment-smoke.json) · [Release gates](QA_REPORT.md)
