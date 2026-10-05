"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import type { ActionResult, CustomerSummary, Order, OrderStatus, PaymentStatus, Product } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthError, requireAdmin } from "@/lib/auth.server";
import { ORDER_SELECT, PRODUCT_SELECT, mapOrder, mapProduct, type OrderRow, type ProductRow } from "@/lib/supabase/mappers";
import { CATALOG_TAG } from "@/lib/cache-tags";
import { errorMessage } from "@/lib/utils";

const DEMO_MSG = "Supabase isn't configured. Admin changes are stored in this browser in demo mode.";

/** Every admin action verifies the admin role on the server before touching data. */
async function adminClient() {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new AuthError(DEMO_MSG);
  await requireAdmin();
  return supabase;
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }
}

const uuid = z.string().uuid();

const productPayload = z.object({
  id: uuid,
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(120),
  name: z.string().min(2).max(120),
  description: z.string().max(2000),
  details: z.array(z.string().max(200)).max(20),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable(),
  categoryId: uuid.nullable(),
  collections: z.array(z.string().max(60)).max(10),
  colors: z.array(z.object({ name: z.string().min(1).max(40), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).min(1).max(20),
  sizes: z.array(z.string().min(1).max(20)).min(1).max(30),
  images: z.array(z.object({ url: z.string().min(1).max(1000), alt: z.string().max(200) })).min(1).max(12),
  variants: z
    .array(
      z.object({
        id: uuid,
        size: z.string(),
        color: z.string(),
        sku: z.string().min(1).max(80),
        stock: z.number().int().min(0),
        priceOverride: z.number().min(0).nullable(),
      }),
    )
    .min(1)
    .max(400),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  popularity: z.number().int(),
  status: z.enum(["active", "draft"]),
});

function refresh() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

/** Full catalogue including drafts, for the admin screens. */
export async function adminListProductsAction(): Promise<ActionResult<Product[]>> {
  return run(async () => {
    const supabase = await adminClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as ProductRow[]).map(mapProduct);
  });
}

export async function saveProductAction(input: unknown) {
  return run(async () => {
    const supabase = await adminClient();
    const p = productPayload.parse(input);
    const { error } = await supabase.from("products").upsert({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      details: p.details,
      price: p.price,
      compare_at_price: p.compareAtPrice,
      category_id: p.categoryId,
      collections: p.collections,
      colors: p.colors,
      sizes: p.sizes,
      is_featured: p.isFeatured,
      is_bestseller: p.isBestseller,
      is_new: p.isNew,
      popularity: p.popularity,
      status: p.status,
    });
    if (error) throw error;

    const del = await supabase.from("product_images").delete().eq("product_id", p.id);
    if (del.error) throw del.error;
    const imgs = await supabase
      .from("product_images")
      .insert(p.images.map((im, i) => ({ product_id: p.id, url: im.url, alt: im.alt, sort_order: i })));
    if (imgs.error) throw imgs.error;

    const existing = await supabase.from("product_variants").select("id").eq("product_id", p.id);
    if (existing.error) throw existing.error;
    const keep = new Set(p.variants.map((v) => v.id));
    const remove = (existing.data ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
    if (remove.length) {
      const r = await supabase.from("product_variants").delete().in("id", remove);
      if (r.error) throw r.error;
    }
    const vars = await supabase.from("product_variants").upsert(
      p.variants.map((v) => ({ id: v.id, product_id: p.id, sku: v.sku, size: v.size, color: v.color, price_override: v.priceOverride })),
    );
    if (vars.error) throw vars.error;
    const inv = await supabase
      .from("inventory")
      .upsert(p.variants.map((v) => ({ variant_id: v.id, quantity: v.stock })), { onConflict: "variant_id" });
    if (inv.error) throw inv.error;
    refresh();
    return undefined;
  });
}

export async function deleteProductAction(id: string) {
  return run(async () => {
    const supabase = await adminClient();
    const { error } = await supabase.from("products").delete().eq("id", uuid.parse(id));
    if (error) throw error;
    refresh();
    return undefined;
  });
}

const categoryPayload = z.object({
  id: uuid,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(60),
  description: z.string().max(300),
  image: z.string().max(1000).nullable(),
  sortOrder: z.number().int().min(0),
});

export async function saveCategoryAction(input: unknown) {
  return run(async () => {
    const supabase = await adminClient();
    const c = categoryPayload.parse(input);
    const { error } = await supabase.from("categories").upsert({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image_url: c.image,
      sort_order: c.sortOrder,
    });
    if (error) throw error;
    refresh();
    return undefined;
  });
}

export async function deleteCategoryAction(id: string) {
  return run(async () => {
    const supabase = await adminClient();
    const { error } = await supabase.from("categories").delete().eq("id", uuid.parse(id));
    if (error) throw error;
    refresh();
    return undefined;
  });
}

export async function updateStockAction(variantId: string, quantity: number) {
  return run(async () => {
    const supabase = await adminClient();
    const q = z.number().int().min(0).max(100000).parse(quantity);
    const { error } = await supabase
      .from("inventory")
      .upsert({ variant_id: uuid.parse(variantId), quantity: q }, { onConflict: "variant_id" });
    if (error) throw error;
    refresh();
    return undefined;
  });
}

export async function adminListOrdersAction(): Promise<ActionResult<Order[]>> {
  return run(async () => {
    const supabase = await adminClient();
    const { data, error } = await supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return ((data ?? []) as OrderRow[]).map(mapOrder);
  });
}

const statusSchema = z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);
const paymentSchema = z.enum(["unpaid", "paid", "refunded"]);

export async function updateOrderStatusAction(id: string, status: OrderStatus, paymentStatus?: PaymentStatus) {
  return run(async () => {
    const supabase = await adminClient();
    const patch: Record<string, string> = { status: statusSchema.parse(status) };
    if (paymentStatus) patch.payment_status = paymentSchema.parse(paymentStatus);
    const { error } = await supabase.from("orders").update(patch).eq("id", uuid.parse(id));
    if (error) throw error;
    return undefined;
  });
}

export async function adminListCustomersAction(): Promise<ActionResult<CustomerSummary[]>> {
  return run(async () => {
    const supabase = await adminClient();
    const [profiles, roles, orders] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("orders").select("user_id, total, status"),
    ]);
    if (profiles.error) throw profiles.error;
    const roleMap = new Map((roles.data ?? []).map((r) => [r.user_id as string, r.role as string]));
    const stats = new Map<string, { count: number; total: number }>();
    for (const o of orders.data ?? []) {
      if (!o.user_id || o.status === "cancelled") continue;
      const s = stats.get(o.user_id as string) ?? { count: 0, total: 0 };
      s.count += 1;
      s.total += Number(o.total);
      stats.set(o.user_id as string, s);
    }
    return (profiles.data ?? []).map((p): CustomerSummary => ({
      id: p.id as string,
      email: p.email as string,
      fullName: (p.full_name as string | null) ?? "",
      role: roleMap.get(p.id as string) === "admin" ? "admin" : "customer",
      orderCount: stats.get(p.id as string)?.count ?? 0,
      totalSpent: stats.get(p.id as string)?.total ?? 0,
      joinedAt: p.created_at as string,
    }));
  });
}

const settingsPayload = z.object({
  storeName: z.string().min(2).max(80),
  currency: z.string().regex(/^[A-Z]{3}$/),
  currencyLocale: z.string().min(2).max(10),
  shippingFlatFee: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  announcement: z.string().max(140),
  contactEmail: z.string().max(120),
  contactPhone: z.string().max(30),
  address: z.string().max(200),
});

export async function saveSettingsAction(input: unknown) {
  return run(async () => {
    const supabase = await adminClient();
    const s = settingsPayload.parse(input);
    const { error } = await supabase.from("store_settings").upsert({
      id: 1,
      store_name: s.storeName,
      currency: s.currency,
      currency_locale: s.currencyLocale,
      shipping_flat_fee: s.shippingFlatFee,
      free_shipping_threshold: s.freeShippingThreshold,
      announcement: s.announcement,
      contact_email: s.contactEmail,
      contact_phone: s.contactPhone,
      address: s.address,
    });
    if (error) throw error;
    refresh();
    return undefined;
  });
}
