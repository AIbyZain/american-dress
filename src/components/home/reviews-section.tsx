import { reviews } from "@/data/reviews";
import { siteConfig } from "@/config/site";
import { StarRating } from "@/components/shared/star-rating";

export function ReviewsSection() {
  const { value, count } = siteConfig.googleRating;
  const hasDemo = reviews.some((r) => r.source === "demo");
  return (
    <section className="border-y border-line bg-mist py-20 md:py-24" aria-labelledby="reviews-heading">
      <div className="container grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
        <div>
          <h2 id="reviews-heading" className="font-serif text-[34px] leading-tight md:text-[42px]">
            What customers say
          </h2>
          <div className="mt-6 flex items-end gap-3">
            <span className="font-serif text-6xl leading-none">{value.toFixed(1)}</span>
            <div className="pb-1">
              <StarRating value={value} />
              <p className="mt-1 text-[13px] text-muted">{count.toLocaleString("en-US")} Google reviews</p>
            </div>
          </div>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-[14px] font-medium underline decoration-gold underline-offset-[6px] hover:decoration-ink"
          >
            Read all reviews on Google
          </a>
          {hasDemo ? (
            <p className="mt-6 max-w-xs text-[12.5px] leading-relaxed text-muted">
              The quotes shown here are illustrative demo content, not real customer reviews. Replace them with verified Google reviews in
              src/data/reviews.ts.
            </p>
          ) : null}
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
          {reviews.slice(0, 5).map((r, i) => (
            <li key={i} className="flex flex-col bg-white p-6">
              <div className="flex items-center justify-between">
                <StarRating value={r.rating} />
                {r.source === "demo" ? <span className="bg-mist px-2 py-0.5 text-[11px] text-muted">Demo content</span> : null}
              </div>
              <blockquote className="mt-4 flex-1 font-serif text-[18px] leading-snug">“{r.text}”</blockquote>
              <p className="mt-5 text-[13px] text-muted">
                {r.author}
                {r.source === "google" ? `, Google review, ${r.when}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
