# API and service contracts
Use JSON error envelope `{error:{code,message,fieldErrors?}}`, appropriate status codes, safe messages. Validate inputs with Zod, cap quantities and pagination. Return only needed fields. Server components may call the same services directly.

| Method / route | Access | Contract |
|---|---|---|
| GET /api/products | public | q, category, material, min/max, sort, page; returns items/total; allowlisted sort |
| GET /api/products/[slug] | public | active product, images, variants, related |
| POST /api/cart/quote | public session | items [{variantId,quantity}], optional coupon; returns server totals and availability |
| POST /api/orders | guest/customer session | demo shipping + items + idempotency key; returns order reference and safe confirmation data; 409 stale stock |
| GET /api/orders/[reference] | owner only | safe order summary; 404 for inaccessible refs |
| GET /api/admin/products | admin | paginated including inactive |
| POST /api/admin/products | admin | validated product/variants |
| PATCH /api/admin/products/[id] | admin | validated changes; disable not hard-delete if referenced |
| POST /api/admin/inventory | admin | variantId, delta, reason; atomic movement |
| GET /api/admin/orders | admin | paginated list |
| PATCH /api/admin/orders/[id] | admin | allowed state transitions only; demo cannot become real paid |
| GET /api/health | public | minimal status, no secrets/DB internals |
| POST /api/checkout/stripe (P1) | session | test-only hosted session, reservation |
| POST /api/webhooks/stripe (P1) | signed provider | raw body signature verification, dedupe, reconcile state |

Checkout revalidates stock/prices even after quote. Demo shipping $0 or fixed disclosed amount; demo tax explicitly $0, not tax advice. Demo confirmation payment status DEMO_CONFIRMED, not PAID. Use request origin/CSRF controls for cookie-authenticated mutations. No GET writes. Admin role checked in each handler/service, not only middleware.
