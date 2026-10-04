"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { CartLineItem } from "./cart-line-item";
import { OrderSummaryTotals } from "./order-summary";

export function CartDrawer() {
  const { isOpen, setOpen, lines, subtotal, count } = useCart();
  const close = () => setOpen(false);
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" title={`Your bag${count ? ` (${count})` : ""}`}>
        {lines.length ? (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => (
                <CartLineItem key={l.variantId} line={l} onNavigate={close} />
              ))}
            </ul>
            <div className="border-t border-line bg-mist px-5 py-5">
              <OrderSummaryTotals subtotal={subtotal} />
              <div className="mt-5 grid gap-2.5">
                <Button asChild size="lg">
                  <Link href="/checkout" onClick={close}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="subtle">
                  <Link href="/cart" onClick={close}>
                    View bag
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-gold-dark" strokeWidth={1.4} aria-hidden />
            <p className="mt-4 font-serif text-xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted">Start with the wedding edit or browse everything in store.</p>
            <Button asChild className="mt-6" onClick={close}>
              <Link href="/shop">Shop the collection</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
