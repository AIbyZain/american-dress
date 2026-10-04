"use client";

import { Suspense } from "react";
import { useStoreData } from "@/context/store-data-context";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ShopView } from "./shop-view";
import { getCollection } from "@/data/collections";

export function CategoryView({ slug }: { slug: string }) {
  const { categoryBySlug, hydrated } = useStoreData();
  const category = categoryBySlug[slug];
  if (!category) {
    if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;
    return <EmptyState title="Category not found" body="This category may have been renamed or removed." action={{ label: "Shop all products", href: "/shop" }} />;
  }
  return (
    <>
      <PageHeader title={category.name} intro={category.description} crumbs={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
      <Suspense>
        <ShopView categoryId={category.id} showCategoryFilter={false} />
      </Suspense>
    </>
  );
}

export function CollectionView({ slug }: { slug: string }) {
  const collection = getCollection(slug);
  if (!collection) return <EmptyState title="Collection not found" body="Browse the full range instead." action={{ label: "Shop all products", href: "/shop" }} />;
  return (
    <>
      <PageHeader title={collection.name} intro={collection.description} crumbs={[{ label: "Collections" }, { label: collection.name }]} />
      <Suspense>
        <ShopView collection={collection.slug} />
      </Suspense>
    </>
  );
}
