import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Your bag" crumbs={[{ label: "Bag" }]} />
      <CartPageView />
    </>
  );
}
