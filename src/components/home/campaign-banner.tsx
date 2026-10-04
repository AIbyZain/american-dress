"use client";

import Link from "next/link";
import { useStoreData } from "@/context/store-data-context";
import { usePrice } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function CampaignBanner() {
  const { settings } = useStoreData();
  const fmt = usePrice();
  return (
    <section className="bg-ink text-ivory" aria-labelledby="campaign-heading">
      <div className="container grid gap-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:py-20">
        <div>
          <h2 id="campaign-heading" className="font-serif text-[32px] leading-tight md:text-[44px]">
            {settings.freeShippingThreshold > 0
              ? `Free delivery across Pakistan on orders over ${fmt(settings.freeShippingThreshold)}`
              : "Delivery across Pakistan, or collect from Saddar"}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ivory/70">
            Prefer to see it first? Choose store pickup at checkout and try everything on at Barkat Plaza before you pay.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button asChild variant="ivory" size="lg">
            <Link href="/shop">Start shopping</Link>
          </Button>
          <Button asChild size="lg" className="border border-ivory/40 bg-transparent text-ivory hover:bg-ivory hover:text-ink">
            <a href={siteConfig.phoneHref}>Call {siteConfig.phone}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
