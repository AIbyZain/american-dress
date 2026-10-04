"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readLocal, writeLocal } from "@/lib/demo/storage";
import { useAuth } from "./auth-context";
import { getWishlistAction, setWishlistItemAction } from "@/app/actions/account";

interface WishlistValue {
  ids: string[];
  has(productId: string): boolean;
  toggle(productId: string): boolean;
  hydrated: boolean;
}

const Ctx = createContext<WishlistValue | null>(null);

/**
 * Saved on this device for guests and in demo mode.
 * With Supabase and a signed-in customer, it is also synced to the wishlist tables.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, mode } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readLocal<string[]>(STORAGE_KEYS.wishlist, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeLocal(STORAGE_KEYS.wishlist, ids);
  }, [ids, hydrated]);

  useEffect(() => {
    if (mode !== "supabase" || !user || !hydrated) return;
    let active = true;
    getWishlistAction().then(async (r) => {
      if (!active || !r.ok || !r.data) return;
      const remote = r.data;
      const local = readLocal<string[]>(STORAGE_KEYS.wishlist, []);
      const missing = local.filter((id) => !remote.includes(id));
      await Promise.all(missing.map((id) => setWishlistItemAction(id, true)));
      if (active) setIds(Array.from(new Set([...remote, ...local])));
    });
    return () => {
      active = false;
    };
  }, [mode, user, hydrated]);

  const toggle = useCallback(
    (productId: string) => {
      const saved = !ids.includes(productId);
      setIds((l) => (saved ? [...l, productId] : l.filter((x) => x !== productId)));
      if (mode === "supabase" && user) void setWishlistItemAction(productId, saved);
      return saved;
    },
    [ids, mode, user],
  );

  const value = useMemo<WishlistValue>(() => ({ ids, has: (id) => ids.includes(id), toggle, hydrated }), [ids, toggle, hydrated]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
