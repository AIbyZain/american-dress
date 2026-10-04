import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/services/store.server";
import { isSupabaseConfigured } from "@/lib/env";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { siteConfig } from "@/config/site";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "Product" };
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    openGraph: { title: p.name, description: p.description.slice(0, 160), images: p.images[0] ? [{ url: p.images[0].url, alt: p.images[0].alt }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  // In demo mode, products added from the admin exist only in the browser, so let the client resolve them.
  if (!product && isSupabaseConfigured()) notFound();

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((i) => (i.url.startsWith("/") ? `${siteConfig.url}${i.url}` : i.url)),
        sku: product.variants[0]?.sku,
        brand: { "@type": "Brand", name: siteConfig.name },
        offers: {
          "@type": "Offer",
          priceCurrency: "PKR",
          price: product.price,
          availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      <ProductDetailView slug={params.slug} initialProduct={product} />
    </>
  );
}
