import Link from "next/link";
import { SmartImage } from "@/components/shared/smart-image";
import { siteConfig } from "@/config/site";

export function BrandStory() {
  return (
    <section className="bg-ivory" aria-labelledby="story-heading">
      <div className="container grid items-center gap-12 py-20 md:grid-cols-2 md:py-24 lg:gap-20">
        <div className="relative mx-auto w-full max-w-[380px]">
          <div className="relative aspect-[4/5] overflow-hidden">
            <SmartImage src="/images/maroon-velvet-sherwani.jpg" alt="Maroon velvet sherwani with gold zardozi on a mannequin in the store" sizes="380px" />
          </div>
          <div className="absolute -bottom-5 -right-5 -z-0 hidden h-full w-full border border-gold/60 md:block" aria-hidden />
        </div>
        <div className="max-w-xl">
          <h2 id="story-heading" className="font-serif text-[34px] leading-tight md:text-[44px]">
            A menswear house on Bank Road
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-[1.75] text-ink/80">
            <p>
              American Dress House trades from shops 14 to 17 in Barkat Plaza, Saddar, dressing grooms, their families and anyone with an
              occasion to dress for.
            </p>
            <p>
              The range runs from embroidered sherwanis and prince coats to everyday suits, kurta shalwar and the finishing pieces. This site
              brings that range online, so you can choose at home and visit when it's time to try on.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[14px] font-medium">
            <Link href="/about" className="underline decoration-gold underline-offset-[6px] hover:decoration-ink">
              About the store
            </Link>
            <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-[6px] hover:decoration-ink">
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
