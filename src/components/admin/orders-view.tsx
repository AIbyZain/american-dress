"use client";

import { useState } from "react";
import { AdminPageHeader, Panel } from "./admin-shell";
import { OrdersTable } from "./orders-table";
import { useAdminOrders } from "./use-admin-orders";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusLabel } from "@/lib/format";

export function OrdersView() {
  const { orders, error } = useAdminOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const list = (orders ?? []).filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    const s = q.trim().toLowerCase();
    return !s || o.number.toLowerCase().includes(s) || o.shippingAddress.fullName.toLowerCase().includes(s) || o.email.toLowerCase().includes(s);
  });
  return (
    <>
      <AdminPageHeader title="Orders" intro="Open an order to update its status." />
      <Panel>
        <div className="flex flex-wrap gap-3">
          <label htmlFor="order-q" className="sr-only">
            Search orders
          </label>
          <Input id="order-q" placeholder="Order number, name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <label htmlFor="order-status" className="sr-only">
            Filter by status
          </label>
          <div className="w-48">
            <NativeSelect id="order-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(orderStatusLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        {error ? <p role="alert" className="mt-4 text-[14px] text-danger">{error}</p> : null}
        <div className="mt-5">{orders ? <OrdersTable orders={list} /> : <Skeleton className="h-64" />}</div>
      </Panel>
    </>
  );
}
