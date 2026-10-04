import type { Category, DataMode, Product, StoreSettings } from "@/types";
import { seedCategories, seedProducts, seedSettings } from "@/data/seed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

function demoData(): StoreData {
  return { products: seedProducts, categories: seedCategories, settings: seedSettings, mode: "demo" };
}

/** Loads catalog, categories and settings. Uses Supabase when configured, otherwise the demo seed. */
export async function getStoreData(): Promise<StoreData> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return demoData();

  const [products, categories, settings] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const error = products.error?.message ?? categories.error?.message ?? settings.error?.message;
  if (error) {
    console.error("[store] Supabase read failed:", error);
  }

  return {
    products: ((products.data ?? []) as ProductRow[]).map(mapProduct),
    categories: ((categories.data ?? []) as CategoryRow[]).map(mapCategory),
    settings: settings.data ? mapSettings(settings.data as SettingsRow) : seedSettings,
    mode: "supabase",
    error,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return seedProducts.find((p) => p.slug === slug) ?? null;
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data ? mapProduct(data as ProductRow) : null;
}
