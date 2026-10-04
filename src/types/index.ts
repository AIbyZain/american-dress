export type UserRole = "customer" | "admin";
export type DataMode = "demo" | "supabase";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceOverride: number | null;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export type ProductStatus = "active" | "draft";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  collections: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  popularity: number;
  status: ProductStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string | null;
  sortOrder: number;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencyLocale: string;
  shippingFlatFee: number;
  freeShippingThreshold: number;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartLine extends CartItem {
  product: Product;
  variant: ProductVariant;
  unitPrice: number;
  lineTotal: number;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  productId: string | null;
  variantId: string | null;
  name: string;
  size: string;
  color: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  notes?: string | null;
  createdAt: string;
  /** True for orders placed in demo mode (stored only in this browser). */
  isDemo: boolean;
  /** True for generated sample orders used to fill demo analytics. */
  isSample?: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
}

export interface CustomerSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
  isSample?: boolean;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}
