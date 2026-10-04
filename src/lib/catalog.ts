import type { Product, ProductVariant } from "@/types";

export type SortKey = "featured" | "popular" | "newest" | "price-asc" | "price-desc";

export interface CatalogFilters {
  q: string;
  category: string | null;
  collection: string | null;
  sizes: string[];
  colors: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: SortKey;
}

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

type Params = { get(name: string): string | null; getAll(name: string): string[] };

export function parseFilters(params: Params, base: Partial<CatalogFilters> = {}): CatalogFilters {
  const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const sort = params.get("sort") as SortKey | null;
  return {
    q: params.get("q") ?? base.q ?? "",
    category: base.category ?? params.get("category"),
    collection: base.collection ?? params.get("collection"),
    sizes: params.getAll("size"),
    colors: params.getAll("color"),
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    inStock: params.get("stock") === "1",
    sort: sort && sortOptions.some((o) => o.value === sort) ? sort : "featured",
  };
}

export function productStock(p: Product) {
  return p.variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
}

export function variantPrice(p: Product, v?: ProductVariant | null) {
  return v?.priceOverride ?? p.price;
}

export function findVariant(p: Product, size: string | null, color: string | null) {
  if (!size || !color) return null;
  return p.variants.find((v) => v.size === size && v.color === color) ?? null;
}

export function normalise(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, " ");
}

export function matchesQuery(p: Product, q: string, categoryName = "") {
  const terms = normalise(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = normalise([p.name, p.description, categoryName, p.colors.map((c) => c.name).join(" "), p.collections.join(" ")].join(" "));
  return terms.every((t) => hay.includes(t));
}

export function filterProducts(products: Product[], f: CatalogFilters, categoryNames: Record<string, string> = {}) {
  const out = products.filter((p) => {
    if (p.status !== "active") return false;
    if (f.category && p.categoryId !== f.category) return false;
    if (f.collection && !p.collections.includes(f.collection)) return false;
    if (f.q && !matchesQuery(p, f.q, p.categoryId ? categoryNames[p.categoryId] : "")) return false;
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    if (f.colors.length && !p.colors.some((c) => f.colors.includes(c.name))) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.inStock && productStock(p) === 0) return false;
    return true;
  });
  return sortProducts(out, f.sort);
}

export function sortProducts(list: Product[], sort: SortKey) {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "newest":
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt));
    case "popular":
      return arr.sort((a, b) => b.popularity - a.popularity);
    default:
      return arr.sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isBestseller) - Number(a.isBestseller) || b.popularity - a.popularity,
      );
  }
}

export function facetValues(products: Product[]) {
  const sizes = new Set<string>();
  const colors = new Map<string, string>();
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    p.sizes.forEach((s) => sizes.add(s));
    p.colors.forEach((c) => colors.set(c.name, c.hex));
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  }
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const sortedSizes = Array.from(sizes).sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    if (!Number.isNaN(na)) return -1;
    if (!Number.isNaN(nb)) return 1;
    return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
  });
  return {
    sizes: sortedSizes,
    colors: Array.from(colors, ([name, hex]) => ({ name, hex })),
    min: min === Infinity ? 0 : min,
    max,
  };
}

export function relatedProducts(all: Product[], p: Product, limit = 4) {
  return all
    .filter((x) => x.id !== p.id && x.status === "active")
    .map((x) => ({
      x,
      score: (x.categoryId === p.categoryId ? 3 : 0) + x.collections.filter((c) => p.collections.includes(c)).length,
    }))
    .sort((a, b) => b.score - a.score || b.x.popularity - a.x.popularity)
    .slice(0, limit)
    .map((r) => r.x);
}
