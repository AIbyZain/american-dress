"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { forgotSchema, resetSchema, type ForgotInput, type ResetInput } from "@/lib/validation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const { mode, requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  if (mode === "demo") return <DemoResetForm />;

  if (sent) {
    return (
      <div className="border border-line p-6 text-center text-[15px]">
        <p className="font-serif text-2xl">Check your email</p>
        <p className="mt-2 text-muted">If an account uses that address, a reset link is on its way.</p>
      </div>
    );
  }
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (v) => {
        const r = await requestPasswordReset(v.email);
        if (r.error) setError(r.error);
        else setSent(true);
      })}
    >
      <Field id="email" label="Email" error={formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>
      {error ? <p role="alert" className="text-[14px] text-danger">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}

const demoResetSchema = z
  .object({ email: z.string().email("Enter a valid email address"), password: z.string().min(8, "Use at least 8 characters"), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function DemoResetForm() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof demoResetSchema>>({
    resolver: zodResolver(demoResetSchema),
    defaultValues: { email: "", password: "", confirm: "" },
  });
  const e = formState.errors;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (v) => {
        const r = await updatePassword(v.password, v.email);
        if (r.error) return setError(r.error);
        toast.success("Demo password updated");
        router.push("/login");
      })}
    >
      <p className="border border-gold/40 bg-ivory p-3 text-[13px] leading-relaxed">
        Demo mode: no email is sent. Set a new password for a demo account stored in this browser.
      </p>
      <Field id="email" label="Email" error={e.email?.message}>
        <Input id="email" type="email" {...register("email")} />
      </Field>
      <Field id="password" label="New password" error={e.password?.message}>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field id="confirm" label="Confirm new password" error={e.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
      </Field>
      {error ? <p role="alert" className="text-[14px] text-danger">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full">
        Update password
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const { updatePassword, mode } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ResetInput>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } });
  if (mode === "demo") {
    return (
      <p className="text-center text-[15px] text-muted">
        In demo mode, reset passwords from the{" "}
        <Link href="/forgot-password" className="text-ink underline underline-offset-4">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (v) => {
        const r = await updatePassword(v.password);
        if (r.error) return setError(r.error);
        toast.success("Password updated");
        router.replace("/account");
      })}
    >
      <Field id="password" label="New password" error={formState.errors.password?.message}>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Field id="confirm" label="Confirm new password" error={formState.errors.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
      </Field>
      {error ? <p role="alert" className="text-[14px] text-danger">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        Save new password
      </Button>
    </form>
  );
}
