"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser, DataMode } from "@/types";
import { getDataMode } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { demoResetPassword, demoSignIn, demoSignOut, demoSignUp, demoUpdateProfile, getDemoSession } from "@/lib/demo/auth";
import { updateProfileAction } from "@/app/actions/account";

type Result = { error?: string };

interface AuthValue {
  user: AppUser | null;
  loading: boolean;
  mode: DataMode;
  signIn(email: string, password: string): Promise<Result & { user?: AppUser | null }>;
  signUp(input: { fullName: string; email: string; password: string }): Promise<Result & { needsConfirmation?: boolean }>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<Result>;
  updatePassword(password: string, email?: string): Promise<Result>;
  updateProfile(input: { fullName: string; phone?: string }): Promise<Result>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function fetchSupabaseUser(): Promise<AppUser | null> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const [profile, role] = await Promise.all([
    sb.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    sb.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (profile.data?.full_name as string | null) ?? "",
    phone: (profile.data?.phone as string | null) ?? null,
    // Used for showing/hiding UI only. The server and RLS verify the role on every admin request.
    role: role.data?.role === "admin" ? "admin" : "customer",
  };
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: AppUser | null }) {
  const mode = getDataMode();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [loading, setLoading] = useState(mode === "demo" || !initialUser);

  useEffect(() => {
    if (mode === "demo") {
      setUser(getDemoSession());
      setLoading(false);
      return;
    }
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    let active = true;
    fetchSupabaseUser().then((u) => {
      if (!active) return;
      setUser(u);
      setLoading(false);
    });
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
      // Defer DB calls out of the auth callback to avoid client lock contention.
      setTimeout(() => {
        fetchSupabaseUser().then((u) => active && setUser(u));
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [mode]);

  const signIn = useCallback<AuthValue["signIn"]>(
    async (email, password) => {
      if (mode === "demo") {
        const r = await demoSignIn(email, password);
        if (r.error) return { error: r.error };
        setUser(r.user ?? null);
        return { user: r.user };
      }
      const sb = getSupabaseBrowserClient()!;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message === "Invalid login credentials" ? "Email or password is incorrect." : error.message };
      const u = await fetchSupabaseUser();
      setUser(u);
      router.refresh();
      return { user: u };
    },
    [mode, router],
  );

  const signUp = useCallback<AuthValue["signUp"]>(
    async ({ fullName, email, password }) => {
      if (mode === "demo") {
        const r = await demoSignUp(fullName, email, password);
        if (r.error) return { error: r.error };
        setUser(r.user ?? null);
        return {};
      }
      const sb = getSupabaseBrowserClient()!;
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { error: error.message };
      if (!data.session) return { needsConfirmation: true };
      setUser(await fetchSupabaseUser());
      router.refresh();
      return {};
    },
    [mode, router],
  );

  const signOut = useCallback(async () => {
    if (mode === "demo") demoSignOut();
    else await getSupabaseBrowserClient()?.auth.signOut();
    setUser(null);
    router.refresh();
  }, [mode, router]);

  const requestPasswordReset = useCallback<AuthValue["requestPasswordReset"]>(
    async (email) => {
      if (mode === "demo") return {};
      const sb = getSupabaseBrowserClient()!;
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      return error ? { error: error.message } : {};
    },
    [mode],
  );

  const updatePassword = useCallback<AuthValue["updatePassword"]>(
    async (password, email) => {
      if (mode === "demo") {
        if (!email) return { error: "Enter the demo account email." };
        return demoResetPassword(email, password);
      }
      const { error } = await getSupabaseBrowserClient()!.auth.updateUser({ password });
      return error ? { error: error.message } : {};
    },
    [mode],
  );

  const updateProfile = useCallback<AuthValue["updateProfile"]>(
    async (input) => {
      if (!user) return { error: "Sign in first." };
      if (mode === "demo") {
        const r = await demoUpdateProfile(user.id, { fullName: input.fullName, phone: input.phone || null });
        if (r.error) return { error: r.error };
        setUser(r.user ?? null);
        return {};
      }
      const r = await updateProfileAction({ fullName: input.fullName, phone: input.phone ?? "" });
      if (!r.ok) return { error: r.error };
      setUser({ ...user, fullName: input.fullName, phone: input.phone || null });
      return {};
    },
    [mode, user],
  );

  const value = useMemo<AuthValue>(
    () => ({ user, loading, mode, signIn, signUp, signOut, requestPasswordReset, updatePassword, updateProfile }),
    [user, loading, mode, signIn, signUp, signOut, requestPasswordReset, updatePassword, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
