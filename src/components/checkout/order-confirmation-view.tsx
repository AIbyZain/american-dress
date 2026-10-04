"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/types";
import { useAuth } from "@/context/auth-context";
import { fetchOrder } from "@/lib/services/orders.client";
import { OrderDetail } from "@/components/account/order-detail";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoNotice } from "@/components/shared/demo-notice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";

export function OrderConfirmationView({ id }: { id: string }) {
  const { mode } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder(mode, id)
      .then(setOrder)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Order not found.");
        setOrder(null);
      });
  }, [mode, id]);

  if (order === undefined) {
    return (
      <div className="container max-w-3xl py-16">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-48 w-full" />
      </div>
    );
  }
  if (!order) {
    return <EmptyState title="Order not found" body={error ?? "Check the link, or find the order in your account."} action={{ label: "Go to my orders", href: "/account/orders" }} />;
  }

  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" strokeWidth={1.4} aria-hidden />
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">{order.isDemo ? "Demo order placed" : "Thank you, your order is placed"}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          {order.isDemo
            ? "This was a demonstration. The store has not received it and nothing was charged."
            : "Keep your order number for reference. You can follow its status from your account."}
        </p>
      </div>
      {order.isDemo ? <DemoNotice className="mt-8" /> : null}
      <div className="mt-10 border border-line p-6 md:p-8">
        <OrderDetail order={order} />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="subtle">
          <a href={siteConfig.phoneHref}>Questions? Call {siteConfig.phone}</a>
        </Button>
      </div>
    </div>
  );
}
