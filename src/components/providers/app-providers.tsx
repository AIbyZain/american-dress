"use client";

import { Toaster } from "sonner";
import type { AppUser } from "@/types";
import type { StoreData } from "@/lib/services/store.server";
import { AuthProvider } from "@/context/auth-context";
import { StoreDataProvider } from "@/context/store-data-context";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";

export function AppProviders({ data, user, children }: { data: StoreData; user: AppUser | null; children: React.ReactNode }) {
  return (
    <AuthProvider initialUser={user}>
      <StoreDataProvider initial={data}>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "!rounded-none !border-line !bg-white !text-ink !font-sans !shadow-[0_8px_30px_rgba(23,23,23,0.08)]",
                  description: "!text-muted",
                },
              }}
            />
          </WishlistProvider>
        </CartProvider>
      </StoreDataProvider>
    </AuthProvider>
  );
}
