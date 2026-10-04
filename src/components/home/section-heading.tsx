import Link from "next/link";

export function SectionHeading({ id, title, intro, href, linkLabel }: { id: string; title: string; intro?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 id={id} className="font-serif text-[34px] leading-tight md:text-[42px]">
          {title}
        </h2>
        {intro ? <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{intro}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-[14px] font-medium underline decoration-gold underline-offset-[6px] hover:decoration-ink">
          {linkLabel ?? "View all"}
        </Link>
      ) : null}
    </div>
  );
}
