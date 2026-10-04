import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreData } from "@/lib/services/store.server";
import { isSupabaseConfigured } from "@/lib/env";
import { CategoryView } from "@/components/product/category-view";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { categories } = await getStoreData();
  const c = categories.find((x) => x.slug === params.slug);
  return c ? { title: c.name, description: c.description } : { title: "Category" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  if (isSupabaseConfigured()) {
    const { categories } = await getStoreData();
    if (!categories.some((c) => c.slug === params.slug)) notFound();
  }
  return <CategoryView slug={params.slug} />;
}
