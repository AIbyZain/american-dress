export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when both public Supabase variables are set. Otherwise the app runs in demo mode. */
export function isSupabaseConfigured() {
  return SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
}

export function getDataMode(): "demo" | "supabase" {
  return isSupabaseConfigured() ? "supabase" : "demo";
}
