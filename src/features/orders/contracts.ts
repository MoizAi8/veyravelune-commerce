import { z } from "zod";

export const itemsSchema = z.array(z.object({
  variantId: z.uuid().transform((id) => id.toLowerCase()),
  quantity: z.number().int().min(1).max(8),
})).min(1).max(20).refine((items) => new Set(items.map((item) => item.variantId)).size === items.length, "Remove duplicate variants.");
export const quoteSchema = z.object({ items: itemsSchema });
export const destinations = ["Mooncourt", "Silvermere", "Rookhaven"] as const;
export const orderSchema = quoteSchema.extend({
  idempotencyKey: z.uuid().transform((id) => id.toLowerCase()),
  destination: z.enum(destinations),
  demoConfirmed: z.literal(true),
});
export type CartItem = z.infer<typeof itemsSchema>[number];
export type OrderInput = z.infer<typeof orderSchema>;

export function totalsFor(subtotalCents: number) {
  const shippingCents = subtotalCents > 0 && subtotalCents < 200000 ? 4500 : 0;
  return { subtotalCents, shippingCents, taxCents: 0, discountCents: 0, totalCents: subtotalCents + shippingCents };
}

export const orderTransitions = { PLACED: ["PROCESSING"], PROCESSING: ["COMPLETED"], COMPLETED: [] } satisfies Record<string, string[]>;
