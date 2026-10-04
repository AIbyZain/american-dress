"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { OrdersList } from "./orders-list";
import { DemoNotice } from "@/components/shared/demo-notice";

export function AccountOverview() {
  const { user } = useAuth();
  const { ids } = useWishlist();
  if (!user) return null;
  return (
    <div className="space-y-12">
      <DemoNotice />
      <div className="grid gap-px bg-line sm:grid-cols-3">
        <div className="bg-white p-5">
          <p className="text-[13px] text-muted">Signed in as</p>
          <p className="mt-1 truncate text-[15px]">{user.email}</p>
        </div>
        <Link href="/wishlist" className="bg-white p-5 hover:bg-mist">
          <p className="text-[13px] text-muted">Wishlist</p>
          <p className="mt-1 font-serif text-2xl">{ids.length}</p>
        </Link>
        <Link href="/account/profile" className="bg-white p-5 hover:bg-mist">
          <p className="text-[13px] text-muted">Profile</p>
          <p className="mt-1 text-[15px] underline underline-offset-4">Edit details</p>
        </Link>
      </div>
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">Recent orders</h2>
          <Link href="/account/orders" className="text-[14px] underline underline-offset-4">
            All orders
          </Link>
        </div>
        <div className="mt-5">
          <OrdersList limit={3} />
        </div>
      </section>
    </div>
  );
}
