import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";

const HERO_IMAGE = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80";

export function Hero() {
  return (
    <section className="relative bg-ink text-ivory" aria-labelledby="hero-heading">
      <div className="grid lg:min-h-[640px] lg:grid-cols-[1fr_1.05fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-10 md:py-20 lg:py-24 lg:pl-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:pr-16">
          <h1 id="hero-heading" className="font-serif text-[44px] leading-[1.04] sm:text-6xl xl:text-[76px]">
            Dressed for the baraat, and every day after.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ivory/75">
            Sherwanis, prince coats and tailoring from our store on Bank Road, Saddar. Choose online, then collect, or have it delivered across
            Pakistan.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="ivory" size="lg">
              <Link href="/collections/wedding-edit">Shop the wedding edit</Link>
            </Button>
            <Button asChild size="lg" className="border border-ivory/40 bg-transparent text-ivory hover:bg-ivory hover:text-ink">
              <Link href="/shop">Explore the collection</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[460px] lg:min-h-full">
          <SmartImage
            src={HERO_IMAGE}
            fallbackSrc="/images/houndstooth-three-piece.jpg"
            alt="Man in tailored navy suit adjusting his shirt cuff"
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
          />
          {/* Fabric swatch: a close-up from the actual store range */}
          <Link
            href="/product/ivory-jamawar-sherwani"
            className="group absolute bottom-6 left-6 z-20 flex w-[168px] flex-col bg-white p-2 text-ink shadow-[0_12px_30px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:w-[196px] lg:-left-12 lg:bottom-14"
          >
            <span className="relative block aspect-[3/4] overflow-hidden">
              <SmartImage src="/images/ivory-jamawar-detail.jpg" alt="Ivory jamawar with ruby stone motif" sizes="200px" />
            </span>
            <span className="mt-2 px-1 text-[12px] leading-snug">
              Ivory jamawar, hand-set ruby motif
              <span className="mt-0.5 block text-gold-dark group-hover:underline">View the sherwani</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
