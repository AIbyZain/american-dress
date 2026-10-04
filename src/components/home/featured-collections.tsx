import Link from "next/link";
import { collections } from "@/data/collections";
import { SmartImage } from "@/components/shared/smart-image";
import { SectionHeading } from "./section-heading";

export function FeaturedCollections() {
  return (
    <section className="container py-20 md:py-24" aria-labelledby="collections-heading">
      <SectionHeading id="collections-heading" title="Shop by occasion" intro="Three edits drawn from the full range, so you can start with the event rather than the garment." />
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link href={`/collections/${c.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                <SmartImage src={c.image} alt={c.name} sizes="(min-width: 768px) 33vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">{c.name}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.description}</p>
              <span className="mt-3 inline-block text-[14px] font-medium underline decoration-gold underline-offset-[6px] group-hover:decoration-ink">
                Shop the edit
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
