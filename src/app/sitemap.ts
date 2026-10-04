import type { MetadataRoute } from "next";
import { getStoreData } from "@/lib/services/store.server";
import { collections } from "@/data/collections";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getStoreData();
  const base = siteConfig.url.replace(/\/$/, "");
  const statics = ["", "/shop", "/about", "/contact", "/faq", "/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const }));
  return [
    ...statics,
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}` })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}` })),
    ...products.filter((p) => p.status === "active").map((p) => ({ url: `${base}/product/${p.slug}` })),
  ];
}
