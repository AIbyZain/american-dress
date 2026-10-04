"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, ShoppingBag, User } from "lucide-react";
import { Logo } from "./logo";
import { SearchSheet } from "./search-sheet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/config/site";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { useStoreData } from "@/context/store-data-context";
import { cn } from "@/lib/utils";

const iconBtn = "relative p-2 text-ink hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

function CountDot({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { ids } = useWishlist();
  const { user } = useAuth();
  const { categories } = useStoreData();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-[2px]">
      <div className="container grid h-[72px] grid-cols-[1fr_auto_1fr] items-center md:h-20">
        <div className="flex items-center gap-1">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger className={cn(iconBtn, "lg:hidden")} aria-label="Open menu">
              <Menu className="h-5 w-5" strokeWidth={1.6} />
            </SheetTrigger>
            <SheetContent side="left" title="Menu">
              <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
                <ul className="divide-y divide-line">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className="block py-3.5 font-serif text-lg">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/collections/wedding-edit" onClick={() => setMenuOpen(false)} className="block py-3.5 font-serif text-lg">
                      The Wedding Edit
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" onClick={() => setMenuOpen(false)} className="block py-3.5 font-serif text-lg">
                      Shop all
                    </Link>
                  </li>
                </ul>
                <ul className="mt-6 space-y-3 text-sm text-muted">
                  <li>
                    <Link href={user ? "/account" : "/login"} onClick={() => setMenuOpen(false)}>
                      {user ? "My account" : "Sign in"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" onClick={() => setMenuOpen(false)}>
                      About the store
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" onClick={() => setMenuOpen(false)}>
                      Contact and directions
                    </Link>
                  </li>
                  <li>
                    <a href={siteConfig.phoneHref}>Call {siteConfig.phone}</a>
                  </li>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
          <SearchSheet />
        </div>

        <Logo />

        <div className="flex items-center justify-end gap-0.5">
          <Link href={user ? "/account" : "/login"} className={cn(iconBtn, "hidden sm:inline-flex")} aria-label={user ? "My account" : "Sign in"}>
            <User className="h-5 w-5" strokeWidth={1.6} />
          </Link>
          <Link href="/wishlist" className={iconBtn} aria-label={`Wishlist, ${ids.length} saved`}>
            <Heart className="h-5 w-5" strokeWidth={1.6} />
            <CountDot n={ids.length} />
          </Link>
          <button type="button" onClick={() => setOpen(true)} className={iconBtn} aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            <CountDot n={count} />
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-line lg:block">
        <ul className="container flex h-11 items-center justify-center gap-9 text-[13.5px] font-medium">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-b py-2.5 transition-colors",
                    active ? "border-gold text-ink" : "border-transparent text-ink/80 hover:border-ink hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
