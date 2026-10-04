import type { Metadata } from "next";
import { MyOrderView } from "@/components/account/my-order-view";

export const metadata: Metadata = { title: "Order details" };

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <MyOrderView id={params.id} />;
}
