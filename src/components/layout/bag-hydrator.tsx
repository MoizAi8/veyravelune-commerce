"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useBag } from "@/store/bag";

function onHydrate(callback: () => void) { return useBag.persist.onFinishHydration(callback); }
export function useBagReady() {
  return useSyncExternalStore(onHydrate, () => useBag.persist.hasHydrated(), () => false);
}
export function BagHydrator() {
  useEffect(() => { void useBag.persist.rehydrate(); }, []);
  return null;
}
