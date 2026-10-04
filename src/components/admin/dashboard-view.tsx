"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminPageHeader, Panel } from "./admin-shell";
import { StatCard } from "./stat-card";
import { SalesChart } from "./sales-chart";
import { OrdersTable } from "./orders-table";
import { useAdminOrders } from "./use-admin-orders";
import { useStoreData } from "@/context/store-data-context";
import { orderKpis, revenueByDay } from "@/lib/analytics";
import { productStock } from "@/lib/catalog";
import { usePrice } from "@/components/shared/price";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const { orders, error } = useAdminOrders();
  const { products, mode } = useStoreData();
  const fmt = usePrice();
  const kpi = useMemo(() => orderKpis(orders ?? []), [orders]);
  const chart = useMemo(() => revenueByDay(orders ?? []), [orders]);
  const lowStock = products.flatMap((p) => p.variants.filter((v) => v.stock <= 2).map((v) => ({ p, v }))).slice(0, 6);
  const note = mode === "demo" ? "Includes sample data" : undefined;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        intro={mode === "demo" ? "Demo figures. Sample orders are generated so the charts have something to show." : "Live figures from your store database."}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />
      {error ? <p role="alert" className="mb-6 text-[14px] text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orders ? (
          <>
            <StatCard label="Revenue" value={fmt(kpi.revenue)} note={note ?? "Excludes cancelled orders"} />
            <StatCard label="Orders" value={String(kpi.orders)} note={`${kpi.pending} awaiting action`} />
            <StatCard label="Average order" value={fmt(kpi.avgOrder)} note={note} />
            <StatCard label="Products" value={String(products.length)} note={`${products.filter((p) => productStock(p) === 0).length} sold out`} />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[108px]" />)
        )}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Revenue, last 30 days">{orders ? <SalesChart data={chart} /> : <Skeleton className="h-[280px]" />}</Panel>
        <Panel
          title="Low stock"
          action={
            <Link href="/admin/inventory" className="text-[13px] underline underline-offset-4">
              Inventory
            </Link>
          }
        >
          {lowStock.length ? (
            <ul className="divide-y divide-line text-[14px]">
              {lowStock.map(({ p, v }) => (
                <li key={v.id} className="flex justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">
                    {p.name}
                    <span className="block text-[12.5px] text-muted">
                      {v.size}, {v.color}
                    </span>
                  </span>
                  <span className={v.stock === 0 ? "text-danger" : "text-gold-dark"}>{v.stock === 0 ? "Out" : `${v.stock} left`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-muted">Every variant has at least 3 in stock.</p>
          )}
        </Panel>
      </div>
      <Panel
        title="Recent orders"
        className="mt-6"
        action={
          <Link href="/admin/orders" className="text-[13px] underline underline-offset-4">
            All orders
          </Link>
        }
      >
        {orders ? <OrdersTable orders={orders.slice(0, 6)} /> : <Skeleton className="h-48" />}
      </Panel>
    </>
  );
}
