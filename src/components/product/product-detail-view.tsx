"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Ruler, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useStoreData } from "@/context/store-data-context";
import { useCart } from "@/context/cart-context";
import { findVariant, productStock, relatedProducts, variantPrice } from "@/lib/catalog";
import { ProductGallery } from "./product-gallery";
import { QuantitySelector } from "./quantity-selector";
import { WishlistButton } from "./wishlist-button";
import { ProductGrid } from "./product-card";
import { Price, usePrice } from "@/components/shared/price";
import { Breadcrumbs } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function StockLine({ stock }: { stock: number | null }) {
  if (stock === null) return <p className="text-[13px] text-muted">Choose a size to check availability.</p>;
  if (stock === 0) return <p className="text-[13px] text-danger">Out of stock in this size and colour.</p>;
  if (stock <= 3) return <p className="text-[13px] text-gold-dark">Only {stock} left in this size.</p>;
  return <p className="text-[13px] text-success">In stock, ready to dispatch.</p>;
}

export function ProductDetailView({ slug, initialProduct }: { slug: string; initialProduct: Product | null }) {
  const { getProduct, activeProducts, categoryById, settings, hydrated } = useStoreData();
  const { add, setOpen } = useCart();
  const fmt = usePrice();
  const product = getProduct(slug) ?? initialProduct ?? undefined;

  const [color, setColor] = useState<string | null>(product?.colors[0]?.name ?? null);
  const [size, setSize] = useState<string | null>(product && product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    setQty(1);
  }, [size, color]);

  // Product may only resolve after demo data loads from this browser.
  useEffect(() => {
    if (!product) return;
    if (!color || !product.colors.some((c) => c.name === color)) setColor(product.colors[0]?.name ?? null);
    if (!size && product.sizes.length === 1) setSize(product.sizes[0]);
  }, [product, color, size]);

  const variant = product ? findVariant(product, size, color) : null;
  const related = useMemo(() => (product ? relatedProducts(activeProducts, product) : []), [activeProducts, product]);

  if (!product || product.status !== "active") {
    if (!hydrated) return <div className="container min-h-[60vh] py-20" aria-busy="true" />;
    return (
      <EmptyState
        title="This piece isn't available"
        body="It may have been removed from the catalogue. Browse the current range instead."
        action={{ label: "Shop all products", href: "/shop" }}
      />
    );
  }

  const category = product.categoryId ? categoryById[product.categoryId] : null;
  const total = productStock(product);
  const stockFor = (s: string) => product.variants.find((v) => v.size === s && v.color === color)?.stock ?? 0;
  const price = variantPrice(product, variant);
  const maxQty = Math.max(1, Math.min(20, variant?.stock ?? 1));

  function onAdd() {
    if (!size || !variant) {
      setSizeError(true);
      document.getElementById("size-options")?.focus();
      return;
    }
    const r = add(product!.id, variant.id, qty);
    if (!r.ok) {
      toast.error(r.message ?? "Couldn't add to bag.");
      return;
    }
    toast.success("Added to bag", { description: `${product!.name}, size ${size}, ${color}` });
    if (r.message) toast(r.message);
    setOpen(true);
  }

  return (
    <>
      <div className="container py-8 md:py-10">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div className="lg:sticky lg:top-36 lg:self-start">
            {category ? <p className="text-[13px] text-muted">{category.name}</p> : null}
            <h1 className="mt-1 font-serif text-3xl leading-tight md:text-[40px]">{product.name}</h1>
            <Price amount={price} compareAt={product.compareAtPrice} className="mt-4 text-xl" />
            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink/80">{product.description}</p>

            {product.colors.length ? (
              <fieldset className="mt-8">
                <legend className="text-[13px] font-medium">
                  Colour: <span className="font-normal text-muted">{color}</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-pressed={color === c.name}
                      aria-label={c.name}
                      title={c.name}
                      onClick={() => setColor(c.name)}
                      className={cn(
                        "h-9 w-9 rounded-full border border-black/10 transition-shadow",
                        color === c.name ? "ring-1 ring-ink ring-offset-2" : "hover:ring-1 hover:ring-line hover:ring-offset-2",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            <fieldset className="mt-7">
              <div className="flex items-center justify-between">
                <legend className="text-[13px] font-medium">
                  Size{size ? <span className="font-normal text-muted">: {size}</span> : null}
                </legend>
                <Link href="/faq" className="inline-flex items-center gap-1.5 text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
                  <Ruler className="h-3.5 w-3.5" aria-hidden /> Size guide
                </Link>
              </div>
              <div id="size-options" tabIndex={-1} className="mt-3 flex flex-wrap gap-2 focus:outline-none" aria-describedby={sizeError ? "size-error" : undefined}>
                {product.sizes.map((s) => {
                  const out = stockFor(s) === 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={size === s}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      className={cn(
                        "h-11 min-w-[52px] border px-3 text-[14px] transition-colors",
                        size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                        out && size !== s && "text-muted line-through decoration-muted/60",
                      )}
                    >
                      {s}
                      {out ? <span className="sr-only"> (out of stock)</span> : null}
                    </button>
                  );
                })}
              </div>
              {sizeError ? (
                <p id="size-error" role="alert" className="mt-2 text-[13px] text-danger">
                  Choose a size first.
                </p>
              ) : null}
            </fieldset>

            <div className="mt-5">
              <StockLine stock={variant ? variant.stock : total === 0 ? 0 : null} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QuantitySelector value={qty} onChange={setQty} max={maxQty} />
              <Button size="lg" className="flex-1" onClick={onAdd} disabled={total === 0 || (!!variant && variant.stock === 0)}>
                {total === 0 ? "Sold out" : variant && variant.stock === 0 ? "Out of stock" : "Add to bag"}
              </Button>
            </div>
            <div className="mt-4">
              <WishlistButton productId={product.id} name={product.name} withLabel />
            </div>

            <ul className="mt-9 space-y-3 border-t border-line pt-6 text-[14px] text-ink/80">
              <li className="flex gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
                {settings.freeShippingThreshold > 0
                  ? `Free delivery on orders over ${fmt(settings.freeShippingThreshold)}. Otherwise ${fmt(settings.shippingFlatFee)}.`
                  : `Delivery ${fmt(settings.shippingFlatFee)} across Pakistan.`}
              </li>
              <li className="flex gap-3">
                <Store className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
                <span>
                  Ask about fittings and alterations at our store on Bank Road, Saddar.{" "}
                  <a href={siteConfig.phoneHref} className="underline underline-offset-4">
                    Call {siteConfig.phone}
                  </a>
                </span>
              </li>
            </ul>

            {product.details.length ? (
              <details className="group mt-6 border-t border-line pt-5" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg">
                  Details and fabric
                  <span className="text-xl text-muted group-open:rotate-45 transition-transform" aria-hidden>
                    +
                  </span>
                </summary>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink/80 marker:text-gold">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            {variant ? <p className="mt-6 text-[12px] text-muted">SKU {variant.sku}</p> : null}
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="border-t border-line bg-mist py-16" aria-labelledby="related-heading">
          <div className="container">
            <h2 id="related-heading" className="font-serif text-3xl">
              Wear it with
            </h2>
            <div className="mt-8">
              <ProductGrid products={related} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
