import type { AppUser } from "@/types";
import { STORAGE_KEYS, readLocal, writeLocal, removeLocal } from "./storage";
import { newId } from "@/lib/utils";

/**
 * Demo-only accounts kept in localStorage. This is NOT secure authentication;
 * it exists so the storefront and admin can be explored without Supabase.
 */
export const DEMO_ADMIN = { email: "admin@demo.store", password: "demo-admin-2026" };
export const DEMO_CUSTOMER = { email: "customer@demo.store", password: "demo-customer" };

interface DemoAccount extends AppUser {
  passwordHash: string;
  createdAt: string;
}

async function hash(pw: string) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("adh-demo:" + pw));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return "plain:" + pw;
}

async function accounts(): Promise<DemoAccount[]> {
  const list = readLocal<DemoAccount[]>(STORAGE_KEYS.users, []);
  if (list.length) return list;
  const seeded: DemoAccount[] = [
    {
      id: "demo-admin",
      email: DEMO_ADMIN.email,
      fullName: "Demo Admin",
      role: "admin",
      phone: null,
      passwordHash: await hash(DEMO_ADMIN.password),
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-customer",
      email: DEMO_CUSTOMER.email,
      fullName: "Demo Customer",
      role: "customer",
      phone: null,
      passwordHash: await hash(DEMO_CUSTOMER.password),
      createdAt: new Date().toISOString(),
    },
  ];
  writeLocal(STORAGE_KEYS.users, seeded);
  return seeded;
}

const strip = ({ passwordHash: _p, createdAt: _c, ...u }: DemoAccount): AppUser => u;

export function getDemoSession(): AppUser | null {
  return readLocal<AppUser | null>(STORAGE_KEYS.session, null);
}

export async function demoSignIn(email: string, password: string) {
  const list = await accounts();
  const acc = list.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!acc || acc.passwordHash !== (await hash(password))) return { error: "Email or password is incorrect." };
  const user = strip(acc);
  writeLocal(STORAGE_KEYS.session, user);
  return { user };
}

export async function demoSignUp(fullName: string, email: string, password: string) {
  const list = await accounts();
  if (list.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
    return { error: "An account with this email already exists. Sign in instead." };
  }
  const acc: DemoAccount = {
    id: newId(),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role: "customer",
    phone: null,
    passwordHash: await hash(password),
    createdAt: new Date().toISOString(),
  };
  writeLocal(STORAGE_KEYS.users, [...list, acc]);
  const user = strip(acc);
  writeLocal(STORAGE_KEYS.session, user);
  return { user };
}

export function demoSignOut() {
  removeLocal(STORAGE_KEYS.session);
}

export async function demoUpdateProfile(id: string, patch: { fullName: string; phone?: string | null }) {
  const list = await accounts();
  const next = list.map((a) => (a.id === id ? { ...a, fullName: patch.fullName, phone: patch.phone ?? null } : a));
  writeLocal(STORAGE_KEYS.users, next);
  const acc = next.find((a) => a.id === id);
  if (!acc) return { error: "Account not found." };
  const user = strip(acc);
  writeLocal(STORAGE_KEYS.session, user);
  return { user };
}

export async function demoResetPassword(email: string, password: string) {
  const list = await accounts();
  const idx = list.findIndex((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (idx < 0) return { error: "No demo account uses that email." };
  list[idx] = { ...list[idx], passwordHash: await hash(password) };
  writeLocal(STORAGE_KEYS.users, list);
  return {};
}

export async function listDemoAccounts() {
  return (await accounts()).map((a) => ({ ...strip(a), createdAt: a.createdAt }));
}
