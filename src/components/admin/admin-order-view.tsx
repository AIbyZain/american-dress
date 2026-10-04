"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@/types";
import { useAdminOrders } from "./use-admin-orders";
import { AdminPageHeader, Panel } from "./admin-shell";
import { OrderDetail } from "@/components/account/order-detail";
import { useStoreData } from "@/context/store-data-context";
import { setOrderStatus } from "@/lib/services/orders.client";
import { orderStatusLabel } from "@/lib/format";
import { NativeSelect } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminOrderView({ id }: { id: string }) {
  const { orders, reload } = useAdminOrders();
  const { mode } = useStoreData();
  const order = orders?.find((o) => o.id === id);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [payment, setPayment] = useState<PaymentStatus>("unpaid");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPayment(order.paymentStatus);
    }
  }, [order]);

  if (!orders) return <Skeleton className="h-96" />;
  if (!order) {
    return (
      <div>
        <p className="text-[15px] text-muted">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block underline underline-offset-4">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={`Order ${order.number}`}
        actions={
          <Button asChild variant="subtle" size="sm">
            <Link href="/admin/orders">All orders</Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <OrderDetail order={order} />
        </Panel>
        <Panel title="Update order" className="h-fit">
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                await setOrderStatus(mode, order, status, payment);
                toast.success("Order updated");
                reload();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Couldn't update the order.");
              } finally {
                setSaving(false);
              }
            }}
          >
            <Field id="status" label="Order status">
              <NativeSelect id="status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                {Object.entries(orderStatusLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="payment" label="Payment status">
              <NativeSelect id="payment" value={payment} onChange={(e) => setPayment(e.target.value as PaymentStatus)}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </NativeSelect>
            </Field>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Update order"}
            </Button>
            <p className="text-[12.5px] text-muted">
              Customer: {order.email}
              <br />
              Phone: {order.shippingAddress.phone}
            </p>
          </form>
        </Panel>
      </div>
    </>
  );
}
