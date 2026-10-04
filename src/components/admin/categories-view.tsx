"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validation";
import { useStoreData } from "@/context/store-data-context";
import { newId, slugify } from "@/lib/utils";
import { AdminPageHeader, Panel } from "./admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function CategoryDialog({ category, open, onOpenChange }: { category: Category | null; open: boolean; onOpenChange(o: boolean): void }) {
  const { saveCategory, categories } = useStoreData();
  const { register, handleSubmit, setValue, formState } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    values: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      sortOrder: String(category?.sortOrder ?? categories.length),
    },
  });
  const e = formState.errors;
  const nameReg = register("name");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={category ? "Edit category" : "Add category"}>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={handleSubmit(async (v) => {
            const r = await saveCategory({
              id: category?.id ?? newId(),
              name: v.name,
              slug: v.slug,
              description: v.description,
              sortOrder: Number(v.sortOrder),
              image: category?.image ?? null,
            });
            if (!r.ok) return void toast.error(r.error ?? "Couldn't save the category.");
            toast.success(category ? "Category saved" : "Category added");
            onOpenChange(false);
          })}
        >
          <Field id="cat-name" label="Name" error={e.name?.message}>
            <Input
              id="cat-name"
              {...nameReg}
              onChange={(ev) => {
                void nameReg.onChange(ev);
                if (!category) setValue("slug", slugify(ev.target.value));
              }}
            />
          </Field>
          <Field id="cat-slug" label="Slug" error={e.slug?.message}>
            <Input id="cat-slug" {...register("slug")} />
          </Field>
          <Field id="cat-desc" label="Description" error={e.description?.message}>
            <Textarea id="cat-desc" rows={3} {...register("description")} />
          </Field>
          <Field id="cat-order" label="Sort order" error={e.sortOrder?.message}>
            <Input id="cat-order" inputMode="numeric" {...register("sortOrder")} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="subtle" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {category ? "Save category" : "Add category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesView() {
  const { categories, products, deleteCategory } = useStoreData();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        intro="Categories organise the shop menu and filters."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus /> Add category
          </Button>
        }
      />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-[14px]">
            <thead className="text-[12.5px] text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="py-2.5 font-medium">Name</th>
                <th scope="col" className="py-2.5 font-medium">Slug</th>
                <th scope="col" className="py-2.5 font-medium">Products</th>
                <th scope="col" className="py-2.5 font-medium">Order</th>
                <th scope="col" className="py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-3">
                    <span className="font-medium">{c.name}</span>
                    <span className="block max-w-md truncate text-[12.5px] text-muted">{c.description}</span>
                  </td>
                  <td className="py-3 text-muted">/category/{c.slug}</td>
                  <td className="py-3">{products.filter((p) => p.categoryId === c.id).length}</td>
                  <td className="py-3">{c.sortOrder}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => {
                          setEditing(c);
                          setOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <CategoryDialog category={editing} open={open} onOpenChange={setOpen} />
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent title="Delete category?" description="Products in this category stay in the catalogue without a category.">
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={() => setToDelete(null)}>
              Keep category
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!toDelete) return;
                const r = await deleteCategory(toDelete.id);
                if (r.ok) toast.success("Category deleted");
                else toast.error(r.error ?? "Couldn't delete the category.");
                setToDelete(null);
              }}
            >
              Delete category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
