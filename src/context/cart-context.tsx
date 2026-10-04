"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, CartLine } from "@/types";
import { STORAGE_KEYS, readLocal, writeLocal } from "@/lib/demo/storage";
import { useStoreData } from "./store-data-context";
import { variantPrice } from "@/lib/catalog";

interface CartValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  setOpen(open: boolean): void;
  add(productId: string, variantId: string, quantity?: number): { ok: boolean; message?: string };
  update(variantId: string, quantity: number): void;
  remove(variantId: string): void;
  clear(): void;
}

const Ctx = createContext<CartValue | null>(null);
const MAX_PER_LINE = 20;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, hydrated: dataReady } = useStoreData();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setItems(readLocal<CartItem[]>(STORAGE_KEYS.cart, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.cart, items);
  }, [items, hydrated]);

  const lines = useMemo<CartLine[]>(() => {
    const out: CartLine[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant || product.status !== "active") continue;
      const unitPrice = variantPrice(product, variant);
      out.push({ ...item, product, variant, unitPrice, lineTotal: unitPrice * item.quantity });
    }
    return out;
  }, [items, products]);

  // Drop lines whose product was removed, once catalog data is final.
  useEffect(() => {
    if (!hydrated || !dataReady) return;
    if (lines.length !== items.length) setItems(lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })));
  }, [hydrated, dataReady, lines, items.length]);

  const add = useCallback<CartValue["add"]>(
    (productId, variantId, quantity = 1) => {
      const product = products.find((p) => p.id === productId);
      const variant = product?.variants.find((v) => v.id === variantId);
      if (!product || !variant) return { ok: false, message: "This item is no longer available." };
      const existing = items.find((i) => i.variantId === variantId)?.quantity ?? 0;
      const limit = Math.min(MAX_PER_LINE, variant.stock);
      if (limit <= 0) return { ok: false, message: "This size is out of stock." };
      const nextQty = Math.min(limit, existing + quantity);
      if (nextQty === existing) return { ok: false, message: `Only ${limit} available in this size.` };
      setItems((list) =>
        list.some((i) => i.variantId === variantId)
          ? list.map((i) => (i.variantId === variantId ? { ...i, quantity: nextQty } : i))
          : [...list, { productId, variantId, quantity: nextQty }],
      );
      return { ok: true, message: nextQty < existing + quantity ? `Only ${limit} available, quantity adjusted.` : undefined };
    },
    [items, products],
  );

  const update = useCallback(
    (variantId: string, quantity: number) => {
      setItems((list) =>
        list
          .map((i) => {
            if (i.variantId !== variantId) return i;
            const stock = products.find((p) => p.id === i.productId)?.variants.find((v) => v.id === variantId)?.stock ?? 0;
            return { ...i, quantity: Math.max(0, Math.min(quantity, stock, MAX_PER_LINE)) };
          })
          .filter((i) => i.quantity > 0),
      );
    },
    [products],
  );

  const remove = useCallback((variantId: string) => setItems((l) => l.filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.lineTotal, 0),
      hydrated,
      isOpen,
      setOpen,
      add,
      update,
      remove,
      clear,
    }),
    [items, lines, hydrated, isOpen, add, update, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
