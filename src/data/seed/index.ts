import type { Category, Product, StoreSettings } from "@/types";
import productsJson from "./products.json";
import categoriesJson from "./categories.json";
import settingsJson from "./settings.json";

/**
 * Sample catalog used in demo mode. The same records are in supabase/seed.sql.
 * Replace with the store's real catalog when ready.
 */
export const seedProducts = productsJson as Product[];
export const seedCategories = categoriesJson as Category[];
export const seedSettings = settingsJson as StoreSettings;
