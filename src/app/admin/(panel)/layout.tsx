import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getServerUser } from "@/lib/auth.server";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured()) {
    // Role is read from the database for the verified session; never trusted from the browser.
    const user = await getServerUser();
    if (!user) redirect("/admin/login");
    if (user.role !== "admin") redirect("/admin/login?error=forbidden");
  }
  return <AdminShell>{children}</AdminShell>;
}
