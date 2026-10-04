"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
  { href: "/wishlist", label: "Wishlist" },
];

/** In Supabase mode the server layout already blocks signed-out visitors; this guard covers demo mode. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) return <div className="container min-h-[50vh] py-16" aria-busy="true" />;

  return (
    <>
      <PageHeader title={`Hello, ${user.fullName.split(" ")[0] || "there"}`} crumbs={[{ label: "Account" }]} />
      <div className="container grid gap-10 py-10 md:grid-cols-[200px_1fr] md:py-14 lg:gap-16">
        <nav aria-label="Account">
          <ul className="flex gap-5 overflow-x-auto border-b border-line pb-3 text-[14px] md:flex-col md:gap-3 md:border-0">
            {nav.map((n) => {
              const active = n.href === "/account" ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("whitespace-nowrap", active ? "font-medium text-ink" : "text-muted hover:text-ink")}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
            {user.role === "admin" ? (
              <li>
                <Link href="/admin" className="whitespace-nowrap text-gold-dark hover:text-ink">
                  Admin
                </Link>
              </li>
            ) : null}
            <li>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.replace("/");
                }}
                className="whitespace-nowrap text-muted hover:text-ink"
              >
                Sign out
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
