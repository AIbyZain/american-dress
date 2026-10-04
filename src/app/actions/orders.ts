"use server";

import { z } from "zod";
import type { ActionResult, Address, Order } from "@/types";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth.server";
import { ORDER_SELECT, mapOrder, type OrderRow } from "@/lib/supabase/mappers";
import { getPaymentProvider } from "@/lib/payments";

const DEMO_MSG = "Online ordering isn't connected yet. The store is running in demo mode.";

const itemsSchema = z
  .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
  .min(1, "Your bag is empty.")
  .max(50);

/**
 * Places an order through the `place_order` database function, which re-reads prices
 * and stock on the server. Prices sent from the browser are never used.
 */
export async function placeOrderAction(input: {
  items: { variantId: string; quantity: number }[];
  checkout: CheckoutInput;
}): Promise<ActionResult<{ orderId: string }>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, error: DEMO_MSG };

  const user = await getServerUser();
  if (!user) return { ok: false, error: "Sign in to place your order." };

  const checkout = checkoutSchema.safeParse(input.checkout);
  if (!checkout.success) return { ok: false, error: checkout.error.issues[0]?.message ?? "Check your details." };
  const items = itemsSchema.safeParse(input.items);
  if (!items.success) return { ok: false, error: items.error.issues[0]?.message ?? "Check your bag." };

  const c = checkout.data;
  const shipping: Address = {
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    line1: c.line1,
    line2: c.line2 || undefined,
    city: c.city,
    province: c.province,
    postalCode: c.postalCode || undefined,
    country: "Pakistan",
  };

  const { data, error } = await supabase.rpc("place_order", {
    p_items: items.data,
    p_shipping: shipping,
    p_email: c.email,
    p_payment_method: c.paymentMethod,
    p_notes: c.notes || null,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "The order could not be placed." };

  const orderId = String(data);
  const { data: totals } = await supabase.from("orders").select("total, currency").eq("id", orderId).single();
  const payment = await getPaymentProvider(c.paymentMethod).createPayment({
    orderId,
    amount: Number(totals?.total ?? 0),
    currency: String(totals?.currency ?? "PKR"),
  });
  if (payment.status === "failed") return { ok: false, error: payment.message ?? "Payment could not be started." };

  return { ok: true, data: { orderId } };
}

export async function getMyOrdersAction(): Promise<ActionResult<Order[]>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, error: DEMO_MSG };
  const user = await getServerUser();
  if (!user) return { ok: false, error: "Sign in to see your orders." };
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: ((data ?? []) as OrderRow[]).map(mapOrder) };
}

/** Row Level Security limits this to the customer's own orders (or any order for admins). */
export async function getOrderAction(id: string): Promise<ActionResult<Order>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, error: DEMO_MSG };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Order not found." };
  const user = await getServerUser();
  if (!user) return { ok: false, error: "Sign in to see this order." };
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Order not found." };
  return { ok: true, data: mapOrder(data as OrderRow) };
}
