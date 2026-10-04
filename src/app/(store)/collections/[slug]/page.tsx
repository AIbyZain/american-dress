import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollection } from "@/data/collections";
import { CollectionView } from "@/components/product/category-view";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCollection(params.slug);
  return c ? { title: c.name, description: c.description } : { title: "Collection" };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  if (!getCollection(params.slug)) notFound();
  return <CollectionView slug={params.slug} />;
}
