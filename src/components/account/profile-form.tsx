"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import Link from "next/link";

export function ProfileForm() {
  const { user, updateProfile, mode } = useAuth();
  const { register, handleSubmit, reset, formState } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  });
  useEffect(() => {
    if (user) reset({ fullName: user.fullName, phone: user.phone ?? "" });
  }, [user, reset]);
  const e = formState.errors;
  if (!user) return null;
  return (
    <div className="max-w-lg">
      <h2 className="font-serif text-2xl">Profile</h2>
      <form
        noValidate
        className="mt-6 space-y-5"
        onSubmit={handleSubmit(async (v) => {
          const r = await updateProfile({ fullName: v.fullName, phone: v.phone });
          if (r.error) toast.error(r.error);
          else toast.success("Profile saved");
        })}
      >
        <Field id="email" label="Email" hint="Contact the store to change the email on your account.">
          <Input id="email" value={user.email} disabled readOnly />
        </Field>
        <Field id="fullName" label="Full name" error={e.fullName?.message}>
          <Input id="fullName" autoComplete="name" aria-invalid={!!e.fullName} {...register("fullName")} />
        </Field>
        <Field id="phone" label="Mobile number" error={e.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!e.phone} {...register("phone")} />
        </Field>
        <Button type="submit" disabled={formState.isSubmitting}>
          Save profile
        </Button>
      </form>
      <p className="mt-8 text-[14px] text-muted">
        {mode === "supabase" ? (
          <>
            Need a new password?{" "}
            <Link href="/forgot-password" className="text-ink underline underline-offset-4">
              Send a reset link
            </Link>
          </>
        ) : (
          "Demo profile changes are saved in this browser only."
        )}
      </p>
    </div>
  );
}
