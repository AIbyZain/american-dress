import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-ivory lg:flex">
        <span className="font-serif text-2xl">American Dress House</span>
        <p className="max-w-sm font-serif text-4xl leading-tight">Products, stock and orders in one place.</p>
        <p className="text-[13px] text-ivory/50">Store administration</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          <h1 className="font-serif text-4xl">Admin sign in</h1>
          <p className="mt-2 text-[15px] text-muted">Only staff accounts with the admin role can continue.</p>
          <div className="mt-10">
            <Suspense>
              <LoginForm variant="admin" />
            </Suspense>
          </div>
          <Link href="/" className="mt-8 inline-block text-[14px] text-muted underline underline-offset-4 hover:text-ink">
            Back to the store
          </Link>
        </div>
      </div>
    </div>
  );
}
