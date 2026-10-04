import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ShopView } from "@/components/product/shop-view";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  return (
    <>
      <PageHeader title={q ? `Search: ${q}` : "Search"} crumbs={[{ label: "Search" }]} />
      <Suspense>
        <ShopView searchMode />
      </Suspense>
    </>
  );
}
