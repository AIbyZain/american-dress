import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="py-20 md:py-24" aria-labelledby="newsletter-heading">
      <div className="container max-w-2xl text-center">
        <h2 id="newsletter-heading" className="font-serif text-[34px] leading-tight md:text-[42px]">
          Hear about new arrivals first
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          An occasional email when new sherwanis and seasonal edits arrive in store.
        </p>
        <div className="mx-auto mt-8 max-w-md text-left">
          <NewsletterForm id="home-newsletter" />
        </div>
      </div>
    </section>
  );
}
