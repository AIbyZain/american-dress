"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { newsletterSchema } from "@/lib/validation";
import { useStoreData } from "@/context/store-data-context";
import { STORAGE_KEYS, readLocal, writeLocal } from "@/lib/demo/storage";
import { subscribeNewsletterAction } from "@/app/actions/account";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "light", id = "newsletter-email" }: { tone?: "light" | "dark"; id?: string }) {
  const { mode } = useStoreData();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError(null);
    setBusy(true);
    if (mode === "demo") {
      const list = readLocal<string[]>(STORAGE_KEYS.newsletter, []);
      writeLocal(STORAGE_KEYS.newsletter, Array.from(new Set([...list, parsed.data.email.toLowerCase()])));
      toast.success("Subscribed (demo)", { description: "Saved in this browser only. No email list is connected yet." });
    } else {
      const r = await subscribeNewsletterAction(parsed.data.email);
      if (r.ok) toast.success("Subscribed", { description: "You'll hear about new arrivals and wedding season edits." });
      else toast.error(r.error ?? "Couldn't subscribe right now.");
    }
    setBusy(false);
    setEmail("");
  }

  const dark = tone === "dark";
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={cn("flex border-b", dark ? "border-ivory/40 focus-within:border-ivory" : "border-ink/30 focus-within:border-ink")}>
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn(
            "h-12 w-full bg-transparent text-[15px] focus:outline-none",
            dark ? "text-ivory placeholder:text-ivory/50" : "text-ink placeholder:text-muted",
          )}
        />
        <Button type="submit" variant="link" disabled={busy} className={cn("no-underline", dark && "text-ivory hover:text-gold")}>
          Subscribe
        </Button>
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className={cn("mt-2 text-[13px]", dark ? "text-[#E6B4AC]" : "text-danger")}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
