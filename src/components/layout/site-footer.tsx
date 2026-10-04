"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { siteConfig } from "@/config/site";
import { useStoreData } from "@/context/store-data-context";
import { StarRating } from "@/components/shared/star-rating";

export function SiteFooter() {
  const { categories, mode } = useStoreData();
  const year = new Date().getFullYear();
  const a = siteConfig.address;

  return (
    <footer className="bg-ink text-ivory">
      <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo tone="ivory" className="items-start" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/70">
            Wedding and formal menswear from our store on Bank Road, Saddar. Order online or come in for a fitting.
          </p>
          <div className="mt-8 max-w-sm">
            <p className="font-serif text-lg">New arrivals, first</p>
            <NewsletterForm tone="dark" id="footer-newsletter" />
          </div>
        </div>

        <nav aria-label="Shop">
          <h2 className="font-serif text-lg">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-ivory">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className="font-serif text-lg">Help</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            <li><Link href="/faq" className="hover:text-ivory">Sizing and FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-ivory">Contact us</Link></li>
            <li><Link href="/account/orders" className="hover:text-ivory">Track an order</Link></li>
            <li><Link href="/about" className="hover:text-ivory">About the store</Link></li>
            <li><Link href="/privacy" className="hover:text-ivory">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-ivory">Terms and conditions</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-lg">Visit the store</h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-ivory/70">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>
                {a.line1}
                <br />
                {a.line2}, {a.city} {a.postalCode}
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={siteConfig.phoneHref} className="hover:text-ivory">
                {siteConfig.phone}
              </a>
            </p>
          </address>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-ivory/80 hover:text-ivory"
          >
            <StarRating value={siteConfig.googleRating.value} />
            <span>
              {siteConfig.googleRating.value.toFixed(1)} on Google, {siteConfig.googleRating.count.toLocaleString("en-US")} reviews
            </span>
          </a>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container flex flex-col gap-2 py-5 text-[12.5px] text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          {mode === "demo" ? <p>Demo storefront with a sample catalog. No payments are taken.</p> : null}
        </div>
      </div>
    </footer>
  );
}
