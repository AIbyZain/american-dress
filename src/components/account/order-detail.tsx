"use client";

import type { Order } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { usePrice } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { formatDate, orderStatusLabel } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/payments";

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const variant = status === "delivered" ? "success" : status === "cancelled" ? "danger" : status === "pending" ? "gold" : "outline";
  return <Badge variant={variant}>{orderStatusLabel[status] ?? status}</Badge>;
}

export function OrderDetail({ order }: { order: Order }) {
  const fmt = usePrice();
  const a = order.shippingAddress;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl">Order {order.number}</h2>
        <OrderStatusBadge status={order.status} />
        {order.isDemo ? <Badge variant="muted">{order.isSample ? "Sample" : "Demo order"}</Badge> : null}
      </div>
      <p className="text-[14px] text-muted">Placed {formatDate(order.createdAt, true)}</p>

      <ul className="divide-y divide-line border-y border-line">
        {order.items.map((it, i) => (
          <li key={(it.variantId ?? "") + i} className="flex gap-4 py-4">
            <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-mist">
              <SmartImage src={it.image} alt="" sizes="64px" />
            </div>
            <div className="flex-1 text-[14px]">
              <p className="font-medium">{it.name}</p>
              <p className="text-muted">
                Size {it.size}, {it.color}. Qty {it.quantity}
              </p>
            </div>
            <p className="text-[14px]">{fmt(it.unitPrice * it.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-lg">Delivery</h3>
          <address className="mt-2 text-[14px] not-italic leading-relaxed text-ink/80">
            {a.fullName}
            <br />
            {a.line1}
            {a.line2 ? (
              <>
                <br />
                {a.line2}
              </>
            ) : null}
            <br />
            {a.city}, {a.province} {a.postalCode}
            <br />
            {a.phone}
          </address>
        </div>
        <div>
          <h3 className="font-serif text-lg">Payment</h3>
          <p className="mt-2 text-[14px] text-ink/80">{paymentMethodLabel(order.paymentMethod)}</p>
          <p className="text-[14px] capitalize text-muted">{order.paymentStatus}</p>
        </div>
        <dl className="space-y-1.5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{fmt(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd>{order.shippingFee ? fmt(order.shippingFee) : "Free"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-medium">
            <dt>Total</dt>
            <dd>{fmt(order.total)}</dd>
          </div>
        </dl>
      </div>
      {order.notes ? (
        <div>
          <h3 className="font-serif text-lg">Notes</h3>
          <p className="mt-2 text-[14px] text-ink/80">{order.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
