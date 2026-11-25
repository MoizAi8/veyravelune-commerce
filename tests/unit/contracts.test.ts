import { describe, expect, it } from "vitest";
import { itemsSchema, orderSchema, orderTransitions, totalsFor } from "@/features/orders/contracts";
import { money } from "@/lib/money";
import { catalogQuery } from "@/server/services/catalog";

const variantId = "6ed55125-5d0e-4b5d-ab01-7505d28461c1";
describe("commerce contracts", () => {
  it("uses integer amounts and applies the disclosed shipping threshold", () => {
    expect(totalsFor(0).totalCents).toBe(0);
    expect(totalsFor(199999).totalCents).toBe(204499);
    expect(totalsFor(200000)).toEqual({ subtotalCents: 200000, shippingCents: 0, taxCents: 0, discountCents: 0, totalCents: 200000 });
    expect(money(204499)).toBe("$2,044.99");
  });
  it("rejects malformed, duplicate and excessive quantities", () => {
    for (const quantity of [-1, 0, 1.5, 9, "2"]) expect(itemsSchema.safeParse([{ variantId, quantity }]).success).toBe(false);
    expect(itemsSchema.safeParse([{ variantId, quantity: 1 }, { variantId: variantId.toUpperCase(), quantity: 2 }]).success).toBe(false);
    expect(orderSchema.safeParse({ items: [{ variantId, quantity: 1 }], idempotencyKey: variantId, destination: "Actual street", demoConfirmed: true }).success).toBe(false);
  });
  it("allows every house department and rejects unlisted categories", () => {
    for (const category of ["seating","bedroom","dining","tables","lighting","decor"]) {
      expect(catalogQuery.safeParse({category}).success).toBe(true);
    }
    expect(catalogQuery.safeParse({category:"unlisted"}).success).toBe(false);
  });
  it("revalidates URL filter and transition bounds", () => {
    expect(catalogQuery.parse({ min: "200", page: "2" })).toMatchObject({ min: 20000, page: 2, sort: "curated" });
    expect(catalogQuery.safeParse({ min: "200", max: "100" }).success).toBe(false);
    expect(catalogQuery.safeParse({ sort: "unknown" }).success).toBe(false);
    expect(orderTransitions.COMPLETED).toEqual([]);
  });
});
