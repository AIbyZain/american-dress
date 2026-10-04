import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "About us", description: "American Dress House, a menswear store in Barkat Plaza, Bank Road, Saddar, Rawalpindi." };

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About American Dress House" crumbs={[{ label: "About" }]} />
      <section className="container grid gap-12 py-16 md:grid-cols-[1fr_1.1fr] md:py-20 lg:gap-20">
        <div className="grid grid-cols-2 gap-4 self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-mist">
            <SmartImage src="/images/maroon-velvet-sherwani.jpg" alt="Maroon velvet sherwani on display" sizes="300px" />
          </div>
          <div className="relative mt-12 aspect-[4/5] overflow-hidden bg-mist">
            <SmartImage src="/images/ivory-jamawar-detail.jpg" alt="Ivory jamawar embroidery detail" sizes="300px" />
          </div>
        </div>
        <div className="max-w-prose space-y-5 text-[16px] leading-[1.8] text-ink/80">
          <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Formal menswear in the heart of Saddar</h2>
          <p>
            American Dress House is on Bank Road in Saddar, Rawalpindi, across shops 14 to 17 of Barkat Plaza. Customers come to us for wedding
            wear, from the sherwani and kulla for the baraat to prince coats and suits for the events around it, and for the tailoring they wear
            the rest of the year.
          </p>
          <p>
            This website brings the range online. Browse by occasion or garment, check sizes and colours, and order for delivery or collect in
            store and try everything on first.
          </p>
          <p className="border-l border-gold pl-5 text-[14px] text-muted">
            Store owners: replace this text with your own story, such as when the shop opened and what you're known for. It is kept neutral on
            purpose so nothing here is presented as fact before you confirm it.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild>
              <Link href="/shop">Shop the collection</Link>
            </Button>
            <Button asChild variant="subtle">
              <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
