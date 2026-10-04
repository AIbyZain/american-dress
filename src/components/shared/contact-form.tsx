"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { siteConfig } from "@/config/site";

/** Messages are not delivered anywhere yet; the form validates and tells the visitor to call instead. */
export function ContactForm() {
  const { register, handleSubmit, reset, formState } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });
  const e = formState.errors;
  return (
    <form
      noValidate
      onSubmit={handleSubmit(() => {
        toast("Message not sent", {
          description: `Online messages aren't connected yet. Please call the store on ${siteConfig.phone}.`,
        });
        reset();
      })}
      className="grid gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Name" error={e.name?.message}>
          <Input id="c-name" autoComplete="name" aria-invalid={!!e.name} {...register("name")} />
        </Field>
        <Field id="c-phone" label="Phone (optional)" error={e.phone?.message}>
          <Input id="c-phone" type="tel" autoComplete="tel" aria-invalid={!!e.phone} {...register("phone")} />
        </Field>
      </div>
      <Field id="c-email" label="Email" error={e.email?.message}>
        <Input id="c-email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
      </Field>
      <Field id="c-message" label="Message" error={e.message?.message}>
        <Textarea id="c-message" rows={6} aria-invalid={!!e.message} {...register("message")} />
      </Field>
      <div>
        <Button type="submit">Send message</Button>
        <p className="mt-3 text-[12.5px] text-muted">Online messages are not connected yet. For anything urgent, call the store.</p>
      </div>
    </form>
  );
}
