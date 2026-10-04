"use client";

import { useStoreData } from "@/context/store-data-context";
import { ProductGrid } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types";

export function ProductRail({
  id,
  title,
  intro,
  href,
  pick,
  tone = "white",
}: {
  id: string;
  title: string;
  intro?: string;
  href: string;
  pick: "bestseller" | "new";
  tone?: "white" | "mist";
}) {
  const { activeProducts } = useStoreData();
  const by = (p: Product) => (pick === "bestseller" ? p.isBestseller : p.isNew);
  const list = activeProducts
    .filter(by)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);
  if (!list.length) return null;
  return (
    <section className={tone === "mist" ? "bg-mist py-20 md:py-24" : "py-20 md:py-24"} aria-labelledby={id}>
      <div className="container">
        <SectionHeading id={id} title={title} intro={intro} href={href} linkLabel="See all" />
        <div className="mt-10">
          <ProductGrid products={list} />
        </div>
      </div>
    </section>
  );
}
