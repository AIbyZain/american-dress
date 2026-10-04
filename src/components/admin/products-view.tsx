"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useStoreData } from "@/context/store-data-context";
import { AdminPageHeader, Panel } from "./admin-shell";
import { productStock } from "@/lib/catalog";
import { usePrice } from "@/components/shared/price";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ProductsView() {
  const { products, categoryById, deleteProduct } = useStoreData();
  const fmt = usePrice();
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase()));

  return (
    <>
      <AdminPageHeader
        title="Products"
        intro={`${products.length} products in the catalogue`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus /> Add product
            </Link>
          </Button>
        }
      />
      <Panel>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <Input id="product-search" placeholder="Search by name or slug" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="text-[12.5px] text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="py-2.5 font-medium">Product</th>
                <th scope="col" className="py-2.5 font-medium">Category</th>
                <th scope="col" className="py-2.5 font-medium">Price</th>
                <th scope="col" className="py-2.5 font-medium">Stock</th>
                <th scope="col" className="py-2.5 font-medium">Status</th>
                <th scope="col" className="py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const stock = productStock(p);
                return (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-mist">
                          <SmartImage src={p.images[0]?.url} alt="" sizes="44px" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                            {p.name}
                          </Link>
                          <div className="mt-0.5 flex gap-1.5">
                            {p.isFeatured ? <Badge variant="gold">Featured</Badge> : null}
                            {p.isBestseller ? <Badge variant="outline">Bestseller</Badge> : null}
                            {p.isNew ? <Badge variant="outline">New</Badge> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{p.categoryId ? categoryById[p.categoryId]?.name ?? "None" : "None"}</td>
                    <td className="py-3">{fmt(p.price)}</td>
                    <td className="py-3">
                      <span className={stock === 0 ? "text-danger" : stock < 8 ? "text-gold-dark" : ""}>{stock}</span>
                      <span className="text-muted"> / {p.variants.length} variants</span>
                    </td>
                    <td className="py-3">
                      <Badge variant={p.status === "active" ? "success" : "muted"}>{p.status === "active" ? "Active" : "Draft"}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label={`Edit ${p.name}`}>
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} onClick={() => setPending(p)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!list.length ? <p className="py-8 text-center text-[14px] text-muted">No products match “{q}”.</p> : null}
        </div>
      </Panel>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent title="Delete product?" description={pending ? `${pending.name} will be removed from the store. Past orders keep their line items.` : undefined}>
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={() => setPending(null)}>
              Keep product
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={async () => {
                if (!pending) return;
                setBusy(true);
                const r = await deleteProduct(pending.id);
                setBusy(false);
                if (r.ok) toast.success("Product deleted", { description: pending.name });
                else toast.error(r.error ?? "Couldn't delete the product.");
                setPending(null);
              }}
            >
              Delete product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
