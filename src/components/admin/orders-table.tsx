"use client";

import Link from "next/link";
import type { Order } from "@/types";
import { OrderStatusBadge } from "@/components/account/order-detail";
import { usePrice } from "@/components/shared/price";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const fmt = usePrice();
  if (!orders.length) return <p className="py-6 text-center text-[14px] text-muted">No orders match.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[14px]">
        <thead className="text-[12.5px] text-muted">
          <tr className="border-b border-line">
            <th scope="col" className="py-2.5 font-medium">Order</th>
            <th scope="col" className="py-2.5 font-medium">Customer</th>
            <th scope="col" className="py-2.5 font-medium">Date</th>
            <th scope="col" className="py-2.5 font-medium">Status</th>
            <th scope="col" className="py-2.5 font-medium">Payment</th>
            <th scope="col" className="py-2.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line last:border-0 hover:bg-mist/60">
              <td className="py-3">
                <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                  {o.number}
                </Link>
                {o.isSample ? <Badge variant="muted" className="ml-2">Sample</Badge> : o.isDemo ? <Badge variant="muted" className="ml-2">Demo</Badge> : null}
              </td>
              <td className="py-3">
                <span className="block">{o.shippingAddress.fullName}</span>
                <span className="block text-[12.5px] text-muted">{o.shippingAddress.city}</span>
              </td>
              <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
              <td className="py-3">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="py-3 capitalize text-muted">{o.paymentStatus}</td>
              <td className="py-3 text-right">{fmt(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
