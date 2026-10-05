import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category, DataMode, Product, StoreSettings } from "@/types";
import { seedCategories, seedProducts, seedSettings } from "@/data/seed";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";
import { CATALOG_REVALIDATE, CATALOG_TAG } from "@/lib/cache-tags";
import {
  PRODUCT_SELECT,
  mapCategory,
  mapProduct,
  mapSettings,
  type CategoryRow,
  type ProductRow,
  type SettingsRow,
} from "@/lib/supabase/mappers";

export interface StoreData {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  mode: DataMode;
  /** Set when Supabase is configured but could not be read. */
  error?: string;
}

let publicClient: SupabaseClient | null = null;

/**
 * Cookie-free client for public catalogue reads. Responses go into Next's data cache
 * (tag "catalog", refreshed every 60s and immediately after admin edits), so store pages
 * are served from cache instead of querying Supabase on every click.
 */
function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClient) {
    publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, next: { revalidate: CATALOG_REVALIDATE, tags: [CATALOG_TAG] } }),
      },
    });
  }
  return publicClient;
}

function demoData(): StoreData {
  return { products: seedProducts, categories: seedCategories, settings: seedSettings, mode: "demo" };
}

/** Catalogue, categories and settings. Supabase (cached) when configured, otherwise the demo seed. */
export async function getStoreData(): Promise<StoreData> {
  const supabase = getPublicClient();
  if (!supabase) return demoData();

  const [products, categories, settings] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const error = products.error?.message ?? categories.error?.message ?? settings.error?.message;
  if (error) console.error("[store] Supabase read failed:", error);

  return {
    products: ((products.data ?? []) as ProductRow[]).map(mapProduct),
    categories: ((categories.data ?? []) as CategoryRow[]).map(mapCategory),
    settings: settings.data ? mapSettings(settings.data as SettingsRow) : seedSettings,
    mode: "supabase",
    error,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicClient();
  if (!supabase) return seedProducts.find((p) => p.slug === slug) ?? null;
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("status", "active").maybeSingle();
  return data ? mapProduct(data as ProductRow) : null;
}
