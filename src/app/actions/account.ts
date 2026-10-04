"use server";

import { z } from "zod";
import type { ActionResult } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth.server";
import { profileSchema, type ProfileInput } from "@/lib/validation";

const DEMO_MSG = "Supabase isn't configured. This store is running in demo mode.";

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, error: DEMO_MSG };
  const user = await getServerUser();
  if (!user) return { ok: false, error: "Sign in to update your profile." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function wishlistId() {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error(DEMO_MSG);
  const user = await getServerUser();
  if (!user) throw new Error("Sign in to use your wishlist.");
  const existing = await supabase.from("wishlists").select("id").eq("user_id", user.id).maybeSingle();
  if (existing.data?.id) return { supabase, id: existing.data.id as string };
  const created = await supabase.from("wishlists").insert({ user_id: user.id }).select("id").single();
  if (created.error) throw created.error;
  return { supabase, id: created.data.id as string };
}

export async function getWishlistAction(): Promise<ActionResult<string[]>> {
  try {
    const { supabase, id } = await wishlistId();
    const { data, error } = await supabase.from("wishlist_items").select("product_id").eq("wishlist_id", id);
    if (error) throw error;
    return { ok: true, data: (data ?? []).map((r) => r.product_id as string) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Wishlist unavailable." };
  }
}

export async function setWishlistItemAction(productId: string, saved: boolean): Promise<ActionResult> {
  try {
    const pid = z.string().uuid().parse(productId);
    const { supabase, id } = await wishlistId();
    const { error } = saved
      ? await supabase.from("wishlist_items").upsert({ wishlist_id: id, product_id: pid }, { onConflict: "wishlist_id,product_id" })
      : await supabase.from("wishlist_items").delete().eq("wishlist_id", id).eq("product_id", pid);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Wishlist unavailable." };
  }
}

export async function subscribeNewsletterAction(email: string): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, error: DEMO_MSG };
  const parsed = z.string().trim().toLowerCase().email().safeParse(email);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const { error } = await supabase.from("newsletter_subscriptions").insert({ email: parsed.data });
  if (error && error.code !== "23505") return { ok: false, error: "Couldn't subscribe right now. Try again later." };
  return { ok: true };
}
