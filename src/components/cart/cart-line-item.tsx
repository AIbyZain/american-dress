"use client";

import Link from "next/link";
import type { CartLine } from "@/types";
import { useCart } from "@/context/cart-context";
import { SmartImage } from "@/components/shared/smart-image";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { usePrice } from "@/components/shared/price";

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { update, remove } = useCart();
  const fmt = usePrice();
  const { product, variant } = line;
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/product/${product.slug}`} onClick={onNavigate} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-mist sm:w-24">
        <SmartImage src={product.images[0]?.url} alt={product.images[0]?.alt ?? product.name} sizes="96px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${product.slug}`} onClick={onNavigate} className="text-[15px] font-medium leading-snug hover:underline">
              {product.name}
            </Link>
            <p className="mt-1 text-[13px] text-muted">
              Size {variant.size}, {variant.color}
            </p>
            {variant.stock < line.quantity ? (
              <p className="mt-1 text-[12px] text-danger">Only {variant.stock} left. Reduce the quantity to continue.</p>
            ) : null}
          </div>
          <p className="shrink-0 text-[14px]">{fmt(line.lineTotal)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            size="sm"
            value={line.quantity}
            max={Math.max(1, Math.min(20, variant.stock))}
            onChange={(n) => update(variant.id, n)}
            label={`Quantity for ${product.name}`}
          />
          <button type="button" onClick={() => remove(variant.id)} className="text-[13px] text-muted underline underline-offset-4 hover:text-ink">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
