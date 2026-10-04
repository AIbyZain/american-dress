import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" aria-hidden />
            {c.href ? (
              <Link href={c.href} className="hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, intro, crumbs }: { title: string; intro?: string; crumbs?: Crumb[] }) {
  return (
    <header className="border-b border-line bg-mist">
      <div className="container py-10 md:py-14">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">{intro}</p> : null}
      </div>
    </header>
  );
}
