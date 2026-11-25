"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/features/orders/contracts";

type BagState = {
  items: CartItem[]; saved: string[]; orderAttempt?: { signature: string; key: string };
  add: (item: CartItem, stock: number) => boolean;
  setQuantity: (variantId: string, quantity: number) => void;
  toggleSaved: (slug: string) => void;
  attempt: (signature: string) => string;
  clear: () => void;
};
export const useBag = create<BagState>()(persist((set, get) => ({
  items: [], saved: [],
  add(item, stock) {
    const items = get().items;
    const previous = items.find((row) => row.variantId === item.variantId);
    const quantity = item.quantity + (previous?.quantity ?? 0);
    if (quantity > Math.min(stock, 8) || (!previous && items.length >= 20)) return false;
    set({ items: previous ? items.map((row) => row.variantId === item.variantId ? { ...row, quantity } : row) : [...items, item] });
    return true;
  },
  setQuantity(variantId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 8) return;
    set(({ items }) => ({ items: quantity ? items.map((row) => row.variantId === variantId ? { ...row, quantity } : row)
      : items.filter((row) => row.variantId !== variantId) }));
  },
  toggleSaved(slug) {
    set(({ saved }) => ({ saved: saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug].slice(-50) }));
  },
  attempt(signature) {
    const previous = get().orderAttempt;
    if (previous?.signature === signature) return previous.key;
    const key = crypto.randomUUID();
    set({ orderAttempt: { signature, key } });
    return key;
  },
  clear() { set({ items: [], orderAttempt: undefined }); },
}), { name: "veyravelune-bag-v1", skipHydration: true, partialize: ({ items, saved, orderAttempt }) => ({ items, saved, orderAttempt }) }));
