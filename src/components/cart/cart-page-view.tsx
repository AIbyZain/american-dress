"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartLineItem } from "./cart-line-item";
import { OrderSummaryTotals } from "./order-summary";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoNotice } from "@/components/shared/demo-notice";

export function CartPageView() {
  const { lines, subtotal, hydrated, clear } = useCart();
  if (!hydrated) {
    return (
      <div className="container py-12">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="mt-4 h-28 w-full" />
      </div>
    );
  }
  if (!lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" strokeWidth={1.4} />}
        title="Your bag is empty"
        body="Pieces you add will stay here on this device until you check out."
        action={{ label: "Shop the collection", href: "/shop" }}
      />
    );
  }
  const blocked = lines.some((l) => l.variant.stock < l.quantity);
  return (
    <div className="container grid gap-12 py-10 md:py-14 lg:grid-cols-[1fr_380px]">
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((l) => (
            <CartLineItem key={l.variantId} line={l} />
          ))}
        </ul>
        <div className="mt-5 flex justify-between text-[13px]">
          <Link href="/shop" className="underline underline-offset-4">
            Continue shopping
          </Link>
          <button type="button" onClick={clear} className="text-muted underline underline-offset-4 hover:text-ink">
            Empty bag
          </button>
        </div>
      </div>
      <aside className="h-fit bg-mist p-6" aria-label="Order summary">
        <h2 className="font-serif text-2xl">Summary</h2>
        <div className="mt-5">
          <OrderSummaryTotals subtotal={subtotal} />
        </div>
        <Button asChild size="lg" className="mt-6 w-full" aria-disabled={blocked}>
          <Link href={blocked ? "#" : "/checkout"} onClick={(e) => blocked && e.preventDefault()}>
            {blocked ? "Adjust quantities to continue" : "Checkout"}
          </Link>
        </Button>
        <p className="mt-4 text-[12.5px] leading-relaxed text-muted">Pay cash on delivery or at store pickup. Delivery fees are confirmed at checkout.</p>
        <DemoNotice className="mt-5" />
      </aside>
    </div>
  );
}
