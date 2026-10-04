import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" crumbs={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
      <CheckoutView />
    </>
  );
}
