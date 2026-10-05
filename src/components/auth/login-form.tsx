"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";

function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function LoginForm({ variant = "customer" }: { variant?: "customer" | "admin" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn, signOut } = useAuth();
  const [error, setError] = useState<string | null>(params.get("error") === "forbidden" ? "This account doesn't have admin access." : null);

  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const e = formState.errors;

  async function onSubmit(values: LoginInput) {
    setError(null);
    const r = await signIn(values.email, values.password);
    if (r.error) {
      setError(r.error);
      return;
    }
    if (variant === "admin") {
      if (r.user?.role !== "admin") {
        await signOut();
        setError("This account doesn't have admin access.");
        return;
      }
      router.replace(safeNext(params.get("next"), "/admin"));
      return;
    }
    toast.success(`Welcome back${r.user?.fullName ? `, ${r.user.fullName.split(" ")[0]}` : ""}`);
    router.replace(safeNext(params.get("next"), "/account"));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field id="email" label="Email" error={e.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
        </Field>
        <Field id="password" label="Password" error={e.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!e.password} {...register("password")} />
        </Field>
        {variant === "customer" ? (
          <div className="text-right">
            <Link href="/forgot-password" className="text-[13px] text-muted underline underline-offset-4 hover:text-ink">
              Forgot your password?
            </Link>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="text-[14px] text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
