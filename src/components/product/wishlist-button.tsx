"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/wishlist-context";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, name, className, withLabel }: { productId: string; name: string; className?: string; withLabel?: boolean }) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggle(productId);
        toast(now ? "Saved to wishlist" : "Removed from wishlist", { description: name });
      }}
      className={cn(
        "inline-flex items-center gap-2 text-ink transition-colors hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        className,
      )}
    >
      <Heart className={cn("h-[18px] w-[18px]", saved && "fill-ink")} strokeWidth={1.6} aria-hidden />
      {withLabel ? <span className="text-sm font-medium">{saved ? "Saved" : "Save to wishlist"}</span> : null}
    </button>
  );
}
