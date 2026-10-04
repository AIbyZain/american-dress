"use client";

import type { Order, OrderStatus, PaymentStatus } from "@/types";
import { STORAGE_KEYS, readLocal, writeLocal } from "@/lib/demo/storage";
import { getMyOrdersAction, getOrderAction } from "@/app/actions/orders";
import { adminListOrdersAction, updateOrderStatusAction } from "@/app/actions/admin";
import { generateSampleOrders } from "@/lib/demo/sample-orders";
import type { Product, DataMode } from "@/types";

/* Demo orders live in this browser only. */
export function getDemoOrders(): Order[] {
  return readLocal<Order[]>(STORAGE_KEYS.orders, []);
}
export function saveDemoOrder(order: Order) {
  writeLocal(STORAGE_KEYS.orders, [order, ...getDemoOrders()]);
}

export async function fetchMyOrders(mode: DataMode, userId: string | null, email: string | null): Promise<Order[]> {
  if (mode === "supabase") {
    const r = await getMyOrdersAction();
    if (!r.ok) throw new Error(r.error);
    return r.data ?? [];
  }
  return getDemoOrders().filter((o) => (userId && o.userId === userId) || (email && o.email.toLowerCase() === email.toLowerCase()));
}

export async function fetchOrder(mode: DataMode, id: string): Promise<Order | null> {
  if (mode === "supabase") {
    const r = await getOrderAction(id);
    if (!r.ok) throw new Error(r.error);
    return r.data ?? null;
  }
  return getDemoOrders().find((o) => o.id === id) ?? null;
}

/** Admin: real orders in Supabase mode; demo orders from this browser plus generated samples in demo mode. */
export async function fetchAdminOrders(mode: DataMode, products: Product[]): Promise<Order[]> {
  if (mode === "supabase") {
    const r = await adminListOrdersAction();
    if (!r.ok) throw new Error(r.error);
    return r.data ?? [];
  }
  const overrides = readLocal<Record<string, { status: OrderStatus; paymentStatus: PaymentStatus }>>(STORAGE_KEYS.sampleStatus, {});
  const samples = generateSampleOrders(products).map((o) => (overrides[o.id] ? { ...o, ...overrides[o.id] } : o));
  return [...getDemoOrders(), ...samples].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setOrderStatus(mode: DataMode, order: Order, status: OrderStatus, paymentStatus: PaymentStatus) {
  if (mode === "supabase") {
    const r = await updateOrderStatusAction(order.id, status, paymentStatus);
    if (!r.ok) throw new Error(r.error);
    return;
  }
  if (order.isSample) {
    const key = STORAGE_KEYS.sampleStatus;
    const map = readLocal<Record<string, { status: OrderStatus; paymentStatus: PaymentStatus }>>(key, {});
    map[order.id] = { status, paymentStatus };
    writeLocal(key, map);
    return;
  }
  writeLocal(
    STORAGE_KEYS.orders,
    getDemoOrders().map((o) => (o.id === order.id ? { ...o, status, paymentStatus } : o)),
  );
}
