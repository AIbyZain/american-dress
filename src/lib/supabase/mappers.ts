import type { Address, Category, Order, OrderItem, Product, ProductColor, StoreSettings } from "@/types";

/* Row shapes returned by PostgREST. Kept loose because generated DB types are optional. */
interface InventoryRow {
  quantity: number;
}
export interface VariantRow {
  id: string;
  size: string;
  color: string;
  sku: string;
  price_override: number | string | null;
  inventory: InventoryRow | InventoryRow[] | null;
}
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  details: string[] | null;
  price: number | string;
  compare_at_price: number | string | null;
  category_id: string | null;
  collections: string[] | null;
  colors: ProductColor[] | null;
  sizes: string[] | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  popularity: number;
  status: "active" | "draft";
  created_at: string;
  product_images?: { url: string; alt: string | null; sort_order: number }[] | null;
  product_variants?: VariantRow[] | null;
}

export const PRODUCT_SELECT =
  "*, product_images(url, alt, sort_order), product_variants(id, size, color, sku, price_override, inventory(quantity))";

const n = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));

export function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    details: r.details ?? [],
    price: n(r.price),
    compareAtPrice: r.compare_at_price == null ? null : n(r.compare_at_price),
    categoryId: r.category_id,
    collections: r.collections ?? [],
    colors: Array.isArray(r.colors) ? r.colors : [],
    sizes: r.sizes ?? [],
    images: [...(r.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ url: i.url, alt: i.alt ?? r.name })),
    variants: (r.product_variants ?? []).map((v) => {
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
      return {
        id: v.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock: inv?.quantity ?? 0,
        priceOverride: v.price_override == null ? null : n(v.price_override),
      };
    }),
    isFeatured: r.is_featured,
    isBestseller: r.is_bestseller,
    isNew: r.is_new,
    popularity: r.popularity,
    status: r.status,
    createdAt: r.created_at,
  };
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}
export function mapCategory(r: CategoryRow): Category {
  return { id: r.id, slug: r.slug, name: r.name, description: r.description ?? "", image: r.image_url, sortOrder: r.sort_order };
}

export interface SettingsRow {
  store_name: string;
  currency: string;
  currency_locale: string;
  shipping_flat_fee: number | string;
  free_shipping_threshold: number | string;
  announcement: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
}
export function mapSettings(r: SettingsRow): StoreSettings {
  return {
    storeName: r.store_name,
    currency: r.currency,
    currencyLocale: r.currency_locale,
    shippingFlatFee: n(r.shipping_flat_fee),
    freeShippingThreshold: n(r.free_shipping_threshold),
    announcement: r.announcement ?? "",
    contactEmail: r.contact_email ?? "",
    contactPhone: r.contact_phone ?? "",
    address: r.address ?? "",
  };
}

export interface OrderItemRow {
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  size: string;
  color: string;
  image_url: string | null;
  unit_price: number | string;
  quantity: number;
}
export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  status: Order["status"];
  payment_status: Order["paymentStatus"];
  payment_method: string;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  currency: string;
  shipping_address: Address;
  notes: string | null;
  created_at: string;
  order_items?: OrderItemRow[] | null;
}
export const ORDER_SELECT = "*, order_items(product_id, variant_id, product_name, size, color, image_url, unit_price, quantity)";

export function mapOrder(r: OrderRow): Order {
  const items: OrderItem[] = (r.order_items ?? []).map((i) => ({
    productId: i.product_id,
    variantId: i.variant_id,
    name: i.product_name,
    size: i.size,
    color: i.color,
    image: i.image_url,
    unitPrice: n(i.unit_price),
    quantity: i.quantity,
  }));
  return {
    id: r.id,
    number: r.order_number,
    userId: r.user_id,
    email: r.email,
    status: r.status,
    paymentStatus: r.payment_status,
    paymentMethod: r.payment_method,
    items,
    subtotal: n(r.subtotal),
    shippingFee: n(r.shipping_fee),
    total: n(r.total),
    currency: r.currency,
    shippingAddress: r.shipping_address,
    notes: r.notes,
    createdAt: r.created_at,
    isDemo: false,
  };
}
