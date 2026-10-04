"use client";

import { useStoreData } from "@/context/store-data-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function usePrice() {
  const { settings } = useStoreData();
  return (n: number) => formatPrice(n, settings.currency, settings.currencyLocale);
}

export function Price({ amount, compareAt, className }: { amount: number; compareAt?: number | null; className?: string }) {
  const fmt = usePrice();
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span>{fmt(amount)}</span>
      {compareAt && compareAt > amount ? (
        <span className="text-[0.9em] text-muted line-through">
          <span className="sr-only">Was </span>
          {fmt(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
