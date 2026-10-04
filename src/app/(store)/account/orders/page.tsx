import type { Metadata } from "next";
import { OrdersList } from "@/components/account/orders-list";

export const metadata: Metadata = { title: "Order history" };

export default function OrdersPage() {
  return (
    <div>
      <h2 className="font-serif text-2xl">Order history</h2>
      <div className="mt-6">
        <OrdersList />
      </div>
    </div>
  );
}
