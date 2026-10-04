import type { Metadata } from "next";
import { OrderConfirmationView } from "@/components/checkout/order-confirmation-view";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  return <OrderConfirmationView id={params.id} />;
}
