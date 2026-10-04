"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { useAuth } from "@/context/auth-context";
import { fetchOrder } from "@/lib/services/orders.client";
import { OrderDetail } from "./order-detail";
import { Skeleton } from "@/components/ui/skeleton";

export function MyOrderView({ id }: { id: string }) {
  const { user, mode } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    fetchOrder(mode, id)
      .then((o) => {
        // Demo mode: only show orders that belong to this demo account.
        if (o && mode === "demo" && o.userId !== user.id && o.email !== user.email) setOrder(null);
        else setOrder(o);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Order not found.");
        setOrder(null);
      });
  }, [id, mode, user]);
  return (
    <div>
      <Link href="/account/orders" className="text-[14px] underline underline-offset-4">
        Back to orders
      </Link>
      <div className="mt-6">
        {order === undefined ? (
          <Skeleton className="h-64 w-full" />
        ) : order ? (
          <OrderDetail order={order} />
        ) : (
          <p className="text-[15px] text-muted">{error ?? "This order wasn't found on your account."}</p>
        )}
      </div>
    </div>
  );
}
