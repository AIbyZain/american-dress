"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult, Category, DataMode, Product, StoreSettings } from "@/types";
import { STORAGE_KEYS, clearDemoData, readLocal, writeLocal } from "@/lib/demo/storage";
import { seedCategories, seedProducts, seedSettings } from "@/data/seed";
import {
  deleteCategoryAction,
  deleteProductAction,
  saveCategoryAction,
  saveProductAction,
  saveSettingsAction,
  updateStockAction,
} from "@/app/actions/admin";

interface StoreDataValue {
  mode: DataMode;
  /** True once demo overrides from this browser have been applied. */
  hydrated: boolean;
  loadError?: string;
  products: Product[];
  activeProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  categoryById: Record<string, Category>;
  categoryBySlug: Record<string, Category>;
  getProduct(idOrSlug: string): Product | undefined;
  saveProduct(p: Product): Promise<ActionResult>;
  deleteProduct(id: string): Promise<ActionResult>;
  saveCategory(c: Category): Promise<ActionResult>;
  deleteCategory(id: string): Promise<ActionResult>;
  setVariantStock(productId: string, variantId: string, stock: number): Promise<ActionResult>;
  /** Demo mode only: reduce local stock after a demo order. */
  consumeDemoStock(items: { productId: string; variantId: string; quantity: number }[]): void;
  saveSettings(s: StoreSettings): Promise<ActionResult>;
  resetDemoData(): void;
}

const Ctx = createContext<StoreDataValue | null>(null);

interface Initial {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  mode: DataMode;
  error?: string;
}

export function StoreDataProvider({ initial, children }: { initial: Initial; children: React.ReactNode }) {
  const router = useRouter();
  const { mode } = initial;
  const [products, setProducts] = useState(initial.products);
  const [categories, setCategories] = useState(initial.categories);
  const [settings, setSettings] = useState(initial.settings);
  const [hydrated, setHydrated] = useState(mode === "supabase");

  // Demo mode: apply edits saved in this browser.
  useEffect(() => {
    if (mode !== "demo") return;
    const saved = readLocal<{ products: Product[]; categories: Category[] } | null>(STORAGE_KEYS.catalog, null);
    if (saved?.products?.length) setProducts(saved.products);
    if (saved?.categories?.length) setCategories(saved.categories);
    const s = readLocal<StoreSettings | null>(STORAGE_KEYS.settings, null);
    if (s) setSettings(s);
    setHydrated(true);
  }, [mode]);

  // Supabase mode: follow fresh server data after router.refresh().
  useEffect(() => {
    if (mode !== "supabase") return;
    setProducts(initial.products);
    setCategories(initial.categories);
    setSettings(initial.settings);
  }, [mode, initial.products, initial.categories, initial.settings]);

  const persistCatalog = useCallback((p: Product[], c: Category[]) => {
    writeLocal(STORAGE_KEYS.catalog, { products: p, categories: c });
  }, []);

  const saveProduct = useCallback(
    async (p: Product): Promise<ActionResult> => {
      if (mode === "supabase") {
        const r = await saveProductAction(p);
        if (r.ok) {
          setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]));
          router.refresh();
        }
        return { ok: r.ok, error: r.error };
      }
      if (products.some((x) => x.slug === p.slug && x.id !== p.id)) return { ok: false, error: "Another product already uses this URL slug." };
      const next = products.some((x) => x.id === p.id) ? products.map((x) => (x.id === p.id ? p : x)) : [p, ...products];
      setProducts(next);
      persistCatalog(next, categories);
      return { ok: true };
    },
    [mode, products, categories, persistCatalog, router],
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<ActionResult> => {
      if (mode === "supabase") {
        const r = await deleteProductAction(id);
        if (r.ok) {
          setProducts((l) => l.filter((x) => x.id !== id));
          router.refresh();
        }
        return { ok: r.ok, error: r.error };
      }
      const next = products.filter((x) => x.id !== id);
      setProducts(next);
      persistCatalog(next, categories);
      return { ok: true };
    },
    [mode, products, categories, persistCatalog, router],
  );

  const saveCategory = useCallback(
    async (c: Category): Promise<ActionResult> => {
      if (categories.some((x) => x.slug === c.slug && x.id !== c.id)) return { ok: false, error: "Another category already uses this slug." };
      if (mode === "supabase") {
        const r = await saveCategoryAction(c);
        if (r.ok) router.refresh();
        return { ok: r.ok, error: r.error };
      }
      const next = (categories.some((x) => x.id === c.id) ? categories.map((x) => (x.id === c.id ? c : x)) : [...categories, c]).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      setCategories(next);
      persistCatalog(products, next);
      return { ok: true };
    },
    [mode, categories, products, persistCatalog, router],
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<ActionResult> => {
      if (mode === "supabase") {
        const r = await deleteCategoryAction(id);
        if (r.ok) router.refresh();
        return { ok: r.ok, error: r.error };
      }
      const nextC = categories.filter((x) => x.id !== id);
      const nextP = products.map((p) => (p.categoryId === id ? { ...p, categoryId: null } : p));
      setCategories(nextC);
      setProducts(nextP);
      persistCatalog(nextP, nextC);
      return { ok: true };
    },
    [mode, categories, products, persistCatalog, router],
  );

  const setVariantStock = useCallback(
    async (productId: string, variantId: string, stock: number): Promise<ActionResult> => {
      const apply = (list: Product[]) =>
        list.map((p) => (p.id === productId ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock } : v)) } : p));
      if (mode === "supabase") {
        const r = await updateStockAction(variantId, stock);
        if (r.ok) setProducts(apply);
        return { ok: r.ok, error: r.error };
      }
      const next = apply(products);
      setProducts(next);
      persistCatalog(next, categories);
      return { ok: true };
    },
    [mode, products, categories, persistCatalog],
  );

  const consumeDemoStock = useCallback<StoreDataValue["consumeDemoStock"]>(
    (items) => {
      if (mode !== "demo") return;
      const next = products.map((p) => {
        const mine = items.filter((i) => i.productId === p.id);
        if (!mine.length) return p;
        return {
          ...p,
          popularity: p.popularity + mine.reduce((s, i) => s + i.quantity, 0),
          variants: p.variants.map((v) => {
            const hit = mine.find((i) => i.variantId === v.id);
            return hit ? { ...v, stock: Math.max(0, v.stock - hit.quantity) } : v;
          }),
        };
      });
      setProducts(next);
      persistCatalog(next, categories);
    },
    [mode, products, categories, persistCatalog],
  );

  const saveSettings = useCallback(
    async (s: StoreSettings): Promise<ActionResult> => {
      if (mode === "supabase") {
        const r = await saveSettingsAction(s);
        if (r.ok) {
          setSettings(s);
          router.refresh();
        }
        return { ok: r.ok, error: r.error };
      }
      setSettings(s);
      writeLocal(STORAGE_KEYS.settings, s);
      return { ok: true };
    },
    [mode, router],
  );

  const resetDemoData = useCallback(() => {
    clearDemoData();
    setProducts(seedProducts);
    setCategories(seedCategories);
    setSettings(seedSettings);
  }, []);

  const value = useMemo<StoreDataValue>(() => {
    const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
    const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
    return {
      mode,
      hydrated,
      loadError: initial.error,
      products,
      activeProducts: products.filter((p) => p.status === "active"),
      categories,
      settings,
      categoryById,
      categoryBySlug,
      getProduct: (k) => products.find((p) => p.id === k || p.slug === k),
      saveProduct,
      deleteProduct,
      saveCategory,
      deleteCategory,
      setVariantStock,
      consumeDemoStock,
      saveSettings,
      resetDemoData,
    };
  }, [mode, hydrated, initial.error, products, categories, settings, saveProduct, deleteProduct, saveCategory, deleteCategory, setVariantStock, consumeDemoStock, saveSettings, resetDemoData]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoreData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStoreData must be used inside StoreDataProvider");
  return ctx;
}
