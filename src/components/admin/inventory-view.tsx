"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useStoreData } from "@/context/store-data-context";
import { AdminPageHeader, Panel } from "./admin-shell";
import { productStock } from "@/lib/catalog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/select";

function StockInput({ productId, variantId, stock, label }: { productId: string; variantId: string; stock: number; label: string }) {
  const { setVariantStock } = useStoreData();
  const [value, setValue] = useState(String(stock));
  const [saving, setSaving] = useState(false);
  async function commit() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
      setValue(String(stock));
      toast.error("Enter a whole number of 0 or more.");
      return;
    }
    if (n === stock) return;
    setSaving(true);
    const r = await setVariantStock(productId, variantId, n);
    setSaving(false);
    if (r.ok) toast.success("Stock updated", { description: `${label}: ${n}` });
    else {
      toast.error(r.error ?? "Couldn't update stock.");
      setValue(String(stock));
    }
  }
  return (
    <Input
      aria-label={`Stock for ${label}`}
      inputMode="numeric"
      value={value}
      disabled={saving}
      onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className="h-9 w-20 text-center"
    />
  );
}

export function InventoryView() {
  const { products } = useStoreData();
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const rows = products.flatMap((p) => p.variants.map((v) => ({ p, v })));
  const shown = rows.filter(({ v }) => (filter === "out" ? v.stock === 0 : filter === "low" ? v.stock > 0 && v.stock <= 3 : true));
  const total = products.reduce((s, p) => s + productStock(p), 0);

  return (
    <>
      <AdminPageHeader title="Inventory" intro={`${total} units across ${rows.length} variants. Edit a number and press Enter to save.`} />
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="inv-filter" className="text-[13px] text-muted">
            Show
          </label>
          <div className="w-48">
            <NativeSelect id="inv-filter" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-9">
              <option value="all">All variants</option>
              <option value="low">Low stock (1–3)</option>
              <option value="out">Out of stock</option>
            </NativeSelect>
          </div>
          <span className="text-[13px] text-muted">{shown.length} shown</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[14px]">
            <thead className="text-[12.5px] text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="py-2.5 font-medium">Product</th>
                <th scope="col" className="py-2.5 font-medium">Variant</th>
                <th scope="col" className="py-2.5 font-medium">SKU</th>
                <th scope="col" className="py-2.5 font-medium">Status</th>
                <th scope="col" className="py-2.5 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ p, v }) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 font-medium">{p.name}</td>
                  <td className="py-2.5 text-muted">
                    {v.size}, {v.color}
                  </td>
                  <td className="py-2.5 text-[12.5px] text-muted">{v.sku}</td>
                  <td className="py-2.5">
                    {v.stock === 0 ? <Badge variant="danger">Out</Badge> : v.stock <= 3 ? <Badge variant="gold">Low</Badge> : <Badge variant="success">In stock</Badge>}
                  </td>
                  <td className="py-2.5">
                    <StockInput key={`${v.id}-${v.stock}`} productId={p.id} variantId={v.id} stock={v.stock} label={`${p.name} ${v.size} ${v.color}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
