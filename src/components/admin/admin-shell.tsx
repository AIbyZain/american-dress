"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, FolderTree, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Store, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useStoreData } from "@/context/store-data-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[14px] transition-colors",
                active ? "bg-ivory/10 text-ivory" : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
              {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" aria-hidden /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Demo-mode guard. With Supabase, the server layout has already verified the admin role. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { mode, loadAdminCatalog } = useStoreData();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== "admin") router.replace("/admin/login?error=forbidden");
  }, [loading, user, router, pathname]);

  const isAdmin = user?.role === "admin";
  useEffect(() => {
    if (isAdmin) void loadAdminCatalog();
  }, [isAdmin, loadAdminCatalog]);

  if (loading || !user || user.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center bg-mist text-[14px] text-muted">Checking access…</div>;
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-ink px-4 py-6 text-ivory">
      <Link href="/admin" className="px-3">
        <span className="block font-serif text-xl">American Dress House</span>
        <span className="mt-1 block text-[12px] text-gold">Store admin</span>
      </Link>
      <nav className="mt-8 flex-1" aria-label="Admin">
        <NavList onNavigate={() => setOpen(false)} />
      </nav>
      <div className="space-y-0.5 border-t border-ivory/10 pt-4 text-[14px]">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-ivory/60 hover:text-ivory">
          <Store className="h-4 w-4" aria-hidden /> View store
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace("/admin/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-ivory/60 hover:text-ivory"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-[12px] text-ivory/40">{user.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      <div className="min-w-0">
        <div className="flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="p-2" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" title="Admin menu" hideTitle className="bg-ink p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          <span className="font-serif text-lg">Store admin</span>
          <span className="w-9" />
        </div>
        {mode === "demo" ? (
          <div className="border-b border-gold/30 bg-ivory px-6 py-2.5 text-[13px] text-ink/80" role="note">
            Demo mode. Changes are saved in this browser only, and figures include generated sample orders. They are not real sales.
          </div>
        ) : null}
        <main className="px-4 py-8 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, intro, actions }: { title: string; intro?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
        {intro ? <p className="mt-1.5 text-[14px] text-muted">{intro}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className, action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[15px] font-medium">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
