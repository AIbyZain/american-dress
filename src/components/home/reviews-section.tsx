import { reviews } from "@/data/reviews";
import { siteConfig } from "@/config/site";
import { StarRating } from "@/components/shared/star-rating";

export function ReviewsSection() {
  const { value, count } = siteConfig.googleRating;
  if (!reviews.length) return null;
  const hasDemo = reviews.some((r) => r.source === "demo");
  return (
    <section className="border-y border-line bg-mist py-20 md:py-24" aria-labelledby="reviews-heading">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="reviews-heading" className="font-serif text-[34px] leading-tight md:text-[42px]">
              What customers say
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-serif text-4xl leading-none">{value.toFixed(1)}</span>
              <div>
                <StarRating value={value} />
                <p className="mt-0.5 text-[13px] text-muted">{count.toLocaleString("en-US")} Google reviews</p>
              </div>
            </div>
          </div>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[14px] font-medium underline decoration-gold underline-offset-[6px] hover:decoration-ink"
          >
            Read all reviews on Google
          </a>
        </div>
        <ul className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.author + r.when} className="flex flex-col bg-white p-6 md:p-7">
              {r.rating ? <StarRating value={r.rating} className="mb-4" /> : null}
              <blockquote className="flex-1 text-[15px] leading-relaxed text-ink/85">“{r.text}”</blockquote>
              <p className="mt-6 border-t border-line pt-4 text-[13px]">
                <span className="font-medium text-ink">{r.author}</span>
                <span className="text-muted">
                  {r.source === "google" ? `, Google review, ${r.when}` : ", demo content"}
                </span>
              </p>
            </li>
          ))}
        </ul>
        {hasDemo ? <p className="mt-4 text-[12.5px] text-muted">Reviews marked demo content are illustrative, not real customer reviews.</p> : null}
      </div>
    </section>
  );
}
