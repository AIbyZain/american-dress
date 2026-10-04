import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerUser } from "@/lib/auth.server";
import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured()) {
    const user = await getServerUser();
    if (!user) redirect("/login?next=/account");
  }
  return <AccountShell>{children}</AccountShell>;
}
