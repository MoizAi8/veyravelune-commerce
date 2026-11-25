# Database model contract (implement in Prisma after version selection)
Use UUID/CUID IDs, UTC timestamps, integer minor-unit money and USD currency. Add foreign keys, indexes, migrations and DB constraints where supported (SQL migration for stock >= 0, qty > 0, price >= 0).

| Entity | Key fields / relations |
|---|---|
| User / Account / Session | Auth.js adapter schema if used; email unique, role CUSTOMER or ADMIN; server-assigned role only |
| Category | slug unique, name, description, image |
| Product | slug unique, title, description, categoryId, material, dimensions, active, featured, timestamps |
| ProductImage | productId, local path or approved URL, alt, sortOrder; optional variantId |
| Variant | productId, SKU unique, finish, priceCents, stock, active; indexes on productId and stock |
| Order | public reference unique, userId nullable, guest session ownership, mode DEMO or STRIPE_TEST, orderStatus, paymentStatus, currency, subtotal/shipping/tax/discount/total cents, minimal demo address data, idempotency scope/key unique, request fingerprint |
| OrderItem | orderId, variantId, SKU/name/finish snapshot, unitPriceCents, quantity, line total |
| InventoryMovement | variantId, orderId nullable, signed delta, reason, actorId nullable, timestamp; audit of stock changes |
| WishlistItem (P1) | userId, productId unique pair |
| Coupon (P1) | code unique, type, amount, validity, active, usage limit with atomic update |
| PaymentEvent / Reservation (P1) | provider event ID unique, checkout/session refs, expiration, status, idempotent release |

Seed at least 16 fictional products with deterministic slugs and 2+ variants for selected products. Seed no known public admin password; local admin provisioned via documented secure environment/setup, never committed. Seed must be idempotent and must not reset live/demo orders or overwrite stock after initial creation. Use isolated test database for destructive tests. No unnecessary PII. Index order owner/date and category/filter columns; soft-disable purchased products rather than delete historical references.
