import type { AppUser } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Current user from the verified Supabase session. Role is read from the database, never from the client. */
export async function getServerUser(): Promise<AppUser | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const [profile, role] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (profile.data?.full_name as string | null) ?? "",
    phone: (profile.data?.phone as string | null) ?? null,
    role: role.data?.role === "admin" ? "admin" : "customer",
  };
}

export class AuthError extends Error {}

export async function requireUser() {
  const user = await getServerUser();
  if (!user) throw new AuthError("Sign in to continue.");
  return user;
}

export async function requireAdmin() {
  const user = await getServerUser();
  if (!user || user.role !== "admin") throw new AuthError("You don't have permission to do that.");
  return user;
}
