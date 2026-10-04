import type { StoreSettings } from "@/types";

/** Mirrors the shipping rule in the place_order database function. */
export function shippingFee(subtotal: number, settings: StoreSettings, method: string = "cod") {
  if (subtotal <= 0) return 0;
  if (method === "store_pickup") return 0;
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) return 0;
  return settings.shippingFlatFee;
}
