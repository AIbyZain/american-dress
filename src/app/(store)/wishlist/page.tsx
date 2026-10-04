import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { WishlistView } from "@/components/product/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <>
      <PageHeader title="Wishlist" crumbs={[{ label: "Wishlist" }]} />
      <WishlistView />
    </>
  );
}
