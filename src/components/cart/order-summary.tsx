"use client";

import { useStoreData } from "@/context/store-data-context";
import { usePrice } from "@/components/shared/price";
import { shippingFee } from "@/lib/pricing";

export function OrderSummaryTotals({ subtotal, method = "cod" }: { subtotal: number; method?: string }) {
  const { settings } = useStoreData();
  const fmt = usePrice();
  const fee = shippingFee(subtotal, settings, method);
  const toFree = settings.freeShippingThreshold - subtotal;
  return (
    <dl className="space-y-2.5 text-[14px]">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd>{fmt(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">{method === "store_pickup" ? "Store pickup" : "Delivery"}</dt>
        <dd>{fee === 0 ? "Free" : fmt(fee)}</dd>
      </div>
      {method !== "store_pickup" && fee > 0 && toFree > 0 ? (
        <p className="text-[12.5px] text-gold-dark">Add {fmt(toFree)} more for free delivery.</p>
      ) : null}
      <div className="flex justify-between border-t border-line pt-3 text-[16px] font-medium">
        <dt>Total</dt>
        <dd>{fmt(subtotal + fee)}</dd>
      </div>
    </dl>
  );
}
