"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useStoreData } from "@/context/store-data-context";
import { ProductGrid } from "./product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function WishlistView() {
  const { ids, hydrated } = useWishlist();
  const { activeProducts } = useStoreData();
  const { user, mode } = useAuth();
  const items = activeProducts.filter((p) => ids.includes(p.id));
  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;
  if (!items.length) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" strokeWidth={1.4} />}
        title="Nothing saved yet"
        body="Tap the heart on any piece to keep it here while you decide."
        action={{ label: "Browse the collection", href: "/shop" }}
      />
    );
  }
  return (
    <div className="container py-10 md:py-14">
      {!user && mode === "supabase" ? (
        <p className="mb-8 text-[14px] text-muted">
          Saved on this device.{" "}
          <Link href="/login?next=/wishlist" className="text-ink underline underline-offset-4">
            Sign in
          </Link>{" "}
          to keep your wishlist across devices.
        </p>
      ) : null}
      <ProductGrid products={items} />
    </div>
  );
}
