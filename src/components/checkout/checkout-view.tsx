"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import type { Order } from "@/types";
import { checkoutSchema, pakistanProvinces, type CheckoutInput } from "@/lib/validation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useStoreData } from "@/context/store-data-context";
import { paymentMethods } from "@/lib/payments";
import { shippingFee } from "@/lib/pricing";
import { newId } from "@/lib/utils";
import { saveDemoOrder } from "@/lib/services/orders.client";
import { placeOrderAction } from "@/app/actions/orders";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import { Field } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DemoNotice } from "@/components/shared/demo-notice";
import { SmartImage } from "@/components/shared/smart-image";
import { OrderSummaryTotals } from "@/components/cart/order-summary";
import { usePrice } from "@/components/shared/price";
import { cn } from "@/lib/utils";

export function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, hydrated, clear } = useCart();
  const { user, mode } = useAuth();
  const { settings, consumeDemoStock } = useStoreData();
  const fmt = usePrice();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "Rawalpindi",
      province: "Punjab",
      postalCode: "",
      paymentMethod: "cod",
      notes: "",
    },
  });
  const { register, handleSubmit, formState, watch, reset, getValues } = form;
  const errors = formState.errors;
  const method = watch("paymentMethod");

  useEffect(() => {
    if (user) reset({ ...getValues(), email: getValues("email") || user.email, fullName: getValues("fullName") || user.fullName, phone: getValues("phone") || user.phone || "" });
  }, [user, reset, getValues]);

  if (!hydrated) return <div className="container min-h-[50vh] py-16" aria-busy="true" />;
  if (!lines.length) {
    return <EmptyState title="Your bag is empty" body="Add something to your bag before checking out." action={{ label: "Shop the collection", href: "/shop" }} />;
  }

  const blocked = lines.some((l) => l.variant.stock < l.quantity);

  async function onSubmit(values: CheckoutInput) {
    if (blocked) {
      setServerError("Some items have less stock than requested. Update your bag first.");
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      if (mode === "supabase") {
        const r = await placeOrderAction({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), checkout: values });
        if (!r.ok || !r.data) throw new Error(r.error ?? "The order could not be placed.");
        clear();
        router.push(`/order-confirmation/${r.data.orderId}`);
        router.refresh();
        return;
      }
      // Demo mode: order is stored in this browser only. Nothing is charged or sent.
      const fee = shippingFee(subtotal, settings, values.paymentMethod);
      const now = new Date();
      const order: Order = {
        id: newId(),
        number: `DEMO-${now.toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        userId: user?.id ?? null,
        email: values.email.toLowerCase(),
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: values.paymentMethod,
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          name: l.product.name,
          size: l.variant.size,
          color: l.variant.color,
          image: l.product.images[0]?.url ?? null,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
        subtotal,
        shippingFee: fee,
        total: subtotal + fee,
        currency: settings.currency,
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
          line1: values.line1,
          line2: values.line2 || undefined,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode || undefined,
          country: "Pakistan",
        },
        notes: values.notes || null,
        createdAt: now.toISOString(),
        isDemo: true,
      };
      saveDemoOrder(order);
      consumeDemoStock(lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })));
      clear();
      router.push(`/order-confirmation/${order.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "The order could not be placed.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldProps = (name: keyof CheckoutInput) => ({
    id: name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${String(name)}-msg` : undefined,
    ...register(name),
  });

  return (
    <div className="container grid gap-12 py-10 md:py-14 lg:grid-cols-[1fr_400px] lg:gap-16">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
        <DemoNotice>
          Demo checkout: your order is saved in this browser only. No payment is taken and the store is not notified.
        </DemoNotice>

        <section aria-labelledby="contact-h">
          <div className="flex items-baseline justify-between">
            <h2 id="contact-h" className="font-serif text-2xl">
              Contact
            </h2>
            {!user ? (
              <Link href="/login?next=/checkout" className="text-[13px] underline underline-offset-4">
                Sign in for faster checkout
              </Link>
            ) : null}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...fieldProps("email")} />
            </Field>
            <Field id="phone" label="Mobile number" error={errors.phone?.message} hint="For delivery updates from the courier.">
              <Input type="tel" autoComplete="tel" placeholder="0300 1234567" {...fieldProps("phone")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="ship-h">
          <h2 id="ship-h" className="font-serif text-2xl">
            Delivery address
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field id="fullName" label="Full name" error={errors.fullName?.message} className="sm:col-span-2">
              <Input autoComplete="name" {...fieldProps("fullName")} />
            </Field>
            <Field id="line1" label="Street address" error={errors.line1?.message} className="sm:col-span-2">
              <Input autoComplete="address-line1" placeholder="House, street, area" {...fieldProps("line1")} />
            </Field>
            <Field id="line2" label="Apartment, landmark (optional)" error={errors.line2?.message} className="sm:col-span-2">
              <Input autoComplete="address-line2" {...fieldProps("line2")} />
            </Field>
            <Field id="city" label="City" error={errors.city?.message}>
              <Input autoComplete="address-level2" {...fieldProps("city")} />
            </Field>
            <Field id="province" label="Province" error={errors.province?.message}>
              <NativeSelect autoComplete="address-level1" {...fieldProps("province")}>
                {pakistanProvinces.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="postalCode" label="Postal code (optional)" error={errors.postalCode?.message}>
              <Input autoComplete="postal-code" inputMode="numeric" {...fieldProps("postalCode")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="pay-h">
          <h2 id="pay-h" className="font-serif text-2xl">
            Payment
          </h2>
          <p className="mt-2 text-[14px] text-muted">No card details are collected online. Choose how you'd like to pay.</p>
          <div className="mt-5 grid gap-3" role="radiogroup" aria-labelledby="pay-h">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={cn("flex cursor-pointer gap-3 border p-4 transition-colors", method === m.id ? "border-ink" : "border-line hover:border-ink/50")}
              >
                <input type="radio" value={m.id} {...register("paymentMethod")} className="mt-1 h-4 w-4 accent-ink" />
                <span>
                  <span className="block text-[15px] font-medium">{m.label}</span>
                  <span className="block text-[13px] text-muted">{m.description}</span>
                </span>
              </label>
            ))}
          </div>
          <Field id="notes" label="Order notes (optional)" error={errors.notes?.message} className="mt-5">
            <Textarea placeholder="Alteration requests, delivery timing…" {...fieldProps("notes")} />
          </Field>
        </section>

        {serverError ? (
          <p role="alert" className="border border-danger/30 bg-danger/5 px-4 py-3 text-[14px] text-danger">
            {serverError}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
          <Lock aria-hidden />
          {submitting ? "Placing order…" : mode === "demo" ? "Place demo order" : "Place order"}
        </Button>
      </form>

      <aside className="h-fit bg-mist p-6 lg:sticky lg:top-36" aria-label="Order summary">
        <h2 className="font-serif text-2xl">Your order</h2>
        <ul className="mt-5 space-y-4">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-3">
              <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-white">
                <SmartImage src={l.product.images[0]?.url} alt="" sizes="56px" />
                <span className="absolute -right-0 -top-0 bg-ink px-1.5 text-[11px] text-white">{l.quantity}</span>
              </div>
              <div className="min-w-0 flex-1 text-[14px]">
                <p className="truncate">{l.product.name}</p>
                <p className="text-[12.5px] text-muted">
                  {l.variant.size}, {l.variant.color}
                </p>
                {l.variant.stock < l.quantity ? <p className="text-[12px] text-danger">Only {l.variant.stock} available</p> : null}
              </div>
              <p className="text-[14px]">{fmt(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-line pt-5">
          <OrderSummaryTotals subtotal={subtotal} method={method} />
        </div>
        <Link href="/cart" className="mt-5 inline-block text-[13px] underline underline-offset-4">
          Edit bag
        </Link>
      </aside>
    </div>
  );
}
