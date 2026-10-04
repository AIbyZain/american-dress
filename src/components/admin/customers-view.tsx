"use client";

import { useEffect, useState } from "react";
import type { CustomerSummary } from "@/types";
import { useStoreData } from "@/context/store-data-context";
import { useAdminOrders } from "./use-admin-orders";
import { AdminPageHeader, Panel } from "./admin-shell";
import { adminListCustomersAction } from "@/app/actions/admin";
import { listDemoAccounts } from "@/lib/demo/auth";
import { usePrice } from "@/components/shared/price";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomersView() {
  const { mode } = useStoreData();
  const { orders } = useAdminOrders();
  const fmt = usePrice();
  const [rows, setRows] = useState<CustomerSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "supabase") {
      adminListCustomersAction().then((r) => {
        if (r.ok) setRows(r.data ?? []);
        else {
          setError(r.error ?? "Couldn't load customers.");
          setRows([]);
        }
      });
      return;
    }
    if (!orders) return;
    listDemoAccounts().then((accounts) => {
      const byEmail = new Map<string, CustomerSummary>();
      for (const a of accounts) {
        byEmail.set(a.email, { id: a.id, email: a.email, fullName: a.fullName, role: a.role, orderCount: 0, totalSpent: 0, joinedAt: a.createdAt });
      }
      for (const o of orders) {
        const key = o.email.toLowerCase();
        const row =
          byEmail.get(key) ??
          ({ id: key, email: key, fullName: o.shippingAddress.fullName, role: "customer", orderCount: 0, totalSpent: 0, joinedAt: o.createdAt, isSample: o.isSample } as CustomerSummary);
        if (o.status !== "cancelled") {
          row.orderCount += 1;
          row.totalSpent += o.total;
        }
        if (o.createdAt < row.joinedAt) row.joinedAt = o.createdAt;
        byEmail.set(key, row);
      }
      setRows(Array.from(byEmail.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    });
  }, [mode, orders]);

  return (
    <>
      <AdminPageHeader title="Customers" intro={mode === "demo" ? "Demo accounts in this browser and sample customers." : "Registered customers and their order totals."} />
      <Panel>
        {error ? <p role="alert" className="mb-4 text-[14px] text-danger">{error}</p> : null}
        {!rows ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[12.5px] text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2.5 font-medium">Customer</th>
                  <th scope="col" className="py-2.5 font-medium">Role</th>
                  <th scope="col" className="py-2.5 font-medium">Orders</th>
                  <th scope="col" className="py-2.5 font-medium">Spent</th>
                  <th scope="col" className="py-2.5 font-medium">First seen</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="py-3">
                      <span className="font-medium">{c.fullName || "No name"}</span>
                      {c.isSample ? <Badge variant="muted" className="ml-2">Sample</Badge> : null}
                      <span className="block text-[12.5px] text-muted">{c.email}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={c.role === "admin" ? "gold" : "outline"}>{c.role === "admin" ? "Admin" : "Customer"}</Badge>
                    </td>
                    <td className="py-3">{c.orderCount}</td>
                    <td className="py-3">{fmt(c.totalSpent)}</td>
                    <td className="py-3 text-muted">{formatDate(c.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length ? <p className="py-8 text-center text-[14px] text-muted">No customers yet.</p> : null}
          </div>
        )}
      </Panel>
    </>
  );
}
