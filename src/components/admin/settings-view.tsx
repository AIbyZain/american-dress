"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { settingsSchema, type SettingsInput } from "@/lib/validation";
import { useStoreData } from "@/context/store-data-context";
import { AdminPageHeader, Panel } from "./admin-shell";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function SettingsView() {
  const { settings, saveSettings, mode, resetDemoData } = useStoreData();
  const [confirmReset, setConfirmReset] = useState(false);
  const { register, handleSubmit, formState } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      ...settings,
      shippingFlatFee: String(settings.shippingFlatFee),
      freeShippingThreshold: String(settings.freeShippingThreshold),
    },
  });
  const e = formState.errors;

  return (
    <>
      <AdminPageHeader title="Store settings" />
      <form
        noValidate
        onSubmit={handleSubmit(async (v) => {
          const r = await saveSettings({ ...v, shippingFlatFee: Number(v.shippingFlatFee), freeShippingThreshold: Number(v.freeShippingThreshold) });
          if (r.ok) toast.success("Settings saved");
          else toast.error(r.error ?? "Couldn't save settings.");
        })}
        className="grid gap-6 xl:grid-cols-2"
      >
        <Panel title="Store">
          <div className="grid gap-5">
            <Field id="storeName" label="Store name" error={e.storeName?.message}>
              <Input id="storeName" {...register("storeName")} />
            </Field>
            <Field id="announcement" label="Announcement bar" error={e.announcement?.message} hint="Shown at the top of every page. Up to 140 characters.">
              <Input id="announcement" {...register("announcement")} />
            </Field>
            <Field id="contactPhone" label="Contact phone" error={e.contactPhone?.message}>
              <Input id="contactPhone" {...register("contactPhone")} />
            </Field>
            <Field id="contactEmail" label="Contact email" error={e.contactEmail?.message}>
              <Input id="contactEmail" type="email" {...register("contactEmail")} />
            </Field>
            <Field id="address" label="Address" error={e.address?.message}>
              <Input id="address" {...register("address")} />
            </Field>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Currency and delivery">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="currency" label="Currency code" error={e.currency?.message}>
                <Input id="currency" maxLength={3} {...register("currency")} />
              </Field>
              <Field id="currencyLocale" label="Number format locale" error={e.currencyLocale?.message} hint="e.g. en-PK">
                <Input id="currencyLocale" {...register("currencyLocale")} />
              </Field>
              <Field id="shippingFlatFee" label="Delivery fee" error={e.shippingFlatFee?.message}>
                <Input id="shippingFlatFee" inputMode="decimal" {...register("shippingFlatFee")} />
              </Field>
              <Field id="freeShippingThreshold" label="Free delivery from" error={e.freeShippingThreshold?.message} hint="0 turns free delivery off.">
                <Input id="freeShippingThreshold" inputMode="decimal" {...register("freeShippingThreshold")} />
              </Field>
            </div>
          </Panel>
          <Button type="submit" disabled={formState.isSubmitting}>
            Save settings
          </Button>
          {mode === "demo" ? (
            <Panel title="Demo data">
              <p className="text-[14px] text-muted">Clear demo products, orders, accounts and settings saved in this browser, and restore the sample catalogue.</p>
              <Button type="button" variant="subtle" className="mt-4" onClick={() => setConfirmReset(true)}>
                Reset demo data
              </Button>
            </Panel>
          ) : null}
        </div>
      </form>
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent title="Reset demo data?" description="Everything saved in this browser for the demo will be cleared. You'll be signed out.">
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={() => setConfirmReset(false)}>
              Keep data
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemoData();
                window.location.href = "/admin/login";
              }}
            >
              Reset demo data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
