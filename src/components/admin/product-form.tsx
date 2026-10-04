"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/types";
import { productFormSchema, type ProductFormInput } from "@/lib/validation";
import { useStoreData } from "@/context/store-data-context";
import { collections } from "@/data/collections";
import { newId, slugify } from "@/lib/utils";
import { AdminPageHeader, Panel } from "./admin-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import { Field } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

function toForm(p?: Product): ProductFormInput {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    details: p?.details.join("\n") ?? "",
    price: p ? String(p.price) : "",
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "",
    categoryId: p?.categoryId ?? "",
    collections: p?.collections ?? [],
    sizes: p?.sizes.join(", ") ?? "S, M, L, XL",
    colors: p?.colors.map((c) => `${c.name} ${c.hex}`).join(", ") ?? "",
    imageUrls: p?.images.map((i) => i.url).join("\n") ?? "",
    isFeatured: p?.isFeatured ?? false,
    isBestseller: p?.isBestseller ?? false,
    isNew: p?.isNew ?? true,
    status: p?.status ?? "active",
    defaultStock: "5",
  };
}

/** "Maroon #5B1A22, Ivory #EDE6D6" → colour list. Missing hex falls back to neutral grey. */
function parseColors(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const hex = entry.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "#777777";
      const name = entry.replace(hex, "").replace(/[:]/g, "").trim() || "Default";
      return { name, hex: hex.toUpperCase() };
    });
}

const list = (s: string, sep: RegExp) =>
  Array.from(new Set(s.split(sep).map((x) => x.trim()).filter(Boolean)));

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { getProduct, categories, saveProduct, hydrated } = useStoreData();
  const existing = productId ? getProduct(productId) : undefined;
  const [slugTouched, setSlugTouched] = useState(!!existing);
  const defaults = useMemo(() => toForm(existing), [existing]);

  const { register, handleSubmit, setValue, watch, formState } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    values: defaults,
  });
  const e = formState.errors;
  const chosenCollections = watch("collections");

  if (productId && !existing) {
    if (!hydrated) return null;
    return <EmptyState title="Product not found" body="It may have been deleted." action={{ label: "Back to products", href: "/admin/products" }} />;
  }

  async function onSubmit(v: ProductFormInput) {
    const id = existing?.id ?? newId();
    const sizes = list(v.sizes, /,/);
    const colors = parseColors(v.colors);
    const stock = Number(v.defaultStock);
    const variants: ProductVariant[] = [];
    for (const c of colors) {
      for (const s of sizes) {
        const prev = existing?.variants.find((x) => x.size === s && x.color === c.name);
        variants.push(
          prev ?? {
            id: newId(),
            size: s,
            color: c.name,
            sku: `ADH-${v.slug.replace(/-/g, "").slice(0, 10).toUpperCase()}-${c.name.replace(/\s/g, "").slice(0, 3).toUpperCase()}-${s.replace(/[\s.]/g, "")}`,
            stock,
            priceOverride: null,
          },
        );
      }
    }
    const product: Product = {
      id,
      slug: v.slug,
      name: v.name.trim(),
      description: v.description.trim(),
      details: list(v.details, /\n/),
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      categoryId: v.categoryId || null,
      collections: v.collections,
      colors,
      sizes,
      variants,
      images: list(v.imageUrls, /\n/).map((url) => ({ url, alt: v.name.trim() })),
      isFeatured: v.isFeatured,
      isBestseller: v.isBestseller,
      isNew: v.isNew,
      popularity: existing?.popularity ?? 0,
      status: v.status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const r = await saveProduct(product);
    if (!r.ok) {
      toast.error(r.error ?? "Couldn't save the product.");
      return;
    }
    toast.success(existing ? "Product saved" : "Product added", { description: product.name });
    router.push("/admin/products");
  }

  const nameReg = register("name");

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <AdminPageHeader
        title={existing ? `Edit ${existing.name}` : "Add product"}
        actions={
          <>
            <Button asChild variant="subtle" size="sm">
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={formState.isSubmitting}>
              {existing ? "Save product" : "Add product"}
            </Button>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title="Details">
            <div className="grid gap-5">
              <Field id="name" label="Name" error={e.name?.message}>
                <Input
                  id="name"
                  aria-invalid={!!e.name}
                  {...nameReg}
                  onChange={(ev) => {
                    void nameReg.onChange(ev);
                    if (!slugTouched) setValue("slug", slugify(ev.target.value));
                  }}
                />
              </Field>
              <Field id="slug" label="URL slug" error={e.slug?.message} hint="Used in the product link, e.g. /product/navy-suit">
                <Input id="slug" aria-invalid={!!e.slug} {...register("slug", { onChange: () => setSlugTouched(true) })} />
              </Field>
              <Field id="description" label="Description" error={e.description?.message}>
                <Textarea id="description" rows={4} aria-invalid={!!e.description} {...register("description")} />
              </Field>
              <Field id="details" label="Details and fabric" hint="One point per line.">
                <Textarea id="details" rows={4} {...register("details")} />
              </Field>
            </div>
          </Panel>
          <Panel title="Images">
            <Field id="imageUrls" label="Image URLs" error={e.imageUrls?.message} hint="One per line. Use /images/your-file.jpg for files in the public folder, or a full https URL.">
              <Textarea id="imageUrls" rows={3} aria-invalid={!!e.imageUrls} {...register("imageUrls")} />
            </Field>
          </Panel>
          <Panel title="Variants">
            <div className="grid gap-5 md:grid-cols-2">
              <Field id="sizes" label="Sizes" error={e.sizes?.message} hint="Comma separated, e.g. 38, 40, 42">
                <Input id="sizes" aria-invalid={!!e.sizes} {...register("sizes")} />
              </Field>
              <Field id="colors" label="Colours" error={e.colors?.message} hint="Name and hex, comma separated, e.g. Maroon #5B1A22">
                <Input id="colors" aria-invalid={!!e.colors} {...register("colors")} />
              </Field>
              <Field id="defaultStock" label="Starting stock for new variants" error={e.defaultStock?.message}>
                <Input id="defaultStock" inputMode="numeric" {...register("defaultStock")} />
              </Field>
            </div>
            {existing ? <p className="mt-4 text-[13px] text-muted">Existing variants keep their stock. Adjust quantities on the Inventory page.</p> : null}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Pricing">
            <div className="grid gap-5">
              <Field id="price" label="Price (PKR)" error={e.price?.message}>
                <Input id="price" inputMode="decimal" aria-invalid={!!e.price} {...register("price")} />
              </Field>
              <Field id="compareAtPrice" label="Compare-at price (optional)" error={e.compareAtPrice?.message} hint="Shown struck through when higher than the price.">
                <Input id="compareAtPrice" inputMode="decimal" {...register("compareAtPrice")} />
              </Field>
            </div>
          </Panel>
          <Panel title="Organisation">
            <div className="grid gap-5">
              <Field id="status" label="Status">
                <NativeSelect id="status" {...register("status")}>
                  <option value="active">Active, visible in store</option>
                  <option value="draft">Draft, hidden</option>
                </NativeSelect>
              </Field>
              <Field id="categoryId" label="Category" error={e.categoryId?.message}>
                <NativeSelect id="categoryId" aria-invalid={!!e.categoryId} {...register("categoryId")}>
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <fieldset>
                <legend className="text-[13px] font-medium">Collections</legend>
                <div className="mt-2 space-y-2">
                  {collections.map((c) => (
                    <label key={c.slug} className="flex items-center gap-2.5 text-[14px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-ink"
                        checked={chosenCollections.includes(c.slug)}
                        onChange={(ev) =>
                          setValue(
                            "collections",
                            ev.target.checked ? [...chosenCollections, c.slug] : chosenCollections.filter((x) => x !== c.slug),
                          )
                        }
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[13px] font-medium">Highlights</legend>
                <div className="mt-2 space-y-2 text-[14px]">
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-ink" {...register("isFeatured")} /> Featured
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-ink" {...register("isBestseller")} /> Bestseller
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" className="h-4 w-4 accent-ink" {...register("isNew")} /> New arrival
                  </label>
                </div>
              </fieldset>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
