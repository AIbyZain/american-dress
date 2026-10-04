"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";

export function SignupForm() {
  const router = useRouter();
  const { signUp, mode } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirm: "" },
  });
  const e = formState.errors;

  if (sent) {
    return (
      <div className="border border-line p-6 text-center text-[15px] leading-relaxed">
        <p className="font-serif text-2xl">Check your email</p>
        <p className="mt-2 text-muted">We've sent a link to confirm your account. Open it to finish signing up.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (v) => {
        setError(null);
        const r = await signUp({ fullName: v.fullName, email: v.email, password: v.password });
        if (r.error) return setError(r.error);
        if (r.needsConfirmation) return setSent(true);
        toast.success(mode === "demo" ? "Demo account created" : "Account created");
        router.replace("/account");
      })}
    >
      {mode === "demo" ? (
        <p className="border border-gold/40 bg-ivory p-3 text-[13px]">Demo mode: this account is stored in this browser only.</p>
      ) : null}
      <Field id="fullName" label="Full name" error={e.fullName?.message}>
        <Input id="fullName" autoComplete="name" aria-invalid={!!e.fullName} {...register("fullName")} />
      </Field>
      <Field id="email" label="Email" error={e.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
      </Field>
      <Field id="password" label="Password" error={e.password?.message} hint="At least 8 characters.">
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!e.password} {...register("password")} />
      </Field>
      <Field id="confirm" label="Confirm password" error={e.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!e.confirm} {...register("confirm")} />
      </Field>
      {error ? (
        <p role="alert" className="text-[14px] text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
