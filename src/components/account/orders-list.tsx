"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Order } from "@/types";
import { useAuth } from "@/context/auth-context";
import { fetchMyOrders } from "@/lib/services/orders.client";
import { OrderStatusBadge } from "./order-detail";
import { usePrice } from "@/components/shared/price";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function useMyOrders() {
  const { user, mode } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    fetchMyOrders(mode, user.id, user.email)
      .then(setOrders)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Couldn't load orders.");
        setOrders([]);
      });
  }, [user, mode]);
  return { orders, error };
}

export function OrdersList({ limit }: { limit?: number }) {
  const { orders, error } = useMyOrders();
  const fmt = usePrice();
  if (!orders) return <Skeleton className="h-40 w-full" />;
  if (error) return <p role="alert" className="text-[14px] text-danger">{error}</p>;
  if (!orders.length) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" strokeWidth={1.4} />}
        title="No orders yet"
        body="When you place an order it will appear here with its status."
        action={{ label: "Start shopping", href: "/shop" }}
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="py-3 font-medium">Order</th>
            <th scope="col" className="py-3 font-medium">Date</th>
            <th scope="col" className="py-3 font-medium">Status</th>
            <th scope="col" className="py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, limit).map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-4">
                <Link href={`/account/orders/${o.id}`} className="underline underline-offset-4 hover:text-gold-dark">
                  {o.number}
                </Link>
              </td>
              <td className="py-4 text-muted">{formatDate(o.createdAt)}</td>
              <td className="py-4">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="py-4 text-right">{fmt(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
