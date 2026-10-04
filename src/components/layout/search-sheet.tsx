"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStoreData } from "@/context/store-data-context";
import { matchesQuery } from "@/lib/catalog";
import { Price } from "@/components/shared/price";
import { SmartImage } from "@/components/shared/smart-image";

export function SearchSheet() {
  const router = useRouter();
  const { activeProducts, categoryById } = useStoreData();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      q.trim().length < 2
        ? []
        : activeProducts.filter((p) => matchesQuery(p, q, p.categoryId ? categoryById[p.categoryId]?.name : "")).slice(0, 5),
    [q, activeProducts, categoryById],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 text-ink hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Search">
        <Search className="h-5 w-5" strokeWidth={1.6} />
      </SheetTrigger>
      <SheetContent side="top" title="Search the store">
        <div className="container py-6">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (!q.trim()) return;
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="flex items-center gap-3 border-b border-ink pb-3"
          >
            <Search className="h-5 w-5 text-muted" aria-hidden />
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sherwanis, suits, colours…"
              className="w-full bg-transparent font-serif text-2xl placeholder:text-muted/70 focus:outline-none md:text-3xl"
            />
          </form>
          {results.length ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="group flex gap-3 lg:block">
                    <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-mist lg:w-full">
                      <SmartImage src={p.images[0]?.url} alt={p.images[0]?.alt ?? p.name} sizes="200px" />
                    </div>
                    <div className="lg:mt-2">
                      <p className="text-sm group-hover:underline">{p.name}</p>
                      <Price amount={p.price} className="text-[13px] text-muted" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : q.trim().length >= 2 ? (
            <p className="mt-5 text-sm text-muted">No products match “{q}”. Try a colour or a category, like maroon or suits.</p>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {["Sherwani", "Prince coat", "Navy suit", "Waistcoat", "Kurta"].map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)} className="border border-line px-3 py-1.5 hover:border-ink">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
