"use client";

import Link from "next/link";
import { useStoreData } from "@/context/store-data-context";
import { SmartImage } from "@/components/shared/smart-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function FeaturedShowcase() {
  const { activeProducts } = useStoreData();
  const p =
    activeProducts.find((x) => x.slug === "houndstooth-three-piece-suit") ??
    activeProducts.filter((x) => x.isFeatured).sort((a, b) => b.popularity - a.popularity)[0];
  if (!p) return null;
  return (
    <section className="container py-20 md:py-24" aria-labelledby="showcase-heading">
      <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-20">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden bg-mist md:order-2">
          <SmartImage src={p.images[0]?.url} alt={p.images[0]?.alt ?? p.name} label={p.name} sizes="460px" />
        </div>
        <div className="max-w-lg md:order-1">
          <h2 id="showcase-heading" className="font-serif text-[34px] leading-tight md:text-[44px]">
            {p.name}
          </h2>
          <p className="mt-5 text-[16px] leading-[1.75] text-ink/80">{p.description}</p>
          {p.details.length ? (
            <ul className="mt-6 space-y-2 border-l border-gold pl-5 text-[14px] text-ink/80">
              {p.details.slice(0, 3).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex items-center gap-6">
            <Price amount={p.price} compareAt={p.compareAtPrice} className="text-xl" />
            <Button asChild size="lg">
              <Link href={`/product/${p.slug}`}>View the piece</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
