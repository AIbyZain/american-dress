"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { SmartImage } from "@/components/shared/smart-image";
import { Price } from "@/components/shared/price";
import { WishlistButton } from "./wishlist-button";
import { useStoreData } from "@/context/store-data-context";
import { productStock } from "@/lib/catalog";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { categoryById } = useStoreData();
  const stock = productStock(product);
  const [first, second] = product.images;
  const category = product.categoryId ? categoryById[product.categoryId]?.name : null;
  const tag = stock === 0 ? "Sold out" : product.compareAtPrice && product.compareAtPrice > product.price ? "Reduced" : product.isNew ? "New" : null;

  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <SmartImage
            src={first?.url}
            alt={first?.alt ?? product.name}
            priority={priority}
            label={product.name}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          {second ? (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <SmartImage src={second.url} alt="" sizes="(min-width: 1280px) 22vw, 48vw" />
            </div>
          ) : null}
          {tag ? (
            <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[11px] font-medium tracking-label text-ink">{tag}</span>
          ) : null}
        </div>
        <div className="mt-3.5 space-y-1">
          {category ? <p className="text-[12px] text-muted">{category}</p> : null}
          <h3 className="text-[15px] font-medium leading-snug text-ink group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
            {product.name}
          </h3>
          <Price amount={product.price} compareAt={product.compareAtPrice} className="text-[14px] text-ink/80" />
          {product.colors.length > 1 ? (
            <div className="flex items-center gap-1.5 pt-1" aria-label={`${product.colors.length} colours`}>
              {product.colors.map((c) => (
                <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          ) : null}
        </div>
      </Link>
      <WishlistButton productId={product.id} name={product.name} className="absolute right-2.5 top-2.5 bg-white/90 p-2" />
    </article>
  );
}

export function ProductGrid({ products, columns = 4 }: { products: Product[]; columns?: 3 | 4 }) {
  return (
    <ul
      className={
        columns === 3
          ? "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6"
          : "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4"
      }
    >
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
