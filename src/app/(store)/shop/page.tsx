import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ShopView } from "@/components/product/shop-view";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Sherwanis, prince coats, suits, kurta shalwar, shirts and accessories from American Dress House, Rawalpindi.",
};

export default function ShopPage() {
  return (
    <>
      <PageHeader title="Shop all" intro="The full range, from wedding sherwanis to everyday shirts. Filter by size, colour and price." crumbs={[{ label: "Shop" }]} />
      <Suspense>
        <ShopView />
      </Suspense>
    </>
  );
}
