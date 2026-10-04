"use client";

import { useMemo } from "react";
import { AdminPageHeader, Panel } from "./admin-shell";
import { StatCard } from "./stat-card";
import { SalesChart } from "./sales-chart";
import { useAdminOrders } from "./use-admin-orders";
import { useStoreData } from "@/context/store-data-context";
import { orderKpis, revenueByDay, statusCounts, topProducts } from "@/lib/analytics";
import { orderStatusLabel } from "@/lib/format";
import { usePrice } from "@/components/shared/price";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsView() {
  const { orders } = useAdminOrders();
  const { mode } = useStoreData();
  const fmt = usePrice();
  const data = useMemo(() => {
    const o = orders ?? [];
    return { kpi: orderKpis(o), daily: revenueByDay(o), top: topProducts(o, 6), status: statusCounts(o) };
  }, [orders]);

  if (!orders) return <Skeleton className="h-96" />;
  const maxStatus = Math.max(1, ...Object.values(data.status));

  return (
    <>
      <AdminPageHeader title="Sales analytics" intro={mode === "demo" ? "Calculated from demo and generated sample orders. Not real sales." : "Calculated from orders in your database."} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={fmt(data.kpi.revenue)} />
        <StatCard label="Orders" value={String(data.kpi.orders)} />
        <StatCard label="Units sold" value={String(data.kpi.units)} />
        <StatCard label="Average order" value={fmt(data.kpi.avgOrder)} />
      </div>
      <Panel title="Revenue per day, last 30 days" className="mt-6">
        <SalesChart data={data.daily} />
      </Panel>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Top products by revenue">
          <ol className="divide-y divide-line text-[14px]">
            {data.top.map((t, i) => (
              <li key={t.name} className="flex items-center gap-4 py-2.5">
                <span className="w-5 text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{t.name}</span>
                <span className="text-muted">{t.units} units</span>
                <span className="w-28 text-right">{fmt(t.revenue)}</span>
              </li>
            ))}
            {!data.top.length ? <li className="py-4 text-muted">No sales yet.</li> : null}
          </ol>
        </Panel>
        <Panel title="Orders by status">
          <ul className="space-y-3 text-[14px]">
            {Object.entries(orderStatusLabel).map(([k, label]) => {
              const n = data.status[k] ?? 0;
              return (
                <li key={k} className="grid grid-cols-[110px_1fr_36px] items-center gap-3">
                  <span>{label}</span>
                  <span className="h-2 bg-mist">
                    <span className="block h-2 bg-ink" style={{ width: `${(n / maxStatus) * 100}%` }} />
                  </span>
                  <span className="text-right text-muted">{n}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
