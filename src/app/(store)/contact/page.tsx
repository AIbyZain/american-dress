import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ContactForm } from "@/components/shared/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Visit American Dress House at Barkat Plaza, Bank Road, Saddar, Rawalpindi, or call 051 5522031.",
};

export default function ContactPage() {
  const a = siteConfig.address;
  return (
    <>
      <PageHeader title="Contact and directions" intro="Call ahead to check a size or colour, or come in to try things on." crumbs={[{ label: "Contact" }]} />
      <section className="container grid gap-14 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="font-serif text-3xl">Visit the store</h2>
          <address className="mt-6 space-y-5 text-[15px] not-italic leading-relaxed">
            <p className="flex gap-4">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />
              <span>
                {siteConfig.name}
                <br />
                {a.line1}
                <br />
                {a.line2}, {a.city} {a.postalCode}
                <br />
                {a.country}
              </span>
            </p>
            <p className="flex gap-4">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />
              <a href={siteConfig.phoneHref} className="underline decoration-gold underline-offset-4">
                {siteConfig.phone}
              </a>
            </p>
          </address>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-[14px] font-medium underline decoration-gold underline-offset-[6px] hover:decoration-ink"
          >
            Open in Google Maps
          </a>
          <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden border border-line bg-mist">
            <iframe
              title="Map showing American Dress House, Bank Road, Saddar, Rawalpindi"
              src={siteConfig.mapEmbedUrl}
              className="absolute inset-0 h-full w-full grayscale-[30%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div>
          <h2 className="font-serif text-3xl">Send a message</h2>
          <p className="mt-2 text-[15px] text-muted">Questions about sizing, an order or a wedding outfit.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
