"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useStoreData } from "@/context/store-data-context";
import { facetValues, filterProducts, parseFilters, sortOptions, type CatalogFilters } from "@/lib/catalog";
import { ProductGrid } from "./product-card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { usePrice } from "@/components/shared/price";
import { cn } from "@/lib/utils";

interface ShopViewProps {
  /** Fixed scope for category / collection pages. */
  categoryId?: string;
  collection?: string;
  showCategoryFilter?: boolean;
  searchMode?: boolean;
}

export function ShopView({ categoryId, collection, showCategoryFilter = true, searchMode }: ShopViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { activeProducts, categories } = useStoreData();
  const fmt = usePrice();

  const filters = parseFilters(params, { category: categoryId ?? null, collection: collection ?? null });
  const categoryParam = params.get("category");
  const effective: CatalogFilters = {
    ...filters,
    category: categoryId ?? (categoryParam ? categories.find((c) => c.slug === categoryParam)?.id ?? "__none__" : null),
  };

  const scope = useMemo(
    () => activeProducts.filter((p) => (!categoryId || p.categoryId === categoryId) && (!collection || p.collections.includes(collection))),
    [activeProducts, categoryId, collection],
  );
  const facets = useMemo(() => facetValues(scope), [scope]);
  const names = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const results = filterProducts(scope, effective, names);

  const [minDraft, setMinDraft] = useState(filters.minPrice?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice?.toString() ?? "");

  function update(mut: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mut(next);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  }
  const toggleMulti = (key: "size" | "color", value: string) =>
    update((p) => {
      const all = p.getAll(key);
      p.delete(key);
      (all.includes(value) ? all.filter((v) => v !== value) : [...all, value]).forEach((v) => p.append(key, v));
    });

  const activeChips: { label: string; clear: () => void }[] = [
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, clear: () => toggleMulti("size", s) })),
    ...filters.colors.map((c) => ({ label: c, clear: () => toggleMulti("color", c) })),
    ...(categoryParam && !categoryId
      ? [{ label: categories.find((c) => c.slug === categoryParam)?.name ?? categoryParam, clear: () => update((p) => p.delete("category")) }]
      : []),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? [
          {
            label: `${filters.minPrice != null ? fmt(filters.minPrice) : fmt(0)} to ${filters.maxPrice != null ? fmt(filters.maxPrice) : "any"}`,
            clear: () => {
              setMinDraft("");
              setMaxDraft("");
              update((p) => {
                p.delete("min");
                p.delete("max");
              });
            },
          },
        ]
      : []),
    ...(filters.inStock ? [{ label: "In stock", clear: () => update((p) => p.delete("stock")) }] : []),
  ];

  const filterPanel = (
    <div className="space-y-9">
      {showCategoryFilter && !categoryId ? (
        <fieldset>
          <legend className="font-serif text-lg">Category</legend>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li>
              <button type="button" onClick={() => update((p) => p.delete("category"))} className={cn("hover:text-ink", !categoryParam ? "font-medium text-ink" : "text-muted")}>
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={categoryParam === c.slug}
                  onClick={() => update((p) => p.set("category", c.slug))}
                  className={cn("hover:text-ink", categoryParam === c.slug ? "font-medium text-ink" : "text-muted")}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      {facets.sizes.length ? (
        <fieldset>
          <legend className="font-serif text-lg">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleMulti("size", s)}
                  className={cn("min-w-11 border px-2.5 py-1.5 text-[13px]", on ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {facets.colors.length ? (
        <fieldset>
          <legend className="font-serif text-lg">Colour</legend>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-[14px]">
            {facets.colors.map((c) => {
              const on = filters.colors.includes(c.name);
              return (
                <li key={c.name}>
                  <button type="button" aria-pressed={on} onClick={() => toggleMulti("color", c.name)} className="flex items-center gap-2.5">
                    <span
                      className={cn("h-4 w-4 rounded-full border", on ? "ring-1 ring-ink ring-offset-2" : "border-black/10")}
                      style={{ backgroundColor: c.hex }}
                      aria-hidden
                    />
                    <span className={on ? "font-medium" : "text-muted hover:text-ink"}>{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="font-serif text-lg">Price</legend>
        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update((p) => {
              if (minDraft) p.set("min", minDraft);
              else p.delete("min");
              if (maxDraft) p.set("max", maxDraft);
              else p.delete("max");
            });
          }}
        >
          <label className="flex-1 text-[12px] text-muted">
            Min
            <input
              inputMode="numeric"
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value.replace(/\D/g, ""))}
              placeholder={String(facets.min)}
              className="mt-1 h-10 w-full border border-line px-2.5 text-[14px] text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="flex-1 text-[12px] text-muted">
            Max
            <input
              inputMode="numeric"
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value.replace(/\D/g, ""))}
              placeholder={String(facets.max)}
              className="mt-1 h-10 w-full border border-line px-2.5 text-[14px] text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <Button type="submit" variant="subtle" size="sm" className="h-10">
            Apply
          </Button>
        </form>
      </fieldset>

      <label className="flex items-center gap-2.5 text-[14px]">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => update((p) => (e.target.checked ? p.set("stock", "1") : p.delete("stock")))}
          className="h-4 w-4 accent-ink"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="container py-10 md:py-12">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <p className="text-[14px] text-muted" aria-live="polite">
          {searchMode && filters.q ? `${results.length} results for “${filters.q}”` : `${results.length} ${results.length === 1 ? "piece" : "pieces"}`}
        </p>
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="subtle" size="sm" className="lg:hidden">
                <SlidersHorizontal /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" title="Filters">
              <div className="flex-1 overflow-y-auto px-5 py-6">{filterPanel}</div>
            </SheetContent>
          </Sheet>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => update((p) => p.set("sort", e.target.value))}
            className="h-9 border border-line bg-white px-3 text-[13px] focus:border-ink focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeChips.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button key={c.label} type="button" onClick={c.clear} className="inline-flex items-center gap-1.5 bg-mist px-3 py-1.5 text-[13px] hover:bg-ivory">
              {c.label}
              <X className="h-3 w-3" aria-label="Remove filter" />
            </button>
          ))}
          <button
            type="button"
            className="ml-1 text-[13px] text-muted underline underline-offset-4 hover:text-ink"
            onClick={() => {
              setMinDraft("");
              setMaxDraft("");
              router.replace(filters.q ? `${pathname}?q=${encodeURIComponent(filters.q)}` : pathname, { scroll: false });
            }}
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          {filterPanel}
        </aside>
        <div>
          {results.length ? (
            <ProductGrid products={results} columns={3} />
          ) : (
            <EmptyState
              title={searchMode && filters.q ? "Nothing matches that search" : "No pieces match these filters"}
              body={
                searchMode
                  ? "Check the spelling, or search for a category such as sherwani, suit or kurta."
                  : "Remove a filter or widen the price range to see more."
              }
              action={{ label: "Browse all products", href: "/shop" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
